(() => {
  const dialog = document.querySelector('#image-dialog');
  const links = [...document.querySelectorAll('a[data-zoom]')];
  const image = document.querySelector('#dialog-image');
  const caption = document.querySelector('#dialog-caption');
  const full = document.querySelector('#dialog-full');
  let current = 0;
  let opener;
  function display(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    image.src = link.href;
    image.alt = link.dataset.caption || link.querySelector('img')?.alt || 'Design view';
    caption.textContent = image.alt;
    full.href = link.href;
  }
  if (typeof dialog.showModal === 'function') {
    links.forEach((link, index) => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        opener = link;
        display(index);
        dialog.showModal();
        document.body.classList.add('dialog-open');
      });
    });
    document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
    document.querySelector('#dialog-prev').addEventListener('click', () => display(current - 1));
    document.querySelector('#dialog-next').addEventListener('click', () => display(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        display(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      opener?.focus({preventScroll: true});
    });
  }
  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.section-nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-10% 0px -65% 0px'});
    ['venue', 'guests', 'couple'].forEach(id => observer.observe(document.getElementById(id)));
  }
})();
