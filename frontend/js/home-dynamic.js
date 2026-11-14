/* js/home-dynamic.js : home page ke dashboard-er shathe jore.
   Courses -> /api/courses, numbers + WhatsApp -> /api/settings, photos -> /api/content/slot */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = async u => { try { const r = await fetch(u, { credentials: 'same-origin' }); return r.ok ? await r.json() : null; } catch { return null; } };
  const setImg = (p, url) => { p.style.setProperty('--im', `url('${String(url).replace(/'/g, '%27')}')`); p.classList.add('has'); };

  // dashboard theke photo manage hoy, tai visitor-er "＋ Photo" button lukai
  document.querySelectorAll('.ph>.up').forEach(e => e.remove());

  const GRAD = ['#0b2a6f,#1a47b5', '#7a0f22,#e11d3a', '#143d9c,#3f78ff', '#5a0c1a,#c2162f', '#0a1d57,#2b56c8', '#8a1428,#ff4d62'];

  function renderCourses(list) {
    const acc = document.getElementById('acc');
    if (!acc || !list.length) return; // course na thakle ager static card thakbe
    acc.innerHTML = list.slice(0, 6).map((c, i) => {
      const photo = c.image ? `style="--im:url('${esc(String(c.image).replace(/'/g, '%27'))}')"` : '';
      const key = c.image ? '' : `data-k="course${i}"`;
      return `<div class="pn${i ? '' : ' on'}" tabindex="0" style="--g:${GRAD[i % GRAD.length]}">
        <div class="ph par${c.image ? ' has' : ''}" ${key} ${photo}><span class="lb">${esc(c.title)}</span></div>
        <div class="nm" data-n="0${i + 1}">${esc(c.title)}</div>
        <div class="bd"><h3>${esc(c.title)}</h3><p>${esc(c.shortDesc || '')}</p><a href="course-details.html?course=${esc(c.slug || '')}">Learn more →</a></div></div>`;
    }).join('');
    const P = [...acc.children]; let cur = 0, run = true;
    try { auto = false; } catch (e) {} // ager inline timer bondho
    const act = i => { P.forEach((p, k) => p.classList.toggle('on', k == i)); cur = i; };
    P.forEach((p, i) => ['mouseenter', 'focus', 'click'].forEach(ev => p.addEventListener(ev, () => {
      run = false; act(i);
      if (ev == 'click' && innerWidth <= 800) setTimeout(() => scrollTo({ top: scrollY + p.getBoundingClientRect().top - 90, behavior: 'smooth' }), 450);
    })));
    setInterval(() => run && innerWidth > 800 && act((cur + 1) % P.length), 3200);
  }

  function applySettings(s) {
    if (!s) return;
    if (s.heroShowcasePhoto) {
      const el = document.getElementById('heroShowcaseImg');
      if (el) el.src = s.heroShowcasePhoto;
    }
    const nums = [s.students, s.satisfaction, s.teachers, s.branches];
    document.querySelectorAll('.sg [data-n]').forEach((el, i) => { if (+nums[i] > 0) el.dataset.n = +nums[i]; });
    const wa = String(s.whatsapp || '').replace(/\D/g, '');
    if (wa) {
      const w = document.getElementById('waBtn');
      if (w) w.href = 'https://wa.me/' + wa + '?text=Hello%20UKA%20Technical%20Institute%2C%20I%20want%20to%20know%20more.';
      document.querySelectorAll('.wa2').forEach(a => a.href = 'https://wa.me/' + wa);
    }
  }

  function applySlots(items) {
    (items || []).forEach(it => {
      if (!it.key || !it.image) return;
      document.querySelectorAll('.ph[data-k="' + it.key + '"]').forEach(p => setImg(p, it.image));
    });
  }

  function renderHomeNews(items) {
    const grid = document.getElementById('homeNewsGrid');
    if (!grid) return;

    const list = (items && items.length) ? items.slice(0, 3) : [];
    if (!list.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--mut);padding:30px">Stay tuned for upcoming British Council announcements and IELTS preparation guides.</p>';
      return;
    }

    grid.innerHTML = list.map(item => {
      const x = item.extra || {};
      const cat = x.category || item.category || 'IELTS Preparation';
      const readTime = x.readTime || '5 min read';
      const author = x.author || 'UKA Academic Directorate';
      const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Latest Update';
      const img = item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
      const desc = item.subtitle || item.description || '';

      return `
        <a class="h-news-card" href="news-details.html?id=${encodeURIComponent(item._id)}">
          <div class="h-news-thumb">
            <img src="${esc(img)}" alt="${esc(item.title)}" loading="lazy">
            <span class="h-news-cat">${esc(cat)}</span>
          </div>
          <div class="h-news-body">
            <div class="h-news-meta">
              <span>${dateStr}</span>
              <span>•</span>
              <b>${esc(readTime)}</b>
            </div>
            <h3 class="h-news-title">${esc(item.title)}</h3>
            <p class="h-news-desc">${esc(desc)}</p>
            <div class="h-news-foot">
              <div class="h-news-author">
                <i>U</i>
                <span>${esc(author)}</span>
              </div>
              <span class="h-news-more">Read Guide →</span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  (async () => {
    const [c, s, sl, news] = await Promise.all([
      get('/api/courses'),
      get('/api/settings'),
      get('/api/content/slot'),
      get('/api/content/news')
    ]);
    const list = (Array.isArray(c) ? c : (c && c.items) || []).filter(x => x.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    renderCourses(list);
    applySettings(s);
    applySlots(Array.isArray(sl) ? sl : []);
    renderHomeNews(Array.isArray(news) ? news : []);
  })();
})();