import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence, updateProfile } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, collection, getDoc, getDocs, setDoc, deleteDoc, runTransaction, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';

export const emulator = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('emulator') === '1';
const config = emulator ? { apiKey: 'demo-key', projectId: 'demo-wedding-rsvp', authDomain: 'demo-wedding-rsvp.firebaseapp.com' } : firebaseConfig;
export const configured = Boolean(config?.apiKey && config?.projectId && config?.authDomain);
let auth, db, verifier;
if (configured) {
  const app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  auth.useDeviceLanguage();
  if (emulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
}
export function watchAuth(callback) { return onAuthStateChanged(auth, callback); }
export function logout() { return signOut(auth); }
export async function saveLoginName(user, name) {
  await updateProfile(user, { displayName: name });
  // A verified staff member may update their own name, never their own role.
  const ref = doc(db, 'access', user.phoneNumber);
  await runTransaction(db, async transaction => {
    const entry = await transaction.get(ref);
    if (entry.exists() && entry.data().name !== name) {
      transaction.update(ref, { name, updatedBy: user.uid, updatedAt: serverTimestamp() });
    }
  });
}
export async function sendCode(phone) {
  await setPersistence(auth, browserSessionPersistence);
  verifier?.clear();
  verifier = new RecaptchaVerifier(auth, 'recaptcha', { size: 'invisible' });
  try { return await signInWithPhoneNumber(auth, phone, verifier); }
  catch (error) { verifier.clear(); verifier = null; throw error; }
}
export function watchAccess(phone, callback, error) {
  return onSnapshot(doc(db, 'access', phone), snapshot => callback(snapshot.data()?.role || 'guest'), error);
}
export async function readRsvp(uid) { const snapshot = await getDoc(doc(db, 'rsvps', uid)); return snapshot.data() || null; }
export function watchRooms(uid, callback, error) {
  return onSnapshot(doc(db, 'rooms', uid), snapshot => callback(snapshot.data() || null), error);
}
export async function saveRsvp(uid, value, revision) {
  const ref = doc(db, 'rsvps', uid);
  await runTransaction(db, async transaction => {
    const previous = await transaction.get(ref);
    if ((previous.data()?.revision || 0) !== revision) throw new Error('Your RSVP changed in another window. Load the latest RSVP before saving.');
    transaction.set(ref, { ...value, revision: revision + 1, updatedAt: serverTimestamp() });
  });
}
export async function readGuests() {
  const [guests, rooms] = await Promise.all([getDocs(collection(db, 'rsvps')), getDocs(collection(db, 'rooms'))]);
  const assignments = new Map(rooms.docs.map(d => [d.id, d.data()]));
  return guests.docs.map(d => ({ id: d.id, ...d.data(), rooms: assignments.get(d.id) || null })).sort((a,b) => a.name.localeCompare(b.name));
}
export async function saveRooms(guest, guestRoom, plusOneRoom) {
  const ref = doc(db, 'rooms', guest.id);
  await runTransaction(db, async transaction => {
    const [current, rooms] = await Promise.all([transaction.get(doc(db, 'rsvps', guest.id)), transaction.get(ref)]);
    if (current.data()?.revision !== guest.revision || (rooms.data()?.revision || 0) !== (guest.rooms?.revision || 0)) {
      throw new Error('This guest or their room assignment changed. Refresh the list before saving.');
    }
    transaction.set(ref, { guestRoom, plusOneRoom: guest.plusOne ? plusOneRoom : '', plusOneName: guest.plusOneName, revision: (guest.rooms?.revision || 0) + 1, updatedBy: auth.currentUser.uid, updatedAt: serverTimestamp() });
  });
}
export async function readTeam() {
  const snapshot = await getDocs(collection(db, 'access'));
  return snapshot.docs.map(d => ({ phone: d.id, ...d.data() })).sort((a,b) => a.name.localeCompare(b.name));
}
export function saveAccess(phone, name, role) { return setDoc(doc(db, 'access', phone), { name, role, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }); }
export function removeAccess(phone) { return deleteDoc(doc(db, 'access', phone)); }
