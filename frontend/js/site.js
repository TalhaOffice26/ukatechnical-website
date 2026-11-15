/* Shared header, drawer menu, footer and floating buttons for every public page */
(function () {
  let CALL_AGENT = { url: '', tel: '+8801516579760' };
  window.LT = '<i>UKA</i><span>UKA<small>Technical Institute</small></span>';
  const LH = '<img src="/logo.png" width="244" height="50" alt="UKA Technical Institute - British Council IELTS Exam Center" onerror="if(this.getAttribute(\'data-fallback\')){this.parentNode.innerHTML=LT}else{this.setAttribute(\'data-fallback\',\'1\');this.src=\'logo.png\'}">';
  const L = a => a.map(([t, h]) => `<li><a href="/${h}">${t}</a></li>`).join('');

  const M = [
    ['IELTS Exam', 'ielts-exam', [
      ['About IELTS', 'ielts-exam'],
      ['IELTS Academic', 'ielts-academic'],
      ['IELTS General Training', 'ielts-general'],
      ['Exam Dates & Fees', 'exam-dates'],
      ['Book Your Exam', 'book-exam']
    ]],
    ['Mock Test', 'mock-test', [
      ['IELTS FULL MOCK TEST', 'mock-test?type=full'],
      ['IELTS READING MOCK', 'mock-test?type=reading'],
      ['IELTS WRITING MOCK', 'mock-test?type=writing'],
      ['IELTS SPEAKING MOCK', 'mock-test?type=speaking']
    ]],
    ['Our Courses', 'courses', [
      ['All Courses', 'courses'],
      ['IELTS Preparation', 'courses#ielts-preparation'],
      ['Spoken English (Adult)', 'courses#spoken-adult'],
      ['Junior Spoken English', 'courses#junior-spoken'],
      ['Secondary English Test (SET)', 'set'],
      ['Primary English Test (PET)', 'pet'],
      ['Study Abroad Consultation', 'study-abroad'],
      ['Apply for Admission', 'admission']
    ]],
    ['About Us', 'about', [
      ['Our Story', 'our-story'],
      ['Our Chairman', 'our-chairman'],
      ['Our Branches', 'branches'],
      ['Our Team', 'our-team'],
      ['Blog & Latest News', 'news'],
      ['Career Opportunities', 'career'],
      ['Photo Gallery', 'gallery'],
      ['FAQ', 'faq']
    ]],
    ['Blog & News', 'news'],
    ['Contact Us', 'contact']
  ];

  let WA = 'https://wa.me/8801516579760?text=Hello%20UKA%20Technical%20Institute%2C%20I%20want%20to%20know%20more.';

  const curPath = (window.location.pathname.replace(/^\//, '').replace(/\.html$/, '').split('?')[0] || '').toLowerCase();
  const menuItems = `<li class="mh"><div class="mhi"><a class="logo" href="/">${LH}</a><button class="mx" aria-label="Close menu">×</button></div></li>` +
    M.map((m, i) => {
      const isSubActive = m[2] && m[2].some(sub => sub[1].split('?')[0].split('#')[0].toLowerCase() === curPath);
      const isMainActive = m[1].split('?')[0].split('#')[0].toLowerCase() === curPath || isSubActive;
      const activeClass = isMainActive ? ' class="active-nav"' : '';
      return m[2] ? 
        `<li class="has${isSubActive ? ' on' : ''}" style="--i:${i}"><a href="/${m[1]}"${activeClass}>${m[0]}</a><ul class="dd"><li class="va"><a href="/${m[1]}">View all ${m[0]} →</a></li>${L(m[2])}</ul></li>` : 
        `<li style="--i:${i}"><a href="/${m[1]}"${activeClass}>${m[0]}</a></li>`;
    }).join('') +
    `<li class="mf"><div class="mfi"><a class="s" href="/book-exam" style="grid-column:span 2">Book IELTS Exam</a><a class="wa2" href="${WA}" target="_blank" rel="noopener">Chat on WhatsApp</a></div></li>`;

  const hdr = `<header id="nav"><div class="w"><a class="logo" href="/">${LH}</a><ul class="menu" id="menu">${menuItems}</ul><div class="auth"><a class="s" href="/book-exam" style="background:linear-gradient(135deg,var(--red),var(--red2));border-color:var(--red);color:#fff">Book Exam</a></div><button class="bg" id="bg" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button></div><div id="ov"></div></header>`;
  const ftr = `<footer><div class="w"><div class="fg"><div><a class="logo" href="/">${LH}</a><p>Official British Council IELTS exam center and premier English learning institute.</p></div><div><h4>Courses</h4><ul>${L([['All Courses', 'courses'], ['Apply for Admission', 'admission'], ['Mock Test', 'mock-test'], ['Exam Dates', 'exam-dates']])}</ul></div><div><h4>Services</h4><ul>${L([['IELTS Exam', 'ielts-exam'], ['SET', 'set'], ['PET', 'pet'], ['Study Abroad', 'study-abroad'], ['Blog & Latest News', 'news']])}</ul></div><div><h4>Company</h4><ul>${L([['About Us', 'about'], ['Our Chairman', 'our-chairman'], ['Our Team', 'our-team'], ['Our Branches', 'branches'], ['Blog & News', 'news'], ['Contact Us', 'contact'], ['FAQ', 'faq'], ['Sitemap', 'sitemap']])}</ul></div><div><h4>Official Center</h4><ul>${L([['Book IELTS Exam', 'book-exam'], ['Admission Application', 'admission'], ['Mock Test Center', 'mock-test'], ['Staff & Admin Login', 'admin/login']])}</ul></div></div><div class="cp"><span>© ${new Date().getFullYear()} UKA Technical Institute. All rights reserved.</span><span><a href="/privacy">Privacy Policy</a> • <a href="/terms">Terms</a> • <a href="/sitemap">Sitemap</a></span></div></div></footer>`;
  const fabs = `<div class="fabs"><a class="fab wa" id="waBtn" href="${WA}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a><button class="fab cl" id="callBtn" aria-label="Talk to our call agent"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1z"/></svg></button></div><div class="cpn" id="cpn" role="dialog" aria-label="Call agent"><button class="x" id="cx" aria-label="Close">×</button><h3>Talk to our Call Agent</h3><p>Ask about IELTS exam dates, courses and fees right now.</p><div id="agentMount"><a class="btn red" id="callLink" href="tel:+8801516579760" style="width:100%">Call Us: +880 1516-579760</a></div></div>`;

  if (!document.getElementById('nav')) {
    document.body.insertAdjacentHTML('afterbegin', hdr);
  } else {
    // If nav was already in static HTML, clean .html links and sync active-nav class
    document.querySelectorAll('#nav a').forEach(a => {
      let h = a.getAttribute('href') || '';
      if (h.endsWith('.html') || h.includes('.html?')) {
        h = h.replace('/index.html', '/').replace('.html', '');
        a.setAttribute('href', h);
      }
    });

    document.querySelectorAll('#menu > li > a').forEach(a => {
      const h = (a.getAttribute('href') || '').replace(/^\//, '').replace(/\.html$/, '').split('?')[0].toLowerCase();
      if (h === curPath || (curPath === '' && (h === '' || h === 'index'))) {
        a.classList.add('active-nav');
      } else {
        a.classList.remove('active-nav');
      }
    });

    // Ensure .auth has the Book Exam button
    const authBox = document.querySelector('.auth');
    if (authBox && (authBox.innerHTML.includes('Login') || authBox.innerHTML.includes('Sign up'))) {
      authBox.innerHTML = '<a class="s" href="/book-exam" style="background:linear-gradient(135deg,var(--red),var(--red2));border-color:var(--red);color:#fff">Book Exam</a>';
    }
  }

  if (!document.querySelector('footer')) {
    document.body.insertAdjacentHTML('beforeend', ftr + fabs);
  } else {
    document.querySelectorAll('footer a').forEach(a => {
      let h = a.getAttribute('href') || '';
      if (h.endsWith('.html') || h.includes('.html?')) {
        h = h.replace('/index.html', '/').replace('.html', '');
        a.setAttribute('href', h);
      }
    });
  }

  const menu = document.getElementById('menu');
  const bgb = document.getElementById('bg'), ov = document.getElementById('ov');

  function setMenu(o) {
    if (!menu) return;
    menu.classList.toggle('open', o);
    if (bgb) {
      bgb.classList.toggle('x', o);
      bgb.setAttribute('aria-expanded', o);
    }
    if (ov) {
      ov.classList.toggle('on', o);
    }
    document.body.classList.toggle('lock', o);
    if (!o) menu.querySelectorAll('.has.show').forEach(x => x.classList.remove('show'));
  }

  if (bgb) {
    bgb.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      setMenu(!menu.classList.contains('open'));
    });
  }

  if (ov) {
    ov.addEventListener('click', e => {
      e.preventDefault();
      setMenu(false);
    });
  }

  if (menu) {
    menu.addEventListener('click', e => {
      const a = e.target.closest('a,.mx');
      if (!a) return;
      if (a.classList.contains('mx')) {
        e.preventDefault();
        setMenu(false);
        return;
      }
      if (a.matches('.has > a')) {
        if (window.innerWidth <= 980) {
          e.preventDefault();
          e.stopPropagation();
          const li = a.parentNode;
          const was = li.classList.contains('show');
          menu.querySelectorAll('.has.show').forEach(x => x.classList.remove('show'));
          li.classList.toggle('show', !was);
        }
        return;
      }
      // If clicking a destination navigation link, close drawer
      setMenu(false);
    });
  }

  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  addEventListener('resize', () => window.innerWidth > 980 && setMenu(false));

  // Dynamic Injection of AI Voice Calling Agent Styles & Script
  if (!document.getElementById('ukaCallAgentCss')) {
    const l = document.createElement('link');
    l.id = 'ukaCallAgentCss';
    l.rel = 'stylesheet';
    l.href = '/css/call-agent.css';
    document.head.appendChild(l);
  }
  if (!window.UKA_Agent && !document.getElementById('ukaCallAgentJs')) {
    const s = document.createElement('script');
    s.id = 'ukaCallAgentJs';
    s.src = '/js/call-agent.js';
    document.body.appendChild(s);
  }

  const callBtn = document.getElementById('callBtn');
  if (callBtn) {
    callBtn.onclick = (e) => {
      e.preventDefault();
      if (window.UKA_Agent) {
        window.UKA_Agent.startCall();
      } else if (CALL_AGENT.url) {
        window.open(CALL_AGENT.url, '_blank', 'noopener');
      } else if (CALL_AGENT.tel) {
        location.href = 'tel:' + CALL_AGENT.tel;
      }
    };
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-call-agent], .btn-call-agent, a[href="#call-agent"]');
    if (trigger) {
      e.preventDefault();
      if (window.UKA_Agent) {
        window.UKA_Agent.startCall();
      }
    }
  });

  const cpn = document.getElementById('cpn');
  const cx = document.getElementById('cx');
  if (cx && cpn) cx.onclick = () => cpn.classList.remove('open');

  if (typeof authUI === 'function') authUI();

  // Load live site settings (WhatsApp, Call, Phone)
  if (typeof api === 'function') {
    api('/settings').then(s => {
      if (!s) return;
      const n = String(s.whatsapp || '').replace(/\D/g, '');
      if (n) {
        WA = 'https://wa.me/' + n + '?text=Hello%20UKA%20Technical%20Institute%2C%20I%20want%20to%20know%20more.';
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => a.href = WA);
      }
      if (s.callAgentUrl) CALL_AGENT.url = s.callAgentUrl;
      if (s.callAgentPhone || s.phone) {
        CALL_AGENT.tel = s.callAgentPhone || s.phone;
        const cl = document.getElementById('callLink');
        if (cl) {
          cl.href = 'tel:' + (s.callAgentPhone || s.phone);
          cl.textContent = 'Call Us: ' + (s.phone || s.callAgentPhone);
        }
      }
    }).catch(() => {});
  }

  // Cinematic scroll reveal observer
  document.documentElement.classList.add('js');
  if ('IntersectionObserver' in window) {
    const rvo = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // Animate any skill bars or progress inside
          e.target.querySelectorAll('.sk u:after').forEach(bar => {
            if (bar.dataset.w) bar.style.width = bar.dataset.w;
          });
          rvo.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.rv, .stat, .desk, .cc').forEach(el => rvo.observe(el));

    // Number counters
    const cno = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = +(el.dataset.n || el.dataset.count || 0);
          const suffix = el.dataset.s || '';
          if (target > 0) {
            const t0 = performance.now(), duration = 1600;
            (function step(t) {
              const p = Math.min((t - t0) / duration, 1);
              const ease = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * ease).toLocaleString('en-IN') + suffix;
              if (p < 1) requestAnimationFrame(step);
            })(performance.now());
          }
          cno.unobserve(el);
        }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('[data-n], [data-count]').forEach(el => cno.observe(el));
  } else {
    document.querySelectorAll('.rv, .stat, .desk, .cc').forEach(el => el.classList.add('in'));
  }

  // Interactive mouse parallax for floating scene elements
  if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - 0.5);
      const y = (e.clientY / innerHeight - 0.5);
      document.querySelectorAll('.pagehead, .abhero, .shell, .hero').forEach(s => {
        s.style.setProperty('--mx', x);
        s.style.setProperty('--my', y);
      });
    });
  }
})();