(() => {
  /* mobile menu */
  const menu = document.querySelector('.menu'), navEl = document.querySelector('.nav');
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    navEl.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', open);
  });

  /* floating labels: keep the label up once a field has text */
  document.querySelectorAll('.field').forEach(f => {
    const input = f.querySelector('input, textarea');
    const sync = () => f.classList.toggle('is-filled', input.value.trim() !== '');
    input.addEventListener('input', sync); sync();
  });

  /* send through the Worker (/api/contact), which forwards the message with Resend */
  const form = document.querySelector('.form'), note = form.querySelector('.form__note'), btn = form.querySelector('.form__btn');
  const say = (msg, bad) => { note.textContent = msg; note.classList.toggle('is-error', !!bad); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email?.trim() || '') || !d.message?.trim()) { say('Please fill in your name, a valid email and your message.', true); return; }
    btn.disabled = true; say('Sending...');
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong.');
      say('Thank you! Your message has been sent. We will get back to you soon.');
      form.reset(); form.querySelectorAll('.field').forEach(f => f.classList.remove('is-filled'));
    } catch (err) {
      say(err.message || 'Sorry, we could not send your message. Please email growwthgarden@gmail.com.', true);
    } finally { btn.disabled = false; }
  });

  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  /* banner: header drops in, title falls in (fadeInDown), breadcrumb follows */
  gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .1 })
    .from('.header', { y: -30, autoAlpha: 0, duration: .8 })
    .from('.page-hero__title', { y: -40, autoAlpha: 0, duration: .9 }, .15)
    .from('.crumbs', { y: -20, autoAlpha: 0, duration: .8 }, .4);
  /* content: form and copy fade up */
  gsap.from('.form', { y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: '.contact', start: 'top 80%', once: true } });
  gsap.from('.info > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .12, delay: .15, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: '.contact', start: 'top 80%', once: true } });
  gsap.from('.footer__grid > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .12, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true } });
})();
