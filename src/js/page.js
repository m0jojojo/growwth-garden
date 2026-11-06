(() => {
  /* mobile menu */
  const menu = document.querySelector('.menu'), navEl = document.querySelector('.nav');
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    navEl.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', open);
  });

  /* services dropdown */
  const navItem = document.querySelector('.nav__item');
  if (navItem) {
    const trigger = navItem.querySelector('.nav__trigger');
    const setOpen = open => { navItem.classList.toggle('is-open', open); trigger.setAttribute('aria-expanded', open); };
    trigger.addEventListener('click', e => { e.preventDefault(); setOpen(!navItem.classList.contains('is-open')); });
    document.addEventListener('click', e => { if (!navItem.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  /* article share: copy link */
  document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const note = btn.parentElement.querySelector('.share__note');
    try { await navigator.clipboard.writeText(btn.dataset.copy); if (note) note.textContent = 'Link copied'; }
    catch { if (note) note.textContent = 'Press Ctrl+C to copy'; prompt('Copy this link', btn.dataset.copy); }
    setTimeout(() => { if (note) note.textContent = ''; }, 2200);
  }));

  /* article sidebar: keep the current section highlighted; open on desktop, collapsed on mobile */
  const toc = document.querySelector('.post-toc');
  if (toc) {
    const mq = matchMedia('(max-width: 900px)');
    const sync = () => { toc.open = !mq.matches; };
    sync(); mq.addEventListener('change', sync);
    toc.classList.add('is-spy');
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const heads = links.map(a => document.getElementById(a.hash.slice(1)));
    let ticking = false;
    const update = () => {
      ticking = false;
      let cur = -1;
      heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top <= innerHeight * .3) cur = i; });
      links.forEach((a, i) => a.classList.toggle('is-active', i === cur));
      toc.querySelectorAll('.post-toc__item').forEach(li => {
        const on = !!li.querySelector('a.is-active');
        li.classList.toggle('is-active', li.querySelector(':scope > a')?.classList.contains('is-active') || on);
        li.classList.toggle('is-open', on);
      });
      const a = toc.querySelector('.post-toc__item > a.is-active, .post-toc__sub a.is-active');
      if (a && !mq.matches) { const r = a.getBoundingClientRect(), t = toc.getBoundingClientRect(); if (r.top < t.top + 60 || r.bottom > t.bottom - 10) toc.scrollTop += r.top - t.top - t.height / 2; }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .1 })
    .from('.header', { y: -30, autoAlpha: 0, duration: .8 })
    .from('.page-hero__title', { y: -40, autoAlpha: 0, duration: .9 }, .15)
    .from('.crumbs', { y: -20, autoAlpha: 0, duration: .8 }, .4);
  gsap.from('.footer__grid > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .12, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true } });
})();
