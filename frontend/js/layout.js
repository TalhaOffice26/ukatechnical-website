/* js/layout.js : shob inner page-er header, footer, WhatsApp button, form handler.
   Page-e shudhu <script src="js/layout.js"></script> dile hobe. Menu/logo bodlate ei file-i edit koro. */
(function () {
  window.UKA = {
    esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    get: async u => { try { const r = await fetch(u); return r.ok ? await r.json() : []; } catch { return []; } }
  };
  const LOGO = 'logo.png';
  const M = [['IELTS Exam','ielts-exam.html',[['About IELTS','ielts-exam.html'],['IELTS Academic','ielts-academic.html'],['IELTS General Training','ielts-general.html'],['Exam Dates & Fees','exam-dates.html'],['Book Your Exam','book-exam.html']]],['Mock Test','mock-test.html',[['IELTS Mock Test','mock-test.html'],['Spoken English Test','spoken-test.html'],['Book a Mock Test','book-mock.html']]],['Our Courses','courses.html',[['IELTS Preparation','ielts-courses.html'],['Spoken English (Adult)','spoken-adult.html'],['Junior Spoken English','junior-spoken.html'],['Online Courses','online-courses.html'],['Apply for Admission','admission.html']]],['About Us','about.html',[['Our Story','our-story.html'],['Our Branches','branches.html'],['Career','career.html']]],['Contact Us','contact.html']];
  const TXT = '<i>UKA</i><span>Technical Institute</span>';
  const LG = `<img src="${LOGO}" alt="UKA Technical Institute" onerror="this.outerHTML='${TXT.replace(/'/g, "\\'")}'">`;
  const css = `:root{--navy:#0b2a6f;--red:#e11d3a;--bg:#f7f9ff;--ink:#0d1530;--mut:#5d6788;--line:#e1e7f6}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 'Plus Jakarta Sans',system-ui,sans-serif}
a{color:inherit;text-decoration:none}h1,h2,h3{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.03em;line-height:1.05;margin:0}:focus-visible{outline:3px solid var(--red);outline-offset:2px}
.w{max-width:1100px;margin:auto;padding:0 22px}
#hd{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
#hd .w{display:flex;align-items:center;justify-content:space-between;height:68px;gap:14px}
.logo{display:flex;align-items:center;gap:10px;font:800 20px 'Bricolage Grotesque';color:var(--navy)}.logo img{height:48px;max-width:250px;object-fit:contain}.logo i{width:40px;height:40px;border-radius:11px;background:var(--navy);color:#fff;display:grid;place-items:center;font-style:normal;font-size:15px}.logo span{font-size:15px}
#mn{display:flex;list-style:none;margin:0;padding:0;gap:2px}#mn>li{position:relative}#mn>li>a{display:block;padding:10px 13px;font-weight:600;font-size:14.5px;border-radius:30px}#mn>li:hover>a{background:rgba(11,42,111,.08)}
.dd{position:absolute;top:100%;left:0;min-width:220px;background:#fff;border:1px solid var(--line);border-top:3px solid var(--red);border-radius:14px;padding:8px;list-style:none;margin:0;box-shadow:0 20px 44px rgba(11,42,111,.15);opacity:0;visibility:hidden;transform:translateY(10px);transition:.25s}
#mn li:hover .dd,#mn li:focus-within .dd{opacity:1;visibility:visible;transform:none}.dd a{display:block;padding:9px 13px;border-radius:9px;font-size:14px;font-weight:600}.dd a:hover{background:rgba(225,29,58,.08);color:var(--red)}
.au{display:flex;gap:8px}.au a{padding:8px 18px;border-radius:30px;font-weight:700;font-size:14px;border:2px solid var(--line)}.au .s{background:var(--red);border-color:var(--red);color:#fff}
#bt{display:none;width:44px;height:44px;border-radius:12px;border:1px solid var(--line);background:#fff;font-size:22px;cursor:pointer}
@media(max-width:980px){.au{display:none}#bt{display:block}#mn{display:none;position:absolute;top:68px;left:0;right:0;background:#fff;flex-direction:column;padding:8px 22px 18px;border-bottom:1px solid var(--line);max-height:calc(100vh - 68px);overflow:auto}#mn.open{display:flex}.dd{position:static;opacity:1;visibility:visible;transform:none;border:0;box-shadow:none;padding:0 0 6px 14px;display:none}li.sh .dd{display:block}}
.hero0{background:linear-gradient(135deg,var(--navy),#143d9c);color:#fff;padding:70px 0 60px}.hero0 h1{font-size:clamp(36px,6vw,64px)}.hero0 p{margin:14px 0 0;max-width:560px;opacity:.88}
.pg{padding:50px 22px 90px}.grid2{display:grid;grid-template-columns:1.3fr 1fr;gap:28px;align-items:start}@media(max-width:860px){.grid2{grid-template-columns:1fr}}
.card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;box-shadow:0 14px 40px rgba(11,42,111,.07)}.card h2{font-size:26px;margin-bottom:6px;color:var(--navy)}.card>p{color:var(--mut);margin:0 0 18px}
.f{display:grid;gap:6px;margin-bottom:14px;font-weight:600;font-size:14px}.f input,.f select,.f textarea{font:inherit;font-weight:400;padding:12px 14px;border:1.5px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);width:100%}.f input:focus,.f select:focus,.f textarea:focus{border-color:var(--navy);outline:0}.f textarea{min-height:120px;resize:vertical}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:560px){.two{grid-template-columns:1fr}}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 30px;border-radius:50px;font:700 15px 'Plus Jakarta Sans';border:0;cursor:pointer;background:var(--red);color:#fff;box-shadow:0 10px 28px rgba(225,29,58,.35)}.btn:disabled{opacity:.6;cursor:wait}
.msg{margin-top:14px;font-weight:600;font-size:14px}.msg.ok{color:#14804a}.msg.bad{color:var(--red)}
.info div{padding:14px 0;border-bottom:1px solid var(--line)}.info div:last-child{border:0}.info small{display:block;color:var(--mut);font-weight:600;font-size:13px}.info b{font-size:17px;color:var(--navy)}
footer{background:#fff;border-top:1px solid var(--line)}.fg{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:30px;padding:50px 0 30px}@media(max-width:800px){.fg{grid-template-columns:1fr 1fr}}footer h4{margin:0 0 10px;color:var(--navy)}footer ul{list-style:none;margin:0;padding:0}footer li{margin-bottom:7px;font-size:14px;color:var(--mut)}footer a:hover{color:var(--red)}footer p{font-size:14px;color:var(--mut);margin:10px 0 0}.cp{border-top:1px solid var(--line);padding:16px 0;font-size:13px;color:var(--mut)}
#wa{position:fixed;right:18px;bottom:18px;z-index:60;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#25d366,#128c4a);display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.28)}#wa svg{width:30px;height:30px;fill:#fff}
.prose h2{font-size:26px;margin:30px 0 10px;color:var(--navy)}.prose p,.prose li{color:#33405f}.prose ul{padding-left:20px}.prose .btn{margin:6px 8px 0 0}.btn.ln{background:none;color:var(--navy);border:2px solid var(--navy);box-shadow:none}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}`;
  const L = a => a.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('');
  const WA = '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  document.head.insertAdjacentHTML('beforeend', '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>' + css + '</style>');
  document.body.insertAdjacentHTML('afterbegin', `<header id="hd"><div class="w"><a class="logo" href="index.html">${LG}</a><ul id="mn">${M.map(m => m[2] ? `<li class="has"><a href="${m[1]}">${m[0]} ▾</a><ul class="dd">${L(m[2])}</ul></li>` : `<li><a href="${m[1]}">${m[0]}</a></li>`).join('')}</ul><div class="au"><a href="login.html">Login</a><a class="s" href="signup.html">Sign up</a></div><button id="bt" aria-label="Menu">☰</button></div></header>`);
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="w"><div class="fg"><div><a class="logo" href="index.html">${LG}</a><p>Official British Council IELTS exam center and English learning institute.</p></div><div><h4>Learn</h4><ul>${L([['Courses','courses.html'],['Mock Test','mock-test.html'],['Apply Now','admission.html']])}</ul></div><div><h4>Company</h4><ul>${L([['About Us','about.html'],['Contact Us','contact.html'],['Career','career.html']])}</ul></div><div><h4>Contact</h4><ul><li data-s="phone"></li><li data-s="email"></li><li data-s="address"></li></ul></div></div><div class="cp">© ${new Date().getFullYear()} UKA Technical Institute. All rights reserved.</div></div></footer><a id="wa" href="https://wa.me/8801516579760" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${WA}</a>`);

  const mn = document.getElementById('mn');
  document.getElementById('bt').onclick = () => mn.classList.toggle('open');
  mn.addEventListener('click', e => { const a = e.target.closest('.has>a'); if (a && innerWidth <= 980) { e.preventDefault(); a.parentNode.classList.toggle('sh'); } });

  // dashboard settings: phone, email, address, WhatsApp
  fetch('/api/settings').then(r => r.ok ? r.json() : null).then(s => {
    if (!s) return;
    document.querySelectorAll('[data-s]').forEach(el => { el.textContent = s[el.dataset.s] || ''; });
    const wa = String(s.whatsapp || '').replace(/\D/g, ''); if (wa) document.getElementById('wa').href = 'https://wa.me/' + wa;
  }).catch(() => {});

  // course dropdown (select[data-courses]) dashboard-er course theke
  const sel = document.querySelector('select[data-courses]');
  if (sel) fetch('/api/courses').then(r => r.ok ? r.json() : []).then(d => {
    const list = (Array.isArray(d) ? d : d.items || []).filter(c => c.isActive !== false);
    const want = new URLSearchParams(location.search).get('course');
    sel.insertAdjacentHTML('beforeend', list.map(c => `<option value="${c._id}"${c.slug === want ? ' selected' : ''}>${String(c.title).replace(/</g, '&lt;')}</option>`).join(''));
  }).catch(() => {});

  // form[data-api] : JSON hishebe POST kore, result dekhay
  document.addEventListener('submit', async e => {
    const f = e.target.closest('form[data-api]'); if (!f) return; e.preventDefault();
    const b = f.querySelector('button[type=submit]'), m = f.querySelector('.msg'), v = Object.fromEntries(new FormData(f));
    const s = f.querySelector('select[name=course]'); if (s && s.value) v.courseTitle = s.options[s.selectedIndex].text;
    const ex = []; Object.keys(v).forEach(k => { if (k.startsWith('x_')) { if (v[k]) ex.push(f.elements[k].dataset.l + ': ' + v[k]); delete v[k]; } });
    if (ex.length) v.message = [v.message, ...ex].filter(Boolean).join('\n');
    if (f.dataset.title) v.courseTitle = f.dataset.title;
    Object.keys(v).forEach(k => v[k] === '' && delete v[k]);
    b.disabled = true; m.className = 'msg'; m.textContent = 'Sending…';
    try {
      const r = await fetch(f.dataset.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || d.error || 'Something went wrong. Please try again.');
      f.reset(); m.className = 'msg ok'; m.textContent = f.dataset.ok || 'Thank you! We will contact you soon.';
    } catch (er) { m.className = 'msg bad'; m.textContent = er.message; }
    b.disabled = false;
  });
})();