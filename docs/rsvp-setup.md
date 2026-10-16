# Wedding RSVP

The invitation stays on GitHub Pages. `/invite/rsvp/` uses Firebase Phone Authentication and Cloud Firestore, with server-enforced rules in `firestore.rules`. No application server or Cloud Functions are required.

## Roles

| Role | Access |
| --- | --- |
| Guest | Phone-code sign-in; own name, yes/no RSVP, one named plus-one, optional arrival plans; view own party's rooms |
| Hotel / planner | Own RSVP plus all responses and arrival plans; assign a separate room to each person |
| Admin | All hotel/planner access plus grant/change/revoke team access by verified phone number |

Anyone with a verified phone number and the invitation link can respond. One phone number represents one primary guest and at most one companion. Existing Google Sheets and `/guest-estimation/` are not imported or synchronized. Counts cover submitted responses, not invited guests who have yet to respond.

Arrival details apply to the party and are stored as local Ahmedabad values (IST). Date can be January–March 2027; time and note are optional. Declining clears companion and arrival fields. Prior room records remain, but are hidden for declines and excluded from counts. Replacing a companion invalidates their displayed room until staff reassign it.

## Production setup

As of 2026-10-15, the dedicated project **`kadhee-chawal-wedding`** and its Web app exist. The default Firestore database is in **Mumbai (`asia-south1`)**, with delete protection enabled. The checked-in rules are deployed, the public Web config is populated, and the four owner-supplied admin numbers have been provisioned privately. Each admin supplies their own name at login; this updates their account and team name without changing their role.

Billing is linked and Authentication is initialized. Phone sign-in is enabled for India and US numbers. Authorized domains are `kadheechawal4life.com`, `kadhee-chawal-wedding.firebaseapp.com` and `kadhee-chawal-wedding.web.app`. No production test-phone bypasses are configured. Setup used the owner's authorized Google Cloud CLI credentials because the Firebase Console could not load its terms-status check.

Nine Firestore security tests and two browser suites pass against local emulators. Production checks verify the public API key's reCAPTCHA configuration, deployed rules and private admin grants. Actual SMS delivery still needs a first login from the live domain.

The steps below document the complete setup for recovery or a new environment; do not recreate the existing project or admin records.

1. Create a dedicated Firebase project in the owner's Google account, called **Kadhee Chawal Wedding**. Analytics is not needed.
2. Register a Web app. Put its **public web configuration** in `invite/rsvp/firebase-config.js` as `export const firebaseConfig = { ... };`. Never commit private keys, OAuth tokens, admin phone lists or guest records.
3. Create the default **Cloud Firestore Standard** database in production mode. Prefer `asia-south1` (Mumbai); confirm the immutable database location before creation.
4. Publish all of `firestore.rules` in Firestore → Rules. Never use open test-mode rules.
5. Enable Authentication → Phone. Authorize `kadheechawal4life.com`. Permit needed SMS regions, initially India and the US. Live SMS requires an eligible billing plan: review billing and SMS limits before opening traffic. Use fictional test numbers for prelaunch tests and remove those production bypasses afterward.
6. Bootstrap the first admin in **Firestore Console**, after the owner supplies their number. Create `access/{E.164 phone}` with `name` (string), `role` (`admin`, string), `updatedBy` (`console-bootstrap`, string), `updatedAt` (timestamp). Never put the real number in a public file. Clients cannot grant themselves access. This admin can add family and hotel/planner users through **Team access**. Users can update their own name but cannot change/remove their own role.
7. Build and verify locally, then publish only after config, rules, phone auth and the first admin are ready. Test real SMS from the live domain, guest save/reload and hotel room assignment.

Firebase's [phone sign-in guide](https://firebase.google.com/docs/auth/web/phone-auth) covers reCAPTCHA, consent, authorized domains and SMS regions. [Authentication limits](https://firebase.google.com/docs/auth/limits) covers billing/quotas. The login page includes phone-verification consent and the wedding-team data-use notice. Sessions last for the browser session; Firestore uses its default memory cache.

## Data and security

- `rsvps/{auth.uid}`: verified phone, name, attendance, companion, arrival fields, revision and server timestamp. Owner-only writes; staff can read all responses.
- `rooms/{auth.uid}`: primary/companion room strings, companion name at assignment, revision, updater UID and timestamp. Staff-only writes; staff and the party owner can read. Use the same room number for sharing.
- `access/{E.164 phone}`: name, `admin`/`hotel`, updater UID and timestamp. Users read their own role and can update only their own name and audit fields; admins manage the team.

The name entered during phone login is also saved as the Firebase Auth display name, so it survives a later session even before the guest submits an RSVP. Existing RSVP names remain editable in **Your RSVP**.

Rules validate every write and reject forged phones, extra fields and unauthorized writes. Transactions reject stale revisions, including room assignments made from a guest list that changed. User-provided strings use `textContent`, never HTML. Current role changes are subscribed in the UI and enforced on every database request.

## Development

Requires Node 22+ and Java 21+.

```sh
npm ci
npm run build
npm run test:rules
npx playwright install chromium
npm run test:e2e
```

On this Mac, prefix emulator commands with `PATH=/opt/homebrew/opt/openjdk/bin:$PATH` to avoid Java 11.

For manual local testing, run in separate terminals:

```sh
npx firebase emulators:start --project demo-wedding-rsvp --only auth,firestore
npm run serve
```

Open `http://127.0.0.1:4173/invite/rsvp/?emulator=1`. The auth emulator prints fictional verification codes. Emulator mode only works on loopback hosts; it cannot be enabled on the public domain. No real SMS is sent. Browser tests seed fictional staff roles only inside the emulator.

Source is in `src/rsvp/`; `npm run build` bundles the pinned Firebase SDK and app into committed `invite/rsvp/app.js`. The public `firebase-config.js` remains a separate runtime import. Unconfigured pages show an unavailable state and never pretend to save. Screenshots are ignored under `qa/rsvp/`. No guest data goes in static assets.

## Operations

Guests return using the same number. Staff use **Refresh list** for the latest responses; guest room assignments update live. Room-sharing policy is a family decision; the page records assignments, not hotel bookings. Remove team access when no longer needed and agree a retention period for the guest database.

The pre-existing `/guest-estimation/` remains a public planning snapshot. `noindex` discourages indexing but does not make it private.
