import('./app.js').catch(() => {
  const status = document.getElementById('status');
  status.className = 'status error';
  status.textContent = 'We couldn’t load the guest book. Check your connection and reload this page, or contact Kalyani or Sidharth.';
  const retry = document.createElement('button');
  retry.className = 'button secondary';
  retry.textContent = 'Reload guest book';
  retry.style.marginLeft = '12px';
  retry.onclick = () => location.reload();
  status.append(retry);
});
