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
      if (mq.matches) return; /* phones: the sidebar is collapsed, so skip the per-scroll layout reads that make touch scrolling jank */
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
    mq.addEventListener('change', update);
    update();
  }

  /* service query forms (service pages): floating labels, domain toggle, and send via the Worker (/api/contact) */
  const qf = document.querySelector('.svc-form');
  if (qf) {
    const note = qf.querySelector('.form__note'), btn = qf.querySelector('.form__btn'), domainField = qf.querySelector('.field--domain');
    const { topic, source, event } = qf.dataset;
    const say = (msg, bad) => { note.textContent = msg; note.classList.toggle('is-error', !!bad); };
    qf.querySelectorAll('.field').forEach(f => {
      const input = f.querySelector('input, textarea');
      const sync = () => f.classList.toggle('is-filled', input.value.trim() !== '');
      input.addEventListener('input', sync); sync();
    });
    qf.querySelectorAll('input[name="has_domain"]').forEach(r => r.addEventListener('change', () => { domainField.hidden = r.value !== 'Yes'; }));
    qf.addEventListener('submit', async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(qf)), v = k => (d[k] || '').trim();
      if (!v('name') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) { say('Please fill in your name and a valid email.', true); return; }
      // every field with a data-label goes into the message; a fieldset contributes its checked radio
      const lines = [...qf.querySelectorAll('[data-label]')]
        .map(el => [el.dataset.label, el.matches('fieldset') ? el.querySelector(':checked')?.value || '' : el.value.trim()])
        .filter(l => l[1]).map(([k, val]) => k + (k.endsWith('?') ? ' ' : ': ') + val);
      const payload = { name: v('name'), email: v('email'), phone: v('phone'), website: d.website || '', subject: topic + (v('brand') ? ': ' + v('brand') : ''), message: `New ${topic.toLowerCase()} from the ${source} page.\n\n` + (lines.join('\n') || 'No further details given.') };
      btn.disabled = true; say('Sending...');
      try {
        const res = await fetch(qf.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || 'Something went wrong.');
        say('Thank you! We have your details and will get back to you soon.');
        if (window.gtag) gtag('event', 'generate_lead', { form_name: event });
        qf.reset(); if (domainField) domainField.hidden = true; qf.querySelectorAll('.field').forEach(f => f.classList.remove('is-filled'));
      } catch (err) {
        say(err.message || 'Sorry, we could not send your query. Please email growwthgarden@gmail.com.', true);
      } finally { btn.disabled = false; }
    });
  }

  /* website cost calculator (cost guide post): every range comes from the guide's own tables */
  const calc = document.querySelector('.calc:not([data-calc])');
  if (calc) {
    // type: [hours low, hours high, default pages, default hosting, build time, build time with AI]
    // hours are set so that a small agency (₹1,000 – ₹2,000 / hr) lands in the type's price range from section 2
    const TYPES = {
      template: [10, 15, 5, 'shared', 'Days to 2 weeks', '2–4 hours'],
      landing: [15, 30, 1, 'shared', '1–3 weeks', '2–6 hours'],
      basic: [40, 50, 8, 'shared', '2–6 weeks', '2–3 days'],
      smb: [50, 100, 15, 'shared', '4–8 weeks', '3–4 days'],
      corporate: [120, 300, 25, 'vps', '6–10 weeks', '1–2 weeks'],
      ecom: [80, 400, 15, 'vps', '8–16 weeks', '1–2 weeks'],
      marketplace: [600, 1000, 25, 'cloud', '12–20 weeks', '3–4 weeks'],
      app: [300, 1250, 15, 'cloud', '3–6 months', '1–1.5 months'],
      enterprise: [1500, 5000, 50, 'dedicated', '4–12 months', '2–3 months'],
    };
    // hourly rates from section 6
    const BUILDERS = { freelancer: [500, 2000, 'freelancer'], agency: [1000, 2000, 'small agency'], full: [1000, 5000, 'full-service agency'] };
    const HOSTING = { shared: [2000, 10000], vps: [10000, 50000], cloud: [30000, 100000], dedicated: [96000, 360000] };
    const SEO = { none: [0, 0], basic: [8000, 30000], agency: [15000, 100000] };
    const ADDONS = { media: [10000, 100000, 'Photography / video'], logo: [1500, 5000, 'Logo design'], legal: [10000, 50000, 'Privacy policy and terms'], a11y: [30000, 150000, 'Accessibility compliance'] };

    const round = n => n < 1000 ? Math.round(n / 10) * 10 : n < 10000 ? Math.round(n / 100) * 100 : Math.round(n / 1000) * 1000;
    const inr = n => '₹' + round(n).toLocaleString('en-IN');
    const range = ([a, b]) => a === b ? inr(a) : inr(a) + ' – ' + inr(b);
    const add = (x, y) => [x[0] + y[0], x[1] + y[1]];
    const scale = (x, k) => [x[0] * k, x[1] * k];
    const sum = ls => ls.reduce((s, l) => add(s, l[1]), [0, 0]);
    const out = k => calc.querySelector(`[data-out="${k}"]`);
    const f = calc.elements;

    const update = () => {
      const t = TYPES[f.type.value], b = BUILDERS[f.builder.value];
      const once = [], yearly = [];
      once.push([`Build: ${t[0]}–${t[1]} hrs at ₹${b[0].toLocaleString('en-IN')}–${b[1].toLocaleString('en-IN')} / hr (${b[2]})`, [t[0] * b[0], t[1] * b[1]]]);
      once.push(f.design.value === 'custom' ? ['Custom design', [30000, 80000]] : ['Premium theme', [3000, 10000]]);
      const pages = Math.min(200, Math.max(1, parseInt(f.pages.value, 10) || 1));
      if (f.copy.checked) once.push([`Copywriting (${pages} page${pages > 1 ? 's' : ''})`, [2000 * pages, 10000 * pages]]);
      for (const k in ADDONS) if (f[k].checked) once.push([ADDONS[k][2], ADDONS[k].slice(0, 2)]);
      if (f.buffer.checked) once.push(['20% contingency', scale(sum(once), .2)]);

      yearly.push(['Domain', [500, 2000]], ['Hosting', HOSTING[f.hosting.value]]);
      if (f.maint.checked) { const base = add(once[0][1], once[1][1]); yearly.push(['Maintenance (15–20% of build)', [base[0] * .15, base[1] * .2]]); }
      if (f.email.checked) yearly.push(['Business email', [12000, 60000]]);
      if (f.seo.value !== 'none') yearly.push(['SEO', scale(SEO[f.seo.value], 12)]);

      // running costs are shown per month or per year; the year-one total always uses the yearly figure
      const monthly = f.period.value === 'month', per = monthly ? ' / month' : ' / year';
      const running = yearly.map(([n, v]) => [n + per, monthly ? scale(v, 1 / 12) : v]);
      const gst = f.gst.checked ? 1.18 : 1;
      if (gst > 1) { once.push(['18% GST on the build', scale(sum(once), .18)]); running.push(['18% GST' + per, scale(sum(running), .18)]); }

      const build = sum(once), runYear = scale(sum(yearly), gst);
      out('build').textContent = range(build);
      out('runlabel').textContent = monthly ? 'Running costs per month' : 'Running costs per year';
      out('run').textContent = range(sum(running));
      out('total').textContent = range(add(build, runYear));
      out('time').textContent = `${t[4]} (${t[5]} with AI)`;
      out('lines').innerHTML = [...once, ...running].map(([n, v]) => `<li><span>${n}</span><b>${range(v)}</b></li>`).join('');
    };

    f.type.addEventListener('change', () => { const t = TYPES[f.type.value]; f.pages.value = t[2]; f.hosting.value = t[3]; });
    f.pages.addEventListener('input', () => { f.copy.checked = true; });
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    calc.addEventListener('submit', e => e.preventDefault());
    update();
  }

  /* ecommerce cost calculator (ecommerce cost guide post): every range comes from that guide's own tables */
  const ecalc = document.querySelector('.calc[data-calc="ecom"]');
  if (ecalc) {
    // tier: [hours low, hours high, custom design range, build time, build time with AI]
    // hours are set so that a small agency (₹1,000 – ₹2,000 / hr) on Shopify or WooCommerce lands in the tier's range from section 2
    const TIERS = {
      starter: [40, 75, [30000, 80000], '2–4 weeks', '3–5 days'],
      mid: [150, 200, [80000, 150000], '4–8 weeks', '1–2 weeks'],
      advanced: [400, 500, [100000, 250000], '8–16 weeks', '3–4 weeks'],
      enterprise: [1000, 1750, [300000, 700000], '16–36 weeks', '2–3 months'],
    };
    const BUILDERS = { freelancer: [500, 2000, 'freelancer'], agency: [1000, 2000, 'small agency'], full: [1000, 5000, 'full-service agency'] };
    // platform: [hours multiplier, label, monthly running lines]
    const PLATFORMS = {
      shopify: [1, 'Shopify', [['Shopify apps', [3000, 15000]]]],
      woo: [1, 'WooCommerce', [['Hosting', [1000, 5000]], ['Plugins', [1000, 5000]]]],
      magento: [1.4, 'Magento', [['Hosting and extensions', [5000, 25000]]]],
      custom: [1.8, 'Custom', [['Hosting and services', [5000, 30000]]]],
    };
    // Shopify India plans billed yearly: [name, ₹ per month, Shopify fee per order with a third-party gateway]
    const SHOPIFY = [['Basic', 1499, .02], ['Grow', 5599, .01], ['Advanced', 22680, .006]];
    const SEO = { none: [0, 0], basic: [10000, 30000], agency: [15000, 50000] };
    const ADDONS = {
      gateway: [10000, 25000, 'Payment gateway integration'], shipping: [20000, 50000, 'Shipping / courier API'],
      gstinv: [15000, 40000, 'GST invoicing and e-way bills'], crm: [50000, 200000, 'CRM or ERP integration'],
      pwa: [50000, 200000, 'Progressive web app'], app: [250000, 2000000, 'Native mobile apps'],
      photo: [20000, 200000, 'Product photography'], content: [15000, 100000, 'Product and category content'],
      legal: [10000, 150000, 'Legal and policy pages'],
    };
    const GATEWAY = .0236; // 2% + 18% GST on the fee

    const round = n => n < 1000 ? Math.round(n / 10) * 10 : n < 10000 ? Math.round(n / 100) * 100 : Math.round(n / 1000) * 1000;
    const inr = n => '₹' + round(n).toLocaleString('en-IN');
    const range = ([a, b]) => round(a) === round(b) ? inr(a) : inr(a) + ' – ' + inr(b);
    const add = (x, y) => [x[0] + y[0], x[1] + y[1]];
    const scale = (x, k) => [x[0] * k, x[1] * k];
    const sum = ls => ls.reduce((s, l) => add(s, l[1]), [0, 0]);
    const out = k => ecalc.querySelector(`[data-out="${k}"]`);
    const f = ecalc.elements;

    const update = () => {
      const t = TIERS[f.tier.value], b = BUILDERS[f.builder.value], p = PLATFORMS[f.platform.value];
      const gmv = +f.gmv.value || 0;
      const once = [], monthly = [], fees = [];
      const hrs = [Math.round(t[0] * p[0]), Math.round(t[1] * p[0])];
      once.push([`Build: ${hrs[0]}–${hrs[1]} hrs at ₹${b[0].toLocaleString('en-IN')}–${b[1].toLocaleString('en-IN')} / hr (${b[2]}, ${p[1]})`, [hrs[0] * b[0], hrs[1] * b[1]]]);
      once.push(f.design.value === 'custom' ? ['Custom design', t[2]] : ['Premium theme', [5000, 30000]]);
      for (const k in ADDONS) if (f[k].checked) once.push([ADDONS[k][2], ADDONS[k].slice(0, 2)]);
      if (f.buffer.checked) once.push(['15% contingency', scale(sum(once), .15)]);

      monthly.push(['Domain', [500 / 12, 2000 / 12]]);
      if (f.platform.value === 'shopify') {
        const plan = SHOPIFY.reduce((best, pl) => (pl[1] + pl[2] * gmv < best[1] + best[2] * gmv ? pl : best));
        monthly.push([`Shopify ${plan[0]} plan (cheapest for your sales)`, [plan[1], plan[1]]]);
        if (gmv) monthly.push([`Shopify per-order fee (${plan[2] * 100}%)`, [plan[2] * gmv, plan[2] * gmv]]);
      }
      for (const l of p[2]) monthly.push(l);
      if (f.maint.checked) { const base = add(once[0][1], once[1][1]); monthly.push(['Maintenance (15–20% of build a year)', [base[0] * .15 / 12, base[1] * .2 / 12]]); }
      if (f.seo.value !== 'none') monthly.push(['SEO and content', SEO[f.seo.value]]);
      if (gmv) fees.push(['Gateway fees (2.36% of sales)', [GATEWAY * gmv, GATEWAY * gmv]]);

      // running costs shown per month or per year; GST goes on the build and services, not on gateway fees (already included)
      const gst = f.gst.checked ? 1.18 : 1, yearly = f.period.value === 'year', k = yearly ? 12 : 1, per = yearly ? ' / year' : ' / month';
      const running = [...monthly, ...fees].map(([n, v]) => [n + per, scale(v, k)]);
      if (gst > 1) { once.push(['18% GST on the build', scale(sum(once), .18)]); running.push(['18% GST on services' + per, scale(sum(monthly), .18 * k)]); }

      const build = sum(once), runYear = add(scale(sum(monthly), 12 * gst), scale(sum(fees), 12));
      out('build').textContent = range(build);
      out('runlabel').textContent = yearly ? 'Running costs per year' : 'Running costs per month';
      out('run').textContent = range(sum(running));
      out('total').textContent = range(add(build, runYear));
      out('time').textContent = `${t[3]} (${t[4]} with AI)`;
      out('lines').innerHTML = [...once, ...running].map(([n, v]) => `<li><span>${n}</span><b>${range(v)}</b></li>`).join('');
    };

    ecalc.addEventListener('input', update);
    ecalc.addEventListener('change', update);
    ecalc.addEventListener('submit', e => e.preventDefault());
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
