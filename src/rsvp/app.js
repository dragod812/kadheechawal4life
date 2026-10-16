import * as backend from './backend.js';

const $ = id => document.getElementById(id);
let user = null, role = 'guest', record = null, rooms = null, guests = [], confirmation = null, pendingName = '', pendingPhone = '';
let accessStop, roomsStop, authVersion = 0, resendAt = 0, activePanel = 'guest';
const staff = () => role === 'admin' || role === 'hotel';
const show = (id, visible) => { $(id).hidden = !visible; };
const text = (id, value) => { $(id).textContent = value; };
function status(message = '', kind = '') { text('status', message); $('status').className = `status ${kind}`; }
function errorMessage(error) {
  const messages = {
    'auth/invalid-phone-number': 'Please enter a valid phone number with its country code.',
    'auth/invalid-verification-code': 'That code doesn’t look right. Check the SMS and try again.',
    'auth/code-expired': 'That code has expired. Request a new code and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little before trying again.',
    'auth/quota-exceeded': 'SMS sign-in is temporarily unavailable. Please contact Kalyani or Sidharth.',
    'auth/captcha-check-failed': 'Phone verification could not finish. Try again in your regular browser.',
    'auth/operation-not-allowed': 'Phone sign-in isn’t available yet. Please contact Kalyani or Sidharth.',
    'auth/unauthorized-domain': 'Sign-in isn’t enabled at this address. Please use the wedding website.',
    'auth/network-request-failed': 'We couldn’t connect to phone verification. Check your connection, or open this page in Chrome or Safari if you’re using an in-app browser.',
    'permission-denied': 'Your access has changed or this action is not permitted. Refresh or sign in again.',
    'unavailable': 'We couldn’t reach the wedding guest book. Check your connection and try again.'
  };
  return messages[error.code] || (error.code ? 'Something went wrong. Please try again.' : error.message);
}
async function action(container, work) {
  const controls = [...container.querySelectorAll('button')];
  controls.forEach(control => control.disabled = true);
  status();
  try { await work(); } catch (error) { status(errorMessage(error), 'error'); }
  finally { controls.forEach(control => control.disabled = false); }
}
function phoneNumber(value) {
  const normalized = value.trim().replace(/[\s().-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) throw new Error('Include a valid country code, for example +91 or +1, followed by your phone number.');
  return normalized;
}
function personName(value) {
  const name = value.trim();
  if (!name || name.length > 100) throw new Error('Please enter a full name (up to 100 characters).');
  return name;
}
function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}
function updateAttendance() {
  const attending = $('rsvp-form').elements.attending.value === 'yes';
  show('attendance-details', attending);
  show('companion-fields', attending && $('plus-one').checked);
  $('plus-one-name').required = attending && $('plus-one').checked;
  for (const id of ['plus-one', 'plus-one-name', 'arrival-date', 'arrival-time', 'arrival-note']) $(id).disabled = !attending;
  $('plus-one-name').disabled = !attending || !$('plus-one').checked;
}
function companionRoom(guest) {
  if (!guest.plusOne) return '';
  const override = guest.rooms?.plusOneName === guest.plusOneName ? guest.rooms?.plusOneRoom : '';
  return override || guest.rooms?.guestRoom || '';
}
function renderMyRooms() {
  const container = $('my-rooms');
  container.replaceChildren();
  show('my-rooms', record?.attending === 'yes');
  if (record?.attending !== 'yes') return;
  container.append(node('h3', '', 'Your stay'));
  container.append(node('p', '', `${record.name}: ${rooms?.guestRoom ? `Room ${rooms.guestRoom}` : 'Room to be assigned'}`));
  if (record.plusOne) container.append(node('p', '', `${record.plusOneName}: ${companionRoom({ ...record, rooms }) ? `Room ${companionRoom({ ...record, rooms })}` : 'Room to be assigned'}`));
}
async function loadRsvp() {
  const session = authVersion;
  const next = await backend.readRsvp(user.uid);
  if (session !== authVersion) return;
  record = next;
  $('rsvp-form').reset();
  $('guest-name').value = record?.name || pendingName || user?.displayName || '';
  if (record) $('rsvp-form').elements.attending.value = record.attending;
  $('plus-one').checked = record?.plusOne || false;
  $('plus-one-name').value = record?.plusOneName || '';
  $('arrival-date').value = record?.arrivalDate || '';
  $('arrival-time').value = record?.arrivalTime || '';
  $('arrival-note').value = record?.arrivalNote || '';
  $('arrival-section').open = Boolean(record?.arrivalDate || record?.arrivalNote);
  text('rsvp-summary', record ? record.attending === 'yes' ? `We have you down for ${record.plusOne ? 'two' : 'one'}. We can’t wait to see you!` : 'Thank you for letting us know. You’ll be with us in spirit.' : 'A few little details, and we’ll take it from here.');
  show('reload-rsvp', false);
  updateAttendance(); renderMyRooms();
}
function selectPanel(panel) {
  if (panel === 'staff' && !staff() || panel === 'access' && role !== 'admin') return;
  activePanel = panel;
  for (const name of ['guest', 'staff', 'access']) {
    show(`${name}-panel`, name === panel);
    $(`${name}-tab`).classList.toggle('active', name === panel);
    if (name === panel) $(`${name}-tab`).setAttribute('aria-current', 'page');
    else $(`${name}-tab`).removeAttribute('aria-current');
  }
}
async function refreshGuests() {
  const session = authVersion;
  const next = await backend.readGuests();
  if (session !== authVersion || !staff()) return;
  guests = next;
  renderGuests();
}
function renderGuests() {
  const attending = guests.filter(g => g.attending === 'yes');
  const total = attending.reduce((n,g) => n + (g.plusOne ? 2 : 1), 0);
  const needsRoom = g => g.attending === 'yes' && (!g.rooms?.guestRoom || g.plusOne && !companionRoom(g));
  const missing = attending.reduce((n,g) => n + (!g.rooms?.guestRoom ? 1 : 0) + (g.plusOne && !companionRoom(g) ? 1 : 0), 0);
  $('stats').replaceChildren(...[[total, 'People attending'], [guests.filter(g => g.attending === 'no').length, 'Declined responses'], [missing, 'People awaiting rooms']].map(([count,label]) => {
    const card = node('div','stat'); card.append(node('strong','',count), node('span','',label)); return card;
  }));
  const search = $('guest-search').value.toLowerCase().trim(), filter = $('guest-filter').value;
  const filtered = guests.filter(g => `${g.name} ${g.phone} ${g.plusOneName}`.toLowerCase().includes(search) && (filter === 'all' || (filter === 'unassigned' ? needsRoom(g) : g.attending === filter)));
  const list = $('guest-list'); list.replaceChildren();
  if (!filtered.length) list.append(node('p','empty', guests.length ? 'No guests match this search.' : 'No RSVPs yet. Responses will appear here.'));
  for (const guest of filtered) {
    const card = node('article','guest-card');
    const top = node('div','guest-top'); const heading = node('div');
    heading.append(node('h3','',guest.name), node('p','guest-meta',guest.phone));
    top.append(heading,node('span', `badge${guest.attending === 'no' ? ' declined' : ''}`, guest.attending === 'yes' ? guest.plusOne ? 'Attending · 2 people' : 'Attending · 1 person' : 'Declined'));
    card.append(top);
    if (guest.plusOne) card.append(node('p','guest-meta',`Plus-one: ${guest.plusOneName}`));
    if (guest.attending === 'yes') {
      const date = guest.arrivalDate ? new Intl.DateTimeFormat('en-IN', {day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(`${guest.arrivalDate}T12:00:00+05:30`)) : '';
      card.append(node('p','guest-meta', date ? `Arrival: ${date}${guest.arrivalTime ? ` at ${guest.arrivalTime} IST` : ' · time to follow'}` : 'Arrival plans to follow'));
      if (guest.arrivalNote) card.append(node('p','guest-meta',guest.arrivalNote));
      const form = node('form','room-form');
      const field = (label,value,id,target = form) => {
        const group = node('div'), input = node('input'), title = node('label','',label);
        input.id = id; input.value = value; input.maxLength = 40; input.placeholder = 'Not assigned'; title.htmlFor = id;
        group.append(title,input); target.append(group); return input;
      };
      const mainRoom = field(`Room · ${guest.name}`, guest.rooms?.guestRoom || '', `room-${guest.id}`);
      let plusRoom = null, separateRoom = null;
      if (guest.plusOne) {
        const companion = node('div','companion-room'), choice = node('label','check'), extra = node('div');
        separateRoom = node('input'); separateRoom.type = 'checkbox';
        const override = guest.rooms?.plusOneName === guest.plusOneName ? guest.rooms?.plusOneRoom || '' : '';
        separateRoom.checked = Boolean(override);
        choice.append(separateRoom,node('span','',`Assign a different room for ${guest.plusOneName}`));
        companion.append(choice,node('p','hint',`Shares ${guest.name}’s room by default.`),extra); form.append(companion);
        plusRoom = field(`Room · ${guest.plusOneName}`,override,`plus-room-${guest.id}`,extra);
        const updateSeparateRoom = () => {
          extra.hidden = !separateRoom.checked;
          plusRoom.disabled = !separateRoom.checked;
          plusRoom.required = separateRoom.checked;
        };
        separateRoom.addEventListener('change',updateSeparateRoom); updateSeparateRoom();
      }
      const submit = node('button','button secondary','Save rooms'); submit.type = 'submit'; form.append(submit);
      form.addEventListener('submit', event => { event.preventDefault(); action(form, async () => {
        const override = separateRoom?.checked ? plusRoom.value.trim() : '';
        if (separateRoom?.checked && !override) throw new Error('Enter a separate room number, or turn off the different-room option to share the guest’s room.');
        await backend.saveRooms(guest, mainRoom.value.trim(), override);
        await refreshGuests(); status(`Room assignments saved for ${guest.name}.`, 'success');
      }); });
      card.append(form);
    }
    list.append(card);
  }
}
async function refreshTeam() {
  const session = authVersion;
  const team = await backend.readTeam();
  if (session !== authVersion || role !== 'admin') return;
  const list = $('access-list'); list.replaceChildren();
  for (const member of team) {
    const row = node('div','access-row'), info = node('div');
    info.append(node('p','',member.name), node('p','guest-meta',`${member.phone} · ${member.role === 'admin' ? 'Admin' : 'Hotel / planner'}${member.phone === user.phoneNumber ? ' · You' : ''}`)); row.append(info);
    if (member.phone !== user.phoneNumber) {
      const actions = node('div','access-actions'), edit = node('button','quiet','Edit'), remove = node('button','quiet','Remove');
      edit.type = remove.type = 'button';
      edit.onclick = () => { $('staff-name').value = member.name; $('staff-phone').value = member.phone; $('staff-role').value = member.role; $('staff-name').focus(); };
      remove.onclick = () => { if (confirm(`Remove team access for ${member.name}? They will still be able to use their own RSVP.`)) action(row, async () => { await backend.removeAccess(member.phone); await refreshTeam(); status('Team access removed.', 'success'); }); };
      actions.append(edit,remove); row.append(actions);
    }
    list.append(row);
  }
}
$('phone-form').addEventListener('submit', event => { event.preventDefault(); action($('phone-form'), async () => {
  pendingName = personName($('login-name').value); pendingPhone = phoneNumber($('phone').value);
  confirmation = await backend.sendCode(pendingPhone); resendAt = Date.now() + 60000;
  show('phone-form', false); show('code-form', true); text('code-help', `Enter the code sent to ${pendingPhone}.`); $('code').focus();
  status('Your verification code is on its way.');
}); });
$('code-form').addEventListener('submit', event => { event.preventDefault(); action($('code-form'), async () => { if (!confirmation) throw new Error('Request a verification code first.'); await confirmation.confirm($('code').value.trim()); }); });
$('change-phone').onclick = () => { confirmation = null; show('phone-form', true); show('code-form', false); $('code').value = ''; status(); $('phone').focus(); };
$('resend').onclick = () => action($('code-form'), async () => {
  if (Date.now() < resendAt) throw new Error(`Please wait ${Math.ceil((resendAt - Date.now()) / 1000)} seconds before requesting another code.`);
  confirmation = await backend.sendCode(pendingPhone); resendAt = Date.now() + 60000; status('A new code is on its way.');
});
$('sign-out').onclick = () => action(document.querySelector('.site-header'), () => backend.logout());
$('rsvp-form').addEventListener('change', updateAttendance);
$('rsvp-form').addEventListener('submit', event => { event.preventDefault(); action($('rsvp-form'), async () => {
  const yes = $('rsvp-form').elements.attending.value === 'yes', plusOne = yes && $('plus-one').checked;
  const value = { name: personName($('guest-name').value), phone: user.phoneNumber, attending: yes ? 'yes' : 'no', plusOne, plusOneName: plusOne ? personName($('plus-one-name').value) : '', arrivalDate: yes ? $('arrival-date').value : '', arrivalTime: yes ? $('arrival-time').value : '', arrivalNote: yes ? $('arrival-note').value.trim() : '' };
  if (value.arrivalTime && !value.arrivalDate) throw new Error('Please add an arrival date with your arrival time.');
  try { await backend.saveRsvp(user.uid, value, record?.revision || 0); }
  catch (error) { show('reload-rsvp', true); throw error; }
  await loadRsvp(); status('Your RSVP is saved. You can come back anytime to update it.', 'success');
}); });
$('reload-rsvp').onclick = () => action($('rsvp-form'), loadRsvp);
$('guest-tab').onclick = () => { selectPanel('guest'); status(); };
$('staff-tab').onclick = () => { selectPanel('staff'); action($('staff-panel'), refreshGuests); };
$('access-tab').onclick = () => { selectPanel('access'); action($('access-panel'), refreshTeam); };
$('refresh-guests').onclick = () => action($('staff-panel'), refreshGuests);
$('guest-search').oninput = renderGuests; $('guest-filter').onchange = renderGuests;
$('access-form').addEventListener('submit', event => { event.preventDefault(); action($('access-form'), async () => {
  const phone = phoneNumber($('staff-phone').value), name = personName($('staff-name').value), nextRole = $('staff-role').value;
  if (phone === user.phoneNumber) throw new Error('Another admin must change your access. You cannot change your own role.');
  if (!confirm(`Give ${name} (${phone}) ${nextRole === 'admin' ? 'admin access, including managing other team members' : 'hotel / planner access to guest details and room assignments'}?`)) return;
  await backend.saveAccess(phone,name,nextRole); $('access-form').reset(); await refreshTeam(); status('Team access saved.', 'success');
}); });
window.addEventListener('offline', () => status('You’re offline. Reconnect before saving any changes.', 'error'));
show('test-banner', backend.emulator);
if (!backend.configured) { status(); show('unavailable', true); }
else backend.watchAuth(async nextUser => {
  const session = ++authVersion;
  accessStop?.(); roomsStop?.(); role = 'guest'; user = nextUser; record = null; rooms = null; guests = [];
  $('guest-list').replaceChildren(); $('access-list').replaceChildren(); $('stats').replaceChildren(); $('rsvp-form').reset(); $('access-form').reset();
  show('staff-tab', false); show('access-tab', false); show('sign-out', Boolean(user)); show('account', false); show('login', !user); show('my-rooms', false);
  selectPanel('guest'); status();
  if (!user) {
    show('phone-form',true); show('code-form',false); $('phone-form').reset(); $('code').value = '';
    confirmation = null; pendingName = ''; pendingPhone = ''; return;
  }
  status('Opening your guest book…'); text('signed-in-phone', `Signed in · ${user.phoneNumber}`);
  try {
    if (pendingName) await backend.saveLoginName(user, pendingName);
    await loadRsvp(); if (session !== authVersion) return;
    pendingName = '';
    show('account', true); status();
    accessStop = backend.watchAccess(user.phoneNumber, nextRole => {
      if (session !== authVersion) return;
      role = nextRole; show('staff-tab',staff()); show('access-tab',role === 'admin');
      if (!staff()) { guests = []; $('guest-list').replaceChildren(); $('stats').replaceChildren(); }
      if (role !== 'admin') $('access-list').replaceChildren();
      if (activePanel === 'staff' && !staff() || activePanel === 'access' && role !== 'admin') selectPanel('guest');
    }, error => { role = 'guest'; show('staff-tab',false); show('access-tab',false); $('guest-list').replaceChildren(); $('access-list').replaceChildren(); selectPanel('guest'); status(errorMessage(error),'error'); });
    roomsStop = backend.watchRooms(user.uid, nextRooms => { if (session !== authVersion) return; rooms = nextRooms; renderMyRooms(); }, error => status(errorMessage(error),'error'));
  } catch (error) { status(`${errorMessage(error)} Sign out and try again.`, 'error'); }
});
