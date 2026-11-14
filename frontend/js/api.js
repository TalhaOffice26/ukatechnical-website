async function api(path, o = {}) {
  const r = await fetch('/api' + path, {
    method: o.method || 'GET',
    headers: o.body ? { 'Content-Type': 'application/json' } : {},
    body: o.body ? JSON.stringify(o.body) : undefined,
    credentials: 'same-origin'
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || 'Something went wrong');
  return d;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const taka = n => (n > 0 ? '৳ ' + Number(n).toLocaleString('en-IN') : 'Contact for fee');
const fdate = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

async function getMe() {
  try {
    const res = await api('/auth/me');
    if (res && res.user) {
      try { localStorage.setItem('uka_user', JSON.stringify(res.user)); } catch (e) {}
      return res.user;
    }
    try { localStorage.removeItem('uka_user'); } catch (e) {}
    return null;
  } catch {
    try { localStorage.removeItem('uka_user'); } catch (e) {}
    return null;
  }
}

async function doLogout() {
  try { localStorage.removeItem('uka_user'); } catch (e) {}
  try { await api('/auth/logout', { method: 'POST' }); } catch {}
  location.href = '/';
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-lo]')) {
    e.preventDefault();
    doLogout();
  }
});

/* Synchronously render action/dashboard buttons without DOM layout shift */
function renderAuthButtons(u) {
  const isAdmin = u && u.role === 'admin';
  document.querySelectorAll('.auth').forEach(a => {
    if (isAdmin) {
      a.innerHTML = `<a class="s" href="/admin/dashboard" style="background:var(--navy);border-color:var(--navy);color:#fff">Admin Dashboard</a><a href="#" data-lo style="padding:9px 16px;border-radius:30px">Logout</a>`;
    } else {
      a.innerHTML = `<a class="s" href="/book-exam" style="background:linear-gradient(135deg,var(--red),var(--red2));border-color:var(--red);color:#fff;box-shadow:0 8px 20px rgba(225,29,58,.3)">Book Exam</a>`;
    }
  });

  const waLink = 'https://wa.me/8801516579760?text=Hello%20UKA%20Technical%20Institute%2C%20I%20want%20to%20know%20more.';
  document.querySelectorAll('.mfi').forEach(mfi => {
    if (isAdmin) {
      mfi.innerHTML = `<a class="s" href="/admin/dashboard" style="grid-column:span 2;background:var(--navy);border-color:var(--navy);color:#fff">Admin Dashboard</a><a href="#" data-lo style="grid-column:span 2">Logout</a>`;
    } else {
      mfi.innerHTML = `<a class="s" href="/book-exam" style="grid-column:span 2">Book IELTS Exam</a><a class="wa2" href="${waLink}" target="_blank" rel="noopener">Chat on WhatsApp</a>`;
    }
  });
}

/* Instant synchronous paint from localStorage + async background validation */
async function authUI() {
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem('uka_user')); } catch (e) {}
  if (cached) renderAuthButtons(cached);

  const u = await getMe();
  renderAuthButtons(u);
  return u;
}

// Immediate run on script parse so static HTML is updated before initial paint
try {
  const earlyCached = JSON.parse(localStorage.getItem('uka_user'));
  if (earlyCached && document.querySelector('.auth')) {
    renderAuthButtons(earlyCached);
  }
} catch (e) {}
