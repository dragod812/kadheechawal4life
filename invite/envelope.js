(() => {
  const intro = document.querySelector('.envelope-intro');
  // Deep links and restored scroll positions take guests straight to their place.
  if (!intro || location.hash || scrollY > 10) return;
  const seal = intro.querySelector('button');
  const content = [...document.body.children].filter(el => el !== intro && ['MAIN', 'HEADER', 'A'].includes(el.tagName));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let opening = false;
  let touchStart = null;
  function open() {
    if (opening) return;
    opening = true;
    intro.classList.add('envelope-opening');
    const delay = reduced.matches ? 0 : 1750;
    setTimeout(() => {
      intro.classList.add('envelope-away');
      content.forEach(el => el.inert = false);
      document.body.classList.remove('envelope-closed');
      const title = document.querySelector('#invite-title');
      title.tabIndex = -1;
      title.focus({preventScroll: true});
      setTimeout(() => { intro.hidden = true; }, reduced.matches ? 0 : 650);
    }, delay);
  }
  seal.addEventListener('click', open);
  intro.addEventListener('wheel', event => { if (event.deltaY > 8) open(); }, {passive: true});
  intro.addEventListener('touchstart', event => { touchStart = event.touches[0]?.clientY; }, {passive: true});
  intro.addEventListener('touchmove', event => { if (touchStart !== null && touchStart - event.touches[0].clientY > 24) open(); }, {passive: true});
  intro.addEventListener('keydown', event => {
    if (['ArrowDown', 'PageDown', ' ', 'Escape'].includes(event.key)) { event.preventDefault(); open(); }
  });
  intro.hidden = false;
  content.forEach(el => el.inert = true);
  document.body.classList.add('envelope-closed');
  seal.focus({preventScroll: true});
})();
