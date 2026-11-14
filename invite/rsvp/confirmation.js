const dialog = document.getElementById('rsvp-confirmation');
const title = document.getElementById('confirmation-title');
const message = document.getElementById('confirmation-message');

dialog.querySelector('.confirmation-close').addEventListener('click', () => dialog.close());
document.getElementById('confirmation-edit').addEventListener('click', () => dialog.close());

dialog.addEventListener('close', () => {
  document.getElementById('guest-name').focus();
});

export function showRsvpConfirmation(attending) {
  if (typeof dialog.showModal !== 'function') return false;

  const isComing = attending === 'yes';
  title.textContent = isComing ? 'That’s a yes worth celebrating!' : 'We’ll miss having you there.';
  message.textContent = isComing
    ? 'Thanks for saying yes. February just got a little better.'
    : 'Thanks for letting us know. We’ll save you a good story.';
  dialog.showModal();
  title.focus();
  return true;
}
