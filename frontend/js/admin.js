/* Admin layout + login guard. Usage: const u = await adminInit('courses','Courses'); */
const ADMIN_LINKS = [
  ['dashboard', 'Dashboard', 'Overview of applications, messages and stats', false],
  ['courses', 'Courses', 'Create and manage courses, fees and syllabus', false],
  ['admissions', 'Admissions', 'Review and process student admission applications', false],
  ['exam-dates', 'Exam Dates & Fees', 'Manage IELTS exam schedules, venues and fees', true],
  ['messages', 'Messages', 'View and reply to visitor contact messages', false],
  ['site-content-admin', 'Site Content & Photos', 'Manage site photos, teachers, branches, gallery, jobs and FAQs', true],
  ['students', 'Students', 'View and manage registered student accounts', true],
  ['settings', 'Settings', 'Update contact info, counters and WhatsApp number', true]
];
window.ADMIN_LINKS = ADMIN_LINKS;

function toast(m, bad) { const t = document.getElementById('toast'); t.textContent = m; t.className = 'show' + (bad ? ' bad' : ''); clearTimeout(t._t); t._t = setTimeout(() => t.className = '', 2600); }
async function adminInit(active, title, adminOnly) {
  let u = null;
  try { u = JSON.parse(localStorage.getItem('uka_user')); } catch (e) {}

  if (!u) {
    u = await getMe();
    if (!u || u.role === 'student') { location.href = '/admin/login'; return null; }
  } else {
    // Validate session in background
    getMe().then(fresh => {
      if (!fresh || fresh.role === 'student') {
        localStorage.removeItem('uka_user');
        location.href = '/admin/login';
      } else {
        localStorage.setItem('uka_user', JSON.stringify(fresh));
      }
    });
  }

  if (adminOnly && u.role !== 'admin') { location.href = '/admin/dashboard'; return null; }

  const N = [
    ['dashboard', 'Dashboard'],
    ['courses', 'Courses'],
    ['admissions', 'Admissions'],
    ['exam-dates', 'Exam Dates'],
    ['messages', 'Messages']
  ];
  if (u.role === 'admin') {
    N.push(
      ['site-content-admin', 'Site Content & Photos'],
      ['students', 'Students'],
      ['settings', 'Settings']
    );
  }

  const existingAdm = document.querySelector('.adm');
  if (existingAdm) {
    // Static shell is already on the page! Do NOT re-render or wipe body!
    existingAdm.querySelectorAll('aside nav a').forEach(a => {
      let h = a.getAttribute('href') || '';
      if (h.endsWith('.html')) {
        h = h.slice(0, -5);
        a.setAttribute('href', h);
      }
      if (h === '/admin/' + active || h.endsWith(active)) {
        a.classList.add('on');
      } else {
        a.classList.remove('on');
      }
    });

    const whoName = document.getElementById('admWhoName');
    if (whoName) whoName.textContent = u.name;
    const whoRole = document.getElementById('admWhoRole');
    if (whoRole) whoRole.textContent = u.role;

    const whoDiv = existingAdm.querySelector('.who');
    if (whoDiv && !whoName) {
      whoDiv.innerHTML = `${esc(u.name)}<small>${esc(u.role)}</small><button data-lo>Logout</button>`;
    }

    const h1 = document.querySelector('main header h1');
    if (h1 && title) h1.textContent = title;
    return u;
  }

  // Fallback if static shell is missing
  document.body.innerHTML = `<div class="adm"><aside><a class="brand" href="/" style="padding:10px 12px;margin:4px 0 14px;background:#fff;border-radius:14px;display:flex;flex-direction:column;align-items:center;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.25)"><img src="/logo.png" width="160" height="33" alt="UKA & British Council" style="height:33px;max-width:160px;object-fit:contain;display:block"><small style="font:800 10px 'Plus Jakarta Sans';color:var(--navy);letter-spacing:.12em;text-transform:uppercase;margin-top:4px">Admin Portal</small></a><nav>${N.map(n => `<a href="/admin/${n[0]}" class="${n[0] === active ? 'on' : ''}">${n[1]}</a>`).join('')}</nav><div class="who">${esc(u.name)}<small>${esc(u.role)}</small><button data-lo>Logout</button></div></aside><main><header><h1>${esc(title)}</h1></header><section id="c"></section></main></div><div id="toast"></div>`;
  return u;
}
const STATUS = ['pending', 'contacted', 'approved', 'rejected'];

// Photo upload button: name="image" input-er pashe "Upload photo" button boshay
(function () {
  const add = () => document.querySelectorAll('input[name="image"]:not([data-up])').forEach(inp => {
    inp.dataset.up = 1;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'b'; b.textContent = 'Upload photo';
    const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/jpeg,image/png,image/webp,image/gif'; f.hidden = true;
    b.onclick = () => f.click();
    f.onchange = async () => {
      if (!f.files[0]) return;
      const fd = new FormData(); fd.append('image', f.files[0]);
      b.disabled = true; b.textContent = 'Uploading…';
      try {
        const r = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'same-origin' });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.message || d.error || 'Upload failed');
        inp.value = d.url; toast('Photo uploaded. Save korte bhulo na.');
      } catch (er) { toast(er.message, 1); }
      b.disabled = false; b.textContent = 'Upload photo'; f.value = '';
    };
    inp.after(b, f);
  });
  new MutationObserver(add).observe(document.body, { childList: true, subtree: true }); add();
})();