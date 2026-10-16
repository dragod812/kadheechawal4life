import { readFile } from 'node:fs/promises';
import { before, beforeEach, after, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let env;
const phones = { guest: '+15555550101', other: '+15555550102', admin: '+15555550103', hotel: '+15555550104' };
const db = who => env.authenticatedContext(who, { phone_number: phones[who], firebase: { sign_in_provider: 'phone' } }).firestore();
const rsvp = (overrides = {}) => ({ name: 'Example Guest', phone: phones.guest, attending:'yes', plusOne:true, plusOneName:'Example Companion', arrivalDate:'2027-02-25', arrivalTime:'15:30', arrivalNote:'', revision:1, updatedAt:serverTimestamp(), ...overrides });
const room = (who = 'hotel', overrides = {}) => ({ guestRoom:'201', plusOneRoom:'202', plusOneName:'Example Companion', updatedBy:who, updatedAt:serverTimestamp(), revision:1, ...overrides });
const grant = (who = 'admin', overrides = {}) => ({ name:'Example Team Member', role:'hotel', updatedBy:who, updatedAt:serverTimestamp(), ...overrides });
before(async () => { env = await initializeTestEnvironment({ projectId:'demo-wedding-rsvp', firestore:{ rules:await readFile('firestore.rules','utf8') } }); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(),'access',phones.admin), grant('seed',{name:'Admin',role:'admin'}));
    await setDoc(doc(context.firestore(),'access',phones.hotel), grant('seed',{name:'Hotel'}));
  });
});
after(async () => { await env.cleanup(); });
test('unauthenticated users cannot read or write guest data or enumerate staff',async () => {
  const anon = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon,'rsvps','guest')));
  await assertFails(getDocs(collection(anon,'access')));
  await assertFails(setDoc(doc(anon,'rsvps','guest'),rsvp()));
});
test('guest creates and updates only their own RSVP; no guest-list access',async () => {
  await assertSucceeds(setDoc(doc(db('guest'),'rsvps','guest'),rsvp()));
  await assertSucceeds(getDoc(doc(db('guest'),'rsvps','guest')));
  await assertFails(getDoc(doc(db('other'),'rsvps','guest')));
  await assertFails(getDocs(collection(db('guest'),'rsvps')));
  await assertFails(setDoc(doc(db('guest'),'rsvps','other'),rsvp()));
  await assertFails(updateDoc(doc(db('guest'),'rsvps','guest'),{ name:'Changed' }));
  await assertSucceeds(setDoc(doc(db('guest'),'rsvps','guest'),rsvp({name:'Changed',revision:2})));
  await assertFails(deleteDoc(doc(db('guest'),'rsvps','guest')));
});
test('rejects forged phone, privileged fields, invalid plus-one and arrival data',async () => {
  for (const invalid of [
    {phone:phones.admin}, {role:'admin'}, {guestRoom:'999'}, {name:''},
    {plusOneName:''}, {plusOne:false}, {attending:'maybe'}, {arrivalDate:'2027-02-31'},
    {arrivalTime:'25:00'}, {arrivalDate:'',arrivalTime:'10:30'}, {arrivalNote:'x'.repeat(501)},
    {attending:'no'}, {revision:3}, {updatedAt:new Date(0)}
  ]) await assertFails(setDoc(doc(db('guest'),'rsvps','guest'),rsvp(invalid)));
  await assertSucceeds(setDoc(doc(db('guest'),'rsvps','guest'),rsvp({attending:'no',plusOne:false,plusOneName:'',arrivalDate:'',arrivalTime:''})));
});
test('non-phone and anonymous identities cannot access records even with phone claim',async () => {
  for (const provider of ['anonymous','password']) {
    const forged = env.authenticatedContext('guest',{phone_number:phones.guest,firebase:{sign_in_provider:provider}}).firestore();
    await assertFails(setDoc(doc(forged,'rsvps','guest'),rsvp()));
  }
});
test('hotel and admin may read RSVPs but cannot change another guest response',async () => {
  await setDoc(doc(db('guest'),'rsvps','guest'),rsvp());
  for (const who of ['admin','hotel']) {
    await assertSucceeds(getDocs(collection(db(who),'rsvps')));
    await assertFails(updateDoc(doc(db(who),'rsvps','guest'),{attending:'no',revision:2,updatedAt:serverTimestamp()}));
  }
});
test('hotel assigns both rooms; only the party and staff can read them',async () => {
  await setDoc(doc(db('guest'),'rsvps','guest'),rsvp());
  await assertSucceeds(setDoc(doc(db('hotel'),'rooms','guest'),room()));
  await assertSucceeds(getDoc(doc(db('guest'),'rooms','guest')));
  await assertSucceeds(getDocs(collection(db('admin'),'rooms')));
  await assertFails(getDoc(doc(db('other'),'rooms','guest')));
  await assertFails(setDoc(doc(db('guest'),'rooms','guest'),room('guest',{revision:2})));
  await assertFails(setDoc(doc(db('hotel'),'rooms','guest'),room('admin',{revision:2})));
  await assertSucceeds(setDoc(doc(db('admin'),'rooms','guest'),room('admin',{revision:2,guestRoom:'301'})));
});
test('rooms require attending RSVP, current companion identity, and a fresh revision',async () => {
  await assertFails(setDoc(doc(db('hotel'),'rooms','guest'),room()));
  await setDoc(doc(db('guest'),'rsvps','guest'),rsvp());
  await assertFails(setDoc(doc(db('hotel'),'rooms','guest'),room('hotel',{plusOneName:'Someone Else'})));
  await setDoc(doc(db('hotel'),'rooms','guest'),room());
  await assertFails(setDoc(doc(db('hotel'),'rooms','guest'),room()));
  await setDoc(doc(db('guest'),'rsvps','guest'),rsvp({attending:'no',plusOne:false,plusOneName:'',arrivalDate:'',arrivalTime:'',revision:2}));
  await assertFails(setDoc(doc(db('hotel'),'rooms','guest'),room('hotel',{revision:2,plusOneName:'',plusOneRoom:''})));
});
test('only admins can manage staff; self-removal and self-demotion are denied',async () => {
  for (const who of ['guest','hotel']) {
    await assertFails(getDocs(collection(db(who),'access')));
    await assertFails(setDoc(doc(db(who),'access',phones.other),grant(who,{role:'admin'})));
  }
  await assertSucceeds(getDoc(doc(db('guest'),'access',phones.guest)));
  await assertFails(getDoc(doc(db('guest'),'access',phones.admin)));
  await assertSucceeds(setDoc(doc(db('admin'),'access',phones.other),grant('admin',{role:'admin'})));
  await assertSucceeds(getDocs(collection(db('other'),'rsvps')));
  await assertFails(setDoc(doc(db('admin'),'access',phones.admin),grant()));
  await assertFails(deleteDoc(doc(db('admin'),'access',phones.admin)));
  await assertFails(setDoc(doc(db('admin'),'access','not-a-phone'),grant()));
  await assertSucceeds(deleteDoc(doc(db('admin'),'access',phones.other)));
  await assertFails(getDocs(collection(db('other'),'rsvps')));
});
