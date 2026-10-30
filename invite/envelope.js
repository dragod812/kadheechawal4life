(() => {
  'use strict';
  const intro = document.querySelector('.envelope-intro');
  if (!intro || location.hash) return;
  const seal = intro.querySelector('button');
  const content = [...document.body.children].filter(el => el !== intro && ['MAIN', 'HEADER', 'A'].includes(el.tagName));
  let opening = false;
  let touchStart = null;
  let wheelDistance = 0;

  function finish() {
    intro.hidden = true;
    content.forEach(el => el.inert = false);
    document.body.classList.remove('envelope-closed');
    const title = document.querySelector('#invite-title');
    if (title) { title.tabIndex = -1; title.focus({preventScroll: true}); }
  }

  async function open() {
    if (opening) return;
    opening = true;
    intro.classList.add('envelope-opening');
    // Wait for a rendered closed frame before starting; animation completion,
    // rather than a guessed dismissal timer, controls when the cover is removed.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const animations = [];
    const animate = (selector, frames, duration, delay = 0) => {
      intro.querySelectorAll(selector).forEach(el => animations.push(el.animate(frames, {
        duration, delay, fill: 'forwards', easing: 'cubic-bezier(.4,0,.2,1)'
      })));
    };
    try {
        animate('.envelope-seal', [{transform: 'translate(-50%,-50%) rotate(-8deg)', opacity: 1}, {transform: 'translate(-50%,-75%) rotate(12deg) scale(1.08)', opacity: 0}], 400);
        animate('.envelope-address, .envelope-hint', [{opacity: 1}, {opacity: 0}], 400);
        // A shallow paper fold uses ordinary transforms rather than relying on
        // nested 3D/backface compositing in Chromium and embedded webviews.
        animate('.envelope-flap', [
          {transform: 'translateY(0) scaleY(1)', opacity: 1, offset: 0},
          {transform: 'translateY(0) scaleY(.02)', opacity: 1, offset: .68},
          {transform: 'translateY(-35vh) scaleY(.02)', opacity: 0, offset: 1}
        ], 1150, 200);
        animate('.envelope-left', [{transform: 'translateX(0)'}, {transform: 'translateX(-105vw)'}], 1500, 850);
        animate('.envelope-right', [{transform: 'translateX(0)'}, {transform: 'translateX(105vw)'}], 1500, 850);
        animate('.envelope-pocket, .envelope-liner', [{transform: 'translateY(0)'}, {transform: 'translateY(105vh)'}], 1650, 950);
      // A failed/cancelled individual animation cannot strand the guest.
      await Promise.race([
        Promise.allSettled(animations.map(animation => animation.finished)),
        new Promise(resolve => setTimeout(resolve, 4500))
      ]);
    } finally { finish(); }
  }
  seal.addEventListener('click', open);
  intro.addEventListener('wheel', event => {
    wheelDistance = Math.max(0, wheelDistance + event.deltaY);
    if (wheelDistance > 12) open();
  }, {passive: true});
  intro.addEventListener('touchstart', event => { touchStart = event.touches[0]?.clientY; }, {passive: true});
  intro.addEventListener('touchmove', event => {
    if (touchStart !== null && touchStart - event.touches[0].clientY > 24) open();
  }, {passive: true});
  intro.addEventListener('keydown', event => {
    if (['ArrowDown', 'PageDown', ' ', 'Escape'].includes(event.key)) { event.preventDefault(); open(); }
  });
  intro.hidden = false;
  content.forEach(el => el.inert = true);
  document.body.classList.add('envelope-closed');
  seal.focus({preventScroll: true});
})();
