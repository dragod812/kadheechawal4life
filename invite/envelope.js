(() => {
  'use strict';
  const intro = document.querySelector('.envelope-intro');
  if (!intro || location.hash) return;
  function resetOpeningPosition() {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }
  resetOpeningPosition();
  addEventListener('pageshow', () => { if (!released) resetOpeningPosition(); });
  const seal = intro.querySelector('button');
  const content = [...document.body.children].filter(el => el !== intro && ['MAIN', 'HEADER', 'A'].includes(el.tagName));
  let opening = false;
  let touchStart = null;
  let wheelDistance = 0;
  let clearFrame = 0;
  let released = false;

  function finish() {
    if (released) return;
    released = true;
    cancelAnimationFrame(clearFrame);
    intro.hidden = true;
    content.forEach(el => el.inert = false);
    document.body.classList.remove('envelope-closed');
    const title = document.querySelector('#invite-title');
    if (title) { title.tabIndex = -1; title.focus({preventScroll: true}); }
  }

  async function open() {
    if (opening) return;
    opening = true;
    resetOpeningPosition();
    intro.classList.add('envelope-opening');
    // Wait for a rendered closed frame before starting; animation completion,
    // rather than a guessed dismissal timer, controls when the cover is removed.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const animations = [];
    const animate = (selector, frames, duration, delay = 0) => {
      intro.querySelectorAll(selector).forEach(el => animations.push(el.animate(frames, {
        duration, delay, fill: 'forwards', easing: 'cubic-bezier(.32,0,.16,1)'
      })));
    };
    try {
      const hero = document.querySelector('.hero');
      if (hero) hero.animate([
        {transform: 'scale(1.045)', transformOrigin: '50% 30%'},
        {transform: 'scale(1)', transformOrigin: '50% 30%'}
      ], {duration: 3600, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards'});
      animate('.envelope-seal', [
        {transform: 'translate(-50%,-50%) rotate(-8deg)', opacity: 1, offset: 0},
        {transform: 'translate(-50%,-57%) rotate(-4deg) scale(1.06)', opacity: 1, offset: .45},
        {transform: 'translate(-50%,-85%) rotate(9deg) scale(1.11)', opacity: 0, offset: 1}
      ], 650);
      animate('.envelope-flap', [
        {transform: 'perspective(1900px) rotateX(0deg)', filter: 'drop-shadow(0 5px 4px #59472535)', opacity: 1, offset: 0},
        {transform: 'perspective(1900px) rotateX(-48deg)', filter: 'drop-shadow(0 22px 14px #59472530)', opacity: 1, offset: .45},
        {transform: 'perspective(1900px) rotateX(-88deg)', filter: 'drop-shadow(0 10px 8px #59472514)', opacity: 1, offset: .85},
        {transform: 'perspective(1900px) translateY(-16vh) rotateX(-89deg)', filter: 'drop-shadow(0 0 0 transparent)', opacity: 0, offset: 1}
      ], 1750, 280);
      animate('.envelope-left', [
        {transform: 'perspective(1900px) translateX(0) rotateY(0deg)'},
        {transform: 'perspective(1900px) translateX(-105vw) rotateY(-16deg)'}
      ], 2050, 1150);
      animate('.envelope-right', [
        {transform: 'perspective(1900px) translateX(0) rotateY(0deg)'},
        {transform: 'perspective(1900px) translateX(105vw) rotateY(16deg)'}
      ], 2050, 1210);
      animate('.envelope-pocket', [
        {transform: 'perspective(1900px) translateY(0) rotateX(0deg)'},
        {transform: 'perspective(1900px) translateY(105vh) rotateX(8deg)'}
      ], 2100, 1400);
      // Unlock on the actual visual exit, not the end of the long easing tail
      // or the independent garden camera settle. All changes happen in one frame.
      const left = intro.querySelector('.envelope-left');
      const right = intro.querySelector('.envelope-right');
      const pocket = intro.querySelector('.envelope-pocket');
      const flap = intro.querySelector('.envelope-flap');
      function releaseWhenClear() {
        if (released) return;
        const foldsClear = left.getBoundingClientRect().right <= 1
          && right.getBoundingClientRect().left >= innerWidth - 1
          && pocket.getBoundingClientRect().top >= innerHeight - 1;
        const flapClear = Number(getComputedStyle(flap).opacity) <= .01;
        if (foldsClear && flapClear) finish();
        else clearFrame = requestAnimationFrame(releaseWhenClear);
      }
      clearFrame = requestAnimationFrame(releaseWhenClear);
      // A failed/cancelled individual animation cannot strand the guest.
      await Promise.race([
        Promise.allSettled(animations.map(animation => animation.finished)),
        new Promise(resolve => setTimeout(resolve, 6000))
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
    if (['Enter', 'ArrowDown', 'PageDown', ' ', 'Escape'].includes(event.key)) { event.preventDefault(); open(); }
  });
  intro.hidden = false;
  content.forEach(el => el.inert = true);
  document.body.classList.add('envelope-closed');
  intro.tabIndex = -1;
  intro.focus({preventScroll: true});
})();
