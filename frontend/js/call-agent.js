/**
 * UKA Technical Institute - Intelligent Human-like AI Admissions Counselor
 * Counselor: Sara (UKA Senior Admissions Officer)
 * 
 * Powered by:
 *  - Google Gemini AI Flash Brain (Fast Shuddho conversational Bengali)
 *  - High-Definition Neural Bangladeshi Voice Engine (bn-BD-NabanitaNeural & bn-BD-PradeepNeural)
 *  - Unified Single-Roundtrip Pipeline (Sub-second audio synthesis)
 *  - Real-time Lead auto-synchronization to MongoDB Database
 */

window.UKA_Agent = (function () {
  let audioCtx = null;
  let ringInterval = null;
  let callTimerInterval = null;
  let callSeconds = 0;
  let isMuted = false;
  let isCallActive = false;
  let recognition = null;
  let isSpeaking = false;
  let isThinking = false;
  const selectedVoice = 'nabanita'; // Permanent Authentic Bangladeshi Counselor Sara

  // Audio Player
  const counselorAudio = new Audio();
  counselorAudio.preload = 'auto';

  // Candidate Data Memory
  const state = {
    phase: 'RINGING',
    name: '',
    phone: '',
    topic: 'General IELTS / Course Inquiry',
    history: []
  };

  // Convert Bengali numerals to standard digits
  function bnToEnDigits(str) {
    if (!str) return '';
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(str).replace(/[০-৯]/g, d => bn.indexOf(d));
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playRingTone() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.setValueAtTime(0.12, now + 1.8);
      gain.gain.linearRampToValueAtTime(0, now + 1.95);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
    } catch (e) {}
  }

  function playConnectChime() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  function playHangupTone() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 425;
        gain.gain.setValueAtTime(0.1, now + i * 0.25);
        gain.gain.setValueAtTime(0, now + i * 0.25 + 0.18);
        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.2);
      }
    } catch (e) {}
  }

  function ensureUI() {
    if (document.getElementById('ukaCallModal')) return;

    const html = `
      <div class="uka-call-modal" id="ukaCallModal">
        <div class="uka-call-screen ringing" id="ukaCallScreen">
          <!-- Top Status Bar -->
          <div class="uka-call-top">
            <span class="uka-call-secure">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              British Council Verified Venue
            </span>
            <button class="uka-call-close" id="ukaCallClose" aria-label="Close" title="কল শেষ করুন">✕</button>
          </div>

          <!-- Agent Info -->
          <div class="uka-call-agent-wrap">
            <div class="uka-agent-avatar-ring">
              <div class="uka-agent-avatar" id="ukaAgentAvatar">
                <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <h3 class="uka-agent-name" id="ukaAgentName">সারা (Sara)</h3>
            <span class="uka-agent-role">UKA Senior Admissions Counselor</span>
            <div class="uka-call-status" id="ukaCallStatus">
              <span class="status-dot"></span>
              <span id="ukaStatusText">Calling UKA Admissions Line...</span>
            </div>
            <div class="uka-call-timer" id="ukaCallTimer" style="display:none">00:00</div>
          </div>

          <!-- Dynamic Sound Equalizer Wave -->
          <div class="uka-audio-wave">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>

          <!-- Captions Box -->
          <div class="uka-caption-box" id="ukaCaptionBox">
            <span class="uka-caption-speaker" id="ukaSpeaker">সারা (Admissions Desk)</span>
            <div id="ukaCaptionText">Connecting to admission desk...</div>
          </div>

          <!-- Quick Topic Chips -->
          <div class="uka-call-quick-chips" id="ukaQuickChips">
            <button type="button" class="uka-q-chip" data-q="ইজি আইইএলটিএস কোর্সের ফি ও ক্লাসের ডিটেইলস বলুন">Easy IELTS কোর্স ফি?</button>
            <button type="button" class="uka-q-chip" data-q="৫০% ছাড়ে কম্পিউটার মক টেস্টের অফারগুলো কি কি?">মক টেস্ট ৫০% অফার?</button>
            <button type="button" class="uka-q-chip" data-q="বাচ্চাদের জুনিয়র স্পোকেন ইংলিশ কোর্সের ফি কত?">জুনিয়র স্পোকেন?</button>
            <button type="button" class="uka-q-chip" data-q="বনশ্রী সেন্টারের লোকেশন ও হাতিরঝিল থেকে কীভাবে আসব?">সেন্টারের লোকেশন?</button>
          </div>

          <!-- Candidate Extracted Data Pills -->
          <div class="uka-collected-pill" id="ukaChips"></div>

          <!-- Interactive Actions -->
          <div class="uka-call-actions">
            <button class="uka-ctrl-btn btn-tool" id="ukaMuteBtn" title="Mute Microphone" aria-label="Mute">
              <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
            </button>
            <button class="uka-ctrl-btn btn-hangup" id="ukaHangupBtn" title="End Call" aria-label="End Call">
              <svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1z"/></svg>
            </button>
            <button class="uka-ctrl-btn btn-tool" id="ukaKeyBtn" title="Keyboard Input" aria-label="Keyboard">
              <svg viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
            </button>
          </div>

          <!-- Fallback Text Drawer -->
          <form class="uka-call-text-input" id="ukaTextForm">
            <input type="text" id="ukaTextInput" placeholder="বাংলায় বা ইংরেজিতে লিখুন..." autocomplete="off">
            <button type="submit">পাঠান</button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    bindUIEvents();
  }

  function bindUIEvents() {
    const hangup = document.getElementById('ukaHangupBtn');
    const mute = document.getElementById('ukaMuteBtn');
    const keyBtn = document.getElementById('ukaKeyBtn');
    const closeBtn = document.getElementById('ukaCallClose');
    const form = document.getElementById('ukaTextForm');
    const input = document.getElementById('ukaTextInput');
    const quickChips = document.getElementById('ukaQuickChips');

    hangup.onclick = endCall;
    closeBtn.onclick = endCall;

    // Quick Chips click handler
    if (quickChips) {
      quickChips.onclick = e => {
        const chip = e.target.closest('.uka-q-chip');
        if (!chip) return;
        const q = chip.dataset.q;
        if (isSpeaking) {
          stopSpeaking();
        }
        handleUserUtterance(q);
      };
    }

    mute.onclick = () => {
      isMuted = !isMuted;
      mute.classList.toggle('active', isMuted);
      updateCaption('System', isMuted ? 'মাইক্রোফোন মিউট করা হয়েছে।' : 'মাইক্রোফোন আনমিউট করা হয়েছে।');
    };

    keyBtn.onclick = () => {
      form.classList.toggle('open');
      if (form.classList.contains('open')) input.focus();
    };

    form.onsubmit = e => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      if (isSpeaking) {
        stopSpeaking();
      }
      handleUserUtterance(val);
    };
  }

  function updateStatus(txt) {
    const el = document.getElementById('ukaStatusText');
    if (el) el.textContent = txt;
  }

  function updateCaption(speaker, txt) {
    const sEl = document.getElementById('ukaSpeaker');
    const tEl = document.getElementById('ukaCaptionText');
    if (sEl) sEl.textContent = speaker;
    if (tEl) tEl.textContent = txt;
  }

  function updateChips() {
    const wrap = document.getElementById('ukaChips');
    if (!wrap) return;
    const chips = [];
    if (state.name) chips.push(`<span class="uka-chip-val">নাম: <b>${esc(state.name)}</b></span>`);
    if (state.phone) chips.push(`<span class="uka-chip-val">ফোন: <b>${esc(state.phone)}</b></span>`);
    wrap.innerHTML = chips.join('');
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
  }

  function stopSpeaking() {
    if (counselorAudio) {
      counselorAudio.pause();
      counselorAudio.currentTime = 0;
    }
    isSpeaking = false;
    const screen = document.getElementById('ukaCallScreen');
    if (screen) {
      screen.classList.remove('speaking');
      if (!isMuted) screen.classList.add('listening');
    }
  }

  function playAudioBase64(base64, onComplete) {
    const screen = document.getElementById('ukaCallScreen');
    isSpeaking = true;
    if (screen) {
      screen.classList.remove('listening', 'thinking');
      screen.classList.add('speaking');
    }

    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }

    counselorAudio.src = 'data:audio/mp3;base64,' + base64;
    counselorAudio.onended = () => {
      isSpeaking = false;
      if (screen) {
        screen.classList.remove('speaking');
        if (!isMuted) screen.classList.add('listening');
      }
      updateStatus('আপনার কথা শুনছি... বলুন');
      if (isCallActive && !isMuted) {
        setTimeout(startListening, 300);
      }
      if (onComplete) onComplete();
    };

    counselorAudio.onerror = () => {
      isSpeaking = false;
      if (screen) screen.classList.remove('speaking');
      updateStatus('সংযুক্ত রয়েছে • কথা বলুন');
      if (onComplete) onComplete();
    };

    counselorAudio.play().catch(() => {
      isSpeaking = false;
      if (screen) screen.classList.remove('speaking');
      updateStatus('সংযুক্ত রয়েছে • কথা বলুন');
    });
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !isCallActive || isSpeaking || isThinking) return;

    if (recognition) {
      try { recognition.abort(); } catch (e) {}
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'bn-BD';

    recognition.onstart = () => {
      const screen = document.getElementById('ukaCallScreen');
      if (screen && !isSpeaking && !isThinking) {
        screen.classList.remove('speaking', 'thinking');
        screen.classList.add('listening');
      }
      updateStatus('আপনার কথা শুনছি... বলুন');
    };

    recognition.onresult = e => {
      if (isSpeaking || isThinking || isMuted) return;
      const last = e.results[e.results.length - 1];
      if (last && last.isFinal) {
        const transcript = last[0].transcript.trim();
        if (transcript.length > 1) {
          handleUserUtterance(transcript);
        }
      }
    };

    recognition.onerror = e => {
      if (e.error === 'not-allowed') {
        updateCaption('সিস্টেম', 'মাইক্রোফোন অনুমতি দেওয়া না থাকলে নিচে কিবোর্ড বা কুইক বাটনে ট্যাপ করে কথা বলতে পারবেন।');
        const form = document.getElementById('ukaTextForm');
        if (form) form.classList.add('open');
      }
    };

    recognition.onend = () => {
      if (isCallActive && !isMuted && !isSpeaking && !isThinking) {
        try { recognition.start(); } catch (e) {}
      }
    };

    try { recognition.start(); } catch (e) {}
  }

  // FAST SINGLE-ROUNDTRIP INTERACTION
  async function handleUserUtterance(text) {
    if (isThinking) return;
    isThinking = true;

    updateCaption('আপনি (You)', text);
    state.history.push({ role: 'user', text });

    updateStatus('সারা ভাবছে...');
    const screen = document.getElementById('ukaCallScreen');
    if (screen) {
      screen.classList.remove('listening', 'speaking');
      screen.classList.add('thinking');
    }

    // Parse phone numbers from utterance
    const cleanDigits = bnToEnDigits(text);
    const phoneMatch = cleanDigits.replace(/[\s\-\+]/g, '').match(/(?:88)?(01[3-9]\d{8})/);
    if (phoneMatch) {
      state.phone = phoneMatch[1];
      updateChips();
    }

    try {
      const res = await fetch('/api/agent/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: state.history,
          voice: selectedVoice
        })
      });

      const data = await res.json();
      isThinking = false;
      if (screen) screen.classList.remove('thinking');

      if (data && data.reply) {
        const reply = data.reply;
        state.history.push({ role: 'model', text: reply });

        if (data.extracted) {
          if (data.extracted.name && data.extracted.name !== state.name) {
            state.name = data.extracted.name;
          }
          if (data.extracted.phone && data.extracted.phone !== state.phone) {
            state.phone = data.extracted.phone;
          }
          if (data.extracted.topic) {
            state.topic = data.extracted.topic;
          }
          updateChips();
        }

        const speakerName = 'সারা (কাউন্সিলর)';
        updateCaption(speakerName, reply);
        updateStatus('সারা কথা বলছে...');

        if (data.audioBase64) {
          playAudioBase64(data.audioBase64);
        } else {
          updateStatus('আপনার কথা শুনছি... বলুন');
          startListening();
        }
      }
    } catch (err) {
      isThinking = false;
      if (screen) screen.classList.remove('thinking');
      updateStatus('সংযুক্ত রয়েছে • কথা বলুন');
      console.warn('Interact error:', err);
      const fallback = 'জি, আমি শুনতে পাচ্ছি। ইউকা-র আইইএলটিএস এক্সাম, ৫০% ছাড়ে মক টেস্ট নাকি স্পোকেন কোর্স—কোন বিষয়ে আপনাকে সহযোগিতা করতে পারি?';
      updateCaption('সারা (কাউন্সিলর)', fallback);
      startListening();
    }
  }

  function startCall() {
    ensureUI();
    const modal = document.getElementById('ukaCallModal');
    const screen = document.getElementById('ukaCallScreen');
    const timer = document.getElementById('ukaCallTimer');

    modal.classList.add('active');
    screen.classList.add('ringing');
    screen.classList.remove('speaking', 'listening', 'thinking');
    timer.style.display = 'none';

    state.phase = 'RINGING';
    state.history = [];
    callSeconds = 0;
    isCallActive = true;
    isThinking = false;

    updateStatus('অ্যাডমিশন লাইনে ডায়াল করা হচ্ছে...');
    updateCaption('সারা (অ্যাডমিশন ডেস্ক)', 'ইউকা টেকনিক্যাল ইনস্টিটিউটের অ্যাডমিশন ডেস্কে রিং হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।');

    playRingTone();
    let ringCount = 0;
    ringInterval = setInterval(() => {
      ringCount++;
      if (ringCount >= 2) {
        clearInterval(ringInterval);
        ringInterval = null;
        connectCall();
      } else {
        playRingTone();
      }
    }, 2800);
  }

  async function connectCall() {
    state.phase = 'CONNECTED';
    const screen = document.getElementById('ukaCallScreen');
    const timer = document.getElementById('ukaCallTimer');

    screen.classList.remove('ringing');
    timer.style.display = 'inline-block';
    updateStatus('সংযুক্ত • লাইভ অডিও');

    playConnectChime();

    callTimerInterval = setInterval(() => {
      callSeconds++;
      timer.textContent = formatTime(callSeconds);
    }, 1000);

    const greeting = `আসসালামু আলাইকুম! ইউকা টেকনিক্যাল থেকে সারা বলছি... কেমন আছেন? কীভাবে সাহায্য করতে পারি বলুন?`;
    updateCaption('সারা (কাউন্সিলর)', greeting);
    state.history.push({ role: 'model', text: greeting });

    try {
      const res = await fetch('/api/agent/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: greeting, voice: selectedVoice })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      counselorAudio.src = url;

      counselorAudio.onended = () => {
        isSpeaking = false;
        URL.revokeObjectURL(url);
        if (screen) {
          screen.classList.remove('speaking');
          if (!isMuted) screen.classList.add('listening');
        }
        updateStatus('আপনার কথা শুনছি... বলুন');
        if (isCallActive && !isMuted) {
          setTimeout(startListening, 300);
        }
      };

      isSpeaking = true;
      if (screen) screen.classList.add('speaking');
      updateStatus('সারা কথা বলছে...');
      await counselorAudio.play();
    } catch (e) {
      updateStatus('আপনার কথা শুনছি... বলুন');
      startListening();
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function endCall() {
    if (!isCallActive && !document.getElementById('ukaCallModal')?.classList.contains('active')) return;

    if (ringInterval) {
      clearInterval(ringInterval);
      ringInterval = null;
    }
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      callTimerInterval = null;
    }
    if (counselorAudio) {
      counselorAudio.pause();
      counselorAudio.currentTime = 0;
    }
    if (recognition) {
      try { recognition.abort(); } catch (e) {}
    }

    playHangupTone();
    isCallActive = false;

    updateStatus('কল সমাপ্ত');
    updateCaption('সিস্টেম', 'কল ডিসকানেক্ট করা হয়েছে। ইউকা টেকনিক্যাল ইনস্টিটিউটে যোগাযোগ করার জন্য ধন্যবাদ।');

    const screen = document.getElementById('ukaCallScreen');
    if (screen) screen.classList.remove('ringing', 'speaking', 'listening', 'thinking');

    setTimeout(() => {
      const modal = document.getElementById('ukaCallModal');
      if (modal) modal.classList.remove('active');
    }, 1200);
  }

  return {
    startCall,
    endCall
  };
})();
