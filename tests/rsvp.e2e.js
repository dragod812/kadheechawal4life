import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { readFile, mkdir } from 'node:fs/promises';

const project = 'demo-wedding-rsvp';
let env;
test.beforeAll(async () => {
  await mkdir('qa/rsvp',{recursive:true});
  env = await initializeTestEnvironment({projectId:project,firestore:{rules:await readFile('firestore.rules','utf8')}});
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c => {
    await setDoc(doc(c.firestore(),'access','+15555550103'),{name:'Family admin (0103)',role:'admin'});
    await setDoc(doc(c.firestore(),'access','+15555550104'),{name:'Example Hotel',role:'hotel'});
  });
});
test.afterAll(async () => env.cleanup());
async function login(page, phone, name) {
  await page.goto('/invite/rsvp/?emulator=1');
  await page.locator('#login-name').fill(name);
  await page.getByLabel('Phone number',{exact:true}).fill(phone);
  await page.getByLabel('I agree to receive').check();
  await page.getByRole('button',{name:'Send verification code'}).click();
  await expect(page.getByLabel('Verification code',{exact:true})).toBeVisible();
  const response = await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${project}/verificationCodes`);
  const {verificationCodes} = await response.json();
  const code = verificationCodes.filter(c => c.phoneNumber === phone).at(-1).code;
  await page.getByLabel('Verification code',{exact:true}).fill(code);
  await page.getByRole('button',{name:'Verify & continue'}).click();
  await expect(page.getByRole('heading',{name:'Your RSVP',exact:true})).toBeVisible();
}
test('complete RSVP, shared rooms with optional override, role management, edits and mobile layouts', async ({ browser }) => {
  const guestContext = await browser.newContext(), teamContext = await browser.newContext(), hotelContext = await browser.newContext();
  const guest = await guestContext.newPage(), admin = await teamContext.newPage(), hotel = await hotelContext.newPage();
  const errors=[]; for (const page of [guest,admin,hotel]) page.on('pageerror',error=>errors.push(error.message));
  await login(guest,'+15555550101','Example Guest');
  await expect(guest.getByRole('button',{name:'Guests & rooms',exact:true})).toBeHidden();
  await guest.getByLabel('Joyfully accepts').check();
  await guest.getByLabel('I’m bringing a plus-one').check();
  await guest.getByLabel('Your plus-one’s full name').fill('Example Companion');
  await guest.getByText('Arrival plans',{exact:false}).first().click();
  await guest.getByLabel('Arrival date',{exact:true}).fill('2027-02-25');
  await guest.getByLabel('Approximate arrival time').fill('15:30');
  await guest.getByLabel('Travel details or a note').fill('Arriving together from the airport.');
  await guest.getByRole('button',{name:'Save my RSVP'}).click();
  await expect(guest.getByRole('status')).toContainText('Your RSVP is saved');
  await guest.reload();
  await expect(guest.locator('#guest-name')).toHaveValue('Example Guest');
  await expect(guest.getByLabel('Your plus-one’s full name')).toHaveValue('Example Companion');
  await login(admin,'+15555550103','Example Admin');
  await env.withSecurityRulesDisabled(async c => {
    expect((await getDoc(doc(c.firestore(),'access','+15555550103'))).data().name).toBe('Example Admin');
  });
  await admin.getByRole('button',{name:'Guests & rooms',exact:true}).click();
  await expect(admin.getByRole('heading',{name:'Example Guest',exact:true})).toBeVisible();
  await expect(admin.locator('#stats')).toContainText('2People attending');
  await login(hotel,'+15555550104','Example Hotel');
  await expect(hotel.getByRole('button',{name:'Team access',exact:true})).toBeHidden();
  await hotel.getByRole('button',{name:'Guests & rooms',exact:true}).click();
  await expect(hotel.getByLabel('Assign a different room for Example Companion')).not.toBeChecked();
  await expect(hotel.getByLabel('Room · Example Companion',{exact:true})).toBeHidden();
  await hotel.getByLabel('Room · Example Guest',{exact:true}).fill('201');
  await hotel.getByRole('button',{name:'Save rooms'}).click();
  await expect(hotel.getByRole('status')).toContainText('Room assignments saved');
  await expect(guest.locator('#my-rooms')).toContainText('Example Guest: Room 201');
  await expect(guest.locator('#my-rooms')).toContainText('Example Companion: Room 201');
  await expect(hotel.locator('#stats')).toContainText('0People awaiting rooms');
  await hotel.screenshot({path:'qa/rsvp/shared-room-default.png',fullPage:true});
  await hotel.setViewportSize({width:390,height:844});
  expect(await hotel.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await hotel.screenshot({path:'qa/rsvp/shared-room-mobile.png',fullPage:true});
  // Sharing follows a changed primary room without re-entering the companion's room.
  await hotel.getByLabel('Room · Example Guest',{exact:true}).fill('203');
  await hotel.getByRole('button',{name:'Save rooms'}).click();
  await expect(hotel.getByRole('status')).toContainText('Room assignments saved');
  await expect(guest.locator('#my-rooms')).toContainText('Example Companion: Room 203');
  await hotel.getByLabel('Assign a different room for Example Companion').check();
  await hotel.getByLabel('Room · Example Companion',{exact:true}).fill('202');
  expect(await hotel.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await hotel.getByRole('button',{name:'Save rooms'}).click();
  await expect(hotel.getByRole('status')).toContainText('Room assignments saved');
  await expect(guest.locator('#my-rooms')).toContainText('Example Guest: Room 203');
  await expect(guest.locator('#my-rooms')).toContainText('Room 202');
  await hotel.reload();
  await hotel.getByRole('button',{name:'Guests & rooms',exact:true}).click();
  await expect(hotel.getByLabel('Assign a different room for Example Companion')).toBeChecked();
  await expect(hotel.getByLabel('Room · Example Companion',{exact:true})).toHaveValue('202');
  // Removing an override restores automatic sharing.
  await hotel.getByLabel('Assign a different room for Example Companion').uncheck();
  await hotel.getByRole('button',{name:'Save rooms'}).click();
  await expect(hotel.getByRole('status')).toContainText('Room assignments saved');
  await expect(guest.locator('#my-rooms')).toContainText('Example Companion: Room 203');
  await hotel.getByLabel('Assign a different room for Example Companion').check();
  await hotel.getByLabel('Room · Example Companion',{exact:true}).fill('202');
  await hotel.getByRole('button',{name:'Save rooms'}).click();
  await expect(hotel.getByRole('status')).toContainText('Room assignments saved');
  await expect(guest.locator('#my-rooms')).toContainText('Example Companion: Room 202');
  await admin.getByRole('button',{name:'Refresh list'}).click();
  await expect(admin.getByLabel('Room · Example Guest',{exact:true})).toHaveValue('203');
  await admin.screenshot({path:'qa/rsvp/admin-desktop.png',fullPage:true});
  await guest.setViewportSize({width:390,height:844});
  await guest.screenshot({path:'qa/rsvp/guest-mobile.png',fullPage:true});
  await admin.getByRole('button',{name:'Team access',exact:true}).click();
  await admin.getByLabel('Full name',{exact:true}).fill('Example Second Admin');
  await admin.getByLabel('Phone with country code').fill('+15555550105');
  await admin.getByLabel('Access',{exact:true}).selectOption('admin');
  admin.once('dialog',dialog=>dialog.accept());
  await admin.getByRole('button',{name:'Save team member'}).click();
  await expect(admin.locator('#access-list')).toContainText('Example Second Admin');
  await env.withSecurityRulesDisabled(async c => {
    expect((await getDoc(doc(c.firestore(),'access','+15555550105'))).data().role).toBe('admin');
  });
  // A replaced companion shares the primary room, not the prior companion's override.
  await guest.getByLabel('Your plus-one’s full name').fill('New Companion');
  await guest.getByRole('button',{name:'Save my RSVP'}).click();
  await expect(guest.locator('#my-rooms')).toContainText('New Companion: Room 203');
  // A stale hotel form cannot overwrite edits made by the guest.
  await hotel.getByLabel('Room · Example Guest',{exact:true}).fill('301');
  await hotel.getByRole('button',{name:'Save rooms'}).click();
  await expect(hotel.getByRole('status')).toContainText('Refresh the list');
  await hotel.getByRole('button',{name:'Refresh list'}).click();
  await expect(hotel.getByLabel('Assign a different room for New Companion')).not.toBeChecked();
  await expect(hotel.getByLabel('Room · New Companion',{exact:true})).toBeHidden();
  await guest.getByLabel('With love, declines').check();
  await guest.getByRole('button',{name:'Save my RSVP'}).click();
  await expect(guest.getByRole('status')).toContainText('Your RSVP is saved');
  await expect(guest.locator('#my-rooms')).toBeHidden();
  await hotel.getByRole('button',{name:'Refresh list'}).click();
  await expect(hotel.locator('#guest-list')).toContainText('Declined');
  await expect(hotel.getByRole('button',{name:'Save rooms'})).toBeHidden();
  // Restored attendance starts without an accidental plus-one or old arrival plans.
  await guest.getByLabel('Joyfully accepts').check();
  await expect(guest.getByLabel('I’m bringing a plus-one')).not.toBeChecked();
  await guest.getByRole('button',{name:'Save my RSVP'}).click();
  await expect(guest.getByRole('status')).toContainText('Your RSVP is saved');
  await admin.getByRole('button',{name:'Guests & rooms',exact:true}).click();
  for (const width of [320,390,768,1440]) {
    await admin.setViewportSize({width,height:900});
    expect(await admin.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await guest.setViewportSize({width,height:900});
    expect(await guest.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  }
  await admin.setViewportSize({width:390,height:844});
  await admin.screenshot({path:'qa/rsvp/admin-mobile.png',fullPage:true});
  await guest.getByRole('button',{name:'Sign out',exact:true}).click();
  await expect(guest.getByRole('heading',{name:'Come on in.'})).toBeVisible();
  await expect(guest.locator('#account')).toBeHidden();
  await guest.setViewportSize({width:390,height:844});
  await guest.screenshot({path:'qa/rsvp/login-mobile.png',fullPage:true});
  expect(errors).toEqual([]);
  await guestContext.close(); await teamContext.close(); await hotelContext.close();
});
test('invitation RSVP is reachable on a phone', async ({page}) => {
  await page.setViewportSize({width:320,height:800});
  await page.goto('/invite/');
  const primaryRsvp = page.locator('.hero-actions').getByRole('link',{name:'RSVP',exact:true});
  await expect(primaryRsvp).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await primaryRsvp.click();
  await expect(page).toHaveURL(/\/invite\/rsvp\//);
});
