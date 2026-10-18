const dialog = document.querySelector('.reference-dialog');
const enlarged = dialog.querySelector('img');
const caption = dialog.querySelector('#reference-caption');
const source = dialog.querySelector('.dialog-source');
const fullSize = dialog.querySelector('.dialog-full');
let opener;

document.querySelectorAll('[data-reference]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    enlarged.src = link.href;
    enlarged.alt = link.querySelector('img').alt;
    caption.textContent = link.closest('figure').querySelector('figcaption').textContent;
    fullSize.href = link.href;
    const reference = link.dataset.original || link.dataset.source;
    source.hidden = !reference;
    if (reference) source.href = reference;
    else source.removeAttribute('href');
    source.textContent = link.dataset.original ? 'View original annotation ↗' : 'Original Pinterest reference ↗';
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  opener?.focus({preventScroll: true});
});

const navLinks = [...document.querySelectorAll('.event-nav a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, {rootMargin: '-20% 0px -65% 0px'});
  document.querySelectorAll('.event').forEach(section => observer.observe(section));
}
