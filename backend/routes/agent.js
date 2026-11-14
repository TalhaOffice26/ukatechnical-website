const router = require('express').Router();
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const Admission = require('../models/Admission');
const ExamDate = require('../models/ExamDate');
const Setting = require('../models/Setting');

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];

// Memory cache for audio snippets (avoids repeated network calls & saves credits)
const audioCache = new Map();

// ElevenLabs API Keys Pool (Multi-Account Rotation)
const rawKeys = process.env.ELEVENLABS_API_KEYS || '';
const ELEVENLABS_KEYS = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

// High-fidelity Bangladeshi Human Voice mapping
// Primary: Rayhan (vvOYlSJHf8lTWIG4tDNP) - authentic energetic Bangladeshi male voice
// Female: Rimjhim (8e81Dm4CldjBZSlArGoT) - authentic Bangladeshi female voice
const ELEVEN_VOICE_MAP = {
  rayhan: 'vvOYlSJHf8lTWIG4tDNP',
  tanvir: 'vvOYlSJHf8lTWIG4tDNP',
  pradeep: 'vvOYlSJHf8lTWIG4tDNP',
  rimjhim: '8e81Dm4CldjBZSlArGoT',
  sara: '8e81Dm4CldjBZSlArGoT',
  nabanita: '8e81Dm4CldjBZSlArGoT'
};

/**
 * Universal Speech Synthesizer:
 * 1. Checks memory cache (0 API calls, 0 credits used)
 * 2. Tries ElevenLabs Rayhan / Rimjhim (if account has Starter tier)
 * 3. Fallback: Authentic Microsoft Bangladeshi Neural voice (bn-BD-Nabanita / bn-BD-Pradeep)
 */
async function synthesizeAudio(spokenText, voiceChoice = 'rayhan') {
  const cacheKey = spokenText + '_' + voiceChoice;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  // 1. Attempt ElevenLabs (Rayhan or Rimjhim) if unlocked
  let activeKeyList = [...ELEVENLABS_KEYS];
  let voiceId = ELEVEN_VOICE_MAP[voiceChoice] || ELEVEN_VOICE_MAP.rayhan;

  try {
    const [dbKey, dbVoice] = await Promise.all([
      Setting.findOne({ key: 'elevenlabsApiKey' }),
      Setting.findOne({ key: 'agentVoiceId' })
    ]);
    if (dbKey && dbKey.value && String(dbKey.value).trim()) {
      const customKeys = String(dbKey.value).split(',').map(k => k.trim()).filter(Boolean);
      if (customKeys.length) activeKeyList = [...customKeys, ...activeKeyList];
    }
    if (dbVoice && dbVoice.value && String(dbVoice.value).trim()) {
      voiceId = String(dbVoice.value).trim();
    }
  } catch (e) {}

  if (activeKeyList.length > 0) {
    for (let attempts = 0; attempts < activeKeyList.length; attempts++) {
      const activeKey = activeKeyList[currentKeyIndex % activeKeyList.length];
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': activeKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: spokenText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.08,
              use_speaker_boost: true
            }
          })
        });

        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const base64 = buffer.toString('base64');
          const result = { base64, buffer, mime: 'audio/mpeg' };
          if (audioCache.size < 500) {
            audioCache.set(cacheKey, result);
          }
          return result;
        }

        // If 402 payment required (Free tier trying to use library voice), log once and skip to Edge-TTS
        if (res.status === 402) {
          console.warn(`ElevenLabs library voice (${voiceId}) requires Starter plan ($1). Falling back to Native Bangladeshi Neural voice.`);
          break;
        }

        console.warn(`ElevenLabs key ${currentKeyIndex + 1} status ${res.status}. Rotating key...`);
        currentKeyIndex = (currentKeyIndex + 1) % ELEVENLABS_KEYS.length;
      } catch (err) {
        console.warn(`ElevenLabs request error:`, err.message);
        break;
      }
    }
  }

  // 2. Native Bangladeshi Voice Fallback (bn-BD-Nabanita / bn-BD-Pradeep)
  try {
    const edgeVoice = (voiceChoice === 'rayhan' || voiceChoice === 'tanvir' || voiceChoice === 'pradeep') 
      ? 'bn-BD-PradeepNeural' 
      : 'bn-BD-NabanitaNeural';
    const tts = new MsEdgeTTS();
    await tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(spokenText, { rate: '+3%', pitch: '+0Hz' });
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on('data', c => chunks.push(c));
      audioStream.on('end', resolve);
      audioStream.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');
    const result = { base64, buffer, mime: 'audio/mpeg' };
    if (audioCache.size < 500) {
      audioCache.set(cacheKey, result);
    }
    return result;
  } catch (e) {
    console.error('Bangladeshi TTS fallback error:', e.message);
    return null;
  }
}

// Helper to format date in Bengali
function formatBengaliDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const day = String(d.getDate()).replace(/\d/g, x => bnDigits[x]);
  const month = bnMonths[d.getMonth()];
  const year = String(d.getFullYear()).replace(/\d/g, x => bnDigits[x]);
  return `${day} ${month} ${year}`;
}

// Convert English numbers to Bengali numerals
function toBengaliDigits(str) {
  if (!str) return '';
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(str).replace(/\d/g, d => bn[d]);
}

// Helper to convert numbers and prices to natural spoken Bengali words
function numberToBengaliWords(text) {
  if (!text) return '';
  let s = String(text);

  // Percentages and terms first!
  s = s.replace(/50\s*%\s*|৫০\s*%\s*|৫০\s*শতাংশ/g, 'পঞ্চাশ পারসেন্ট ');
  s = s.replace(/\b1-on-1\b|\b1-to-1\b|১-অন-১|১-টু-১/gi, 'ওয়ান টু ওয়ান');

  // Exact UKA fees and common numbers to natural spoken Bengali words
  s = s.replace(/\b31[,.]?100\b|৩১[,.]?১০০/g, 'একত্রিশ হাজার একশত');
  s = s.replace(/\b16[,.]?000\b|১৬[,.]?০০০/g, 'ষোলো হাজার');
  s = s.replace(/\b8[,.]?000\b|৮[,.]?০০০/g, 'আট হাজার');
  s = s.replace(/\b4[,.]?000\b|৪[,.]?০০০/g, 'চার হাজার');
  s = s.replace(/\b3[,.]?000\b|৩[,.]?০০০/g, 'তিন হাজার');
  s = s.replace(/\b5[,.]?000\b|৫[,.]?০০০/g, 'পাঁচ হাজার');
  s = s.replace(/\b2[,.]?000\b|২[,.]?০০০/g, 'দুই হাজার');
  s = s.replace(/\b1[,.]?400\b|১[,.]?৪০০/g, 'চৌদ্দশত');
  s = s.replace(/\b750\b|৭৫০/g, 'সাতশত পঞ্চাশ');
  s = s.replace(/\b300\b|৩০০/g, 'তিনশত');

  // Counts and class numbers
  s = s.replace(/\b32\b|৩২/g, 'বত্রিশ');
  s = s.replace(/\b30\b|৩০/g, 'ত্রিশ');
  s = s.replace(/\b26\b|২৬/g, 'ছাব্বিশ');
  s = s.replace(/\b15\b|১৫/g, 'পনেরো');
  s = s.replace(/\b10\b|১০/g, 'দশ');
  s = s.replace(/(?<![0-9০-৯])(?:8|৮)(?![0-9০-৯])/g, 'আট');
  s = s.replace(/(?<![0-9০-৯])(?:6|৬)(?![0-9০-৯])/g, 'ছয়');
  s = s.replace(/(?<![0-9০-৯])(?:5|৫)(?![0-9০-৯])/g, 'পাঁচ');
  s = s.replace(/(?<![0-9০-৯])(?:4|৪)(?![0-9০-৯])/g, 'চার');
  s = s.replace(/(?<![0-9০-৯])(?:3|৩)(?![0-9০-৯])/g, 'তিন');
  s = s.replace(/(?<![0-9০-৯])(?:2|২)(?![0-9০-৯])/g, 'দুই');
  s = s.replace(/(?<![0-9০-৯])(?:1|১)(?![0-9০-৯])/g, 'এক');

  return s;
}

// Phonetic sanitizer to make Edge TTS Bengali sound 100% human & clear
function sanitizeForBengaliTTS(text) {
  if (!text) return '';
  let s = String(text);

  // Strip markdown, asterisks, brackets, formatting tags
  s = s.replace(/[*#_~`\[\]()]/g, ' ');
  s = s.replace(/<<<LEAD:[\s\S]*?>>>/g, '');

  // Convert numbers & currency to authentic spoken Bengali words first
  s = s.replace(/\bTK\b|\bTk\b|\btk\b|\bটাকা\b/g, ' টাকা');
  s = numberToBengaliWords(s);

  // Ensure UKA & British Council are pronounced naturally
  s = s.replace(/\bUKA\b/gi, 'ইউকা');
  s = s.replace(/\bBritish\s*Council\b/gi, 'ব্রিটিশ কাউন্সিল');
  s = s.replace(/\bIELTS\b/gi, 'আইইএলটিএস');
  s = s.replace(/\bMock\s*Test\b/gi, 'মক টেস্ট');
  s = s.replace(/\bFull[\s-]*length\b/gi, 'ফুল লেংথ');
  s = s.replace(/\bSpeaking\b/gi, 'স্পিকিং');
  s = s.replace(/\bListening\b/gi, 'লিসেনিং');
  s = s.replace(/\bReading\b/gi, 'রিডিং');
  s = s.replace(/\bWriting\b/gi, 'রাইটিং');
  s = s.replace(/\bSpoken\s*English\b/gi, 'স্পোকেন ইংলিশ');
  s = s.replace(/\bJunior\s*Spoken\b/gi, 'জুনিয়র স্পোকেন');
  s = s.replace(/\bPhonetics\b/gi, 'ফোনেটিক্স');
  s = s.replace(/\bLanguage\s*Club\b/gi, 'ল্যাঙ্গুয়েজ ক্লাব');
  s = s.replace(/\bComputer[\s-]*delivered\b/gi, 'কম্পিউটার ডেলিভার্ড');
  s = s.replace(/\bDell\b/gi, 'ডেল');
  s = s.replace(/\bCore[\s-]*i5\b/gi, 'কোর আই ফাইভ');
  s = s.replace(/\bBanasree\b/gi, 'বনশ্রী');
  s = s.replace(/\bRampura\b/gi, 'রামপুরা');
  s = s.replace(/\bAftabnagar\b/gi, 'আফতাবনগর');
  s = s.replace(/\bBadda\b/gi, 'বাড্ডা');
  s = s.replace(/\bKhilgaon\b/gi, 'খিলগাঁও');
  s = s.replace(/\bHatirjheel\b/gi, 'হাতিরঝিল');
  s = s.replace(/\bMeradia\b/gi, 'মেরাদিয়া');
  s = s.replace(/\bAarong\b/gi, 'আড়ং');
  s = s.replace(/\bShopping\s*Mall\b/gi, 'শপিং মল');

  // Fix common awkward pronunciations in TTS
  s = s.replace(/শুভ\s*নাম/g, 'পুরো নাম');
  s = s.replace(/শুভ/g, 'শুভো');

  // Convert commas and pauses into natural prosody
  s = s.replace(/([।!?])\s*/g, '$1... ');
  s = s.replace(/,\s*/g, ', ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// Unified single-roundtrip endpoint: Gemini Chat + Neural Bangladeshi Audio synthesis
router.post('/interact', async (req, res) => {
  const { message, history, voice } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Voice selection: Default to authentic Bangladeshi Female (Nabanita) or Male (Pradeep)
  const voiceName = voice === 'pradeep' ? 'bn-BD-PradeepNeural' : 'bn-BD-NabanitaNeural';

  // Fetch real upcoming exam dates dynamically from MongoDB
  let liveDatesText = 'আসন্ন পরীক্ষার তারিখ ও সিট:\n';
  try {
    const dates = await ExamDate.find({ isActive: true, kind: 'date' }).sort('examDate').limit(6);
    if (dates.length > 0) {
      liveDatesText += dates.map(d => {
        const dt = formatBengaliDate(d.examDate);
        return `- ${d.testType}: ${dt} (${d.slot || 'মর্নিং স্লট'}), ফি: ${toBengaliDigits(d.fee || 31100)} টাকা, সিট বাকি: ${toBengaliDigits(d.seats || 10)}টি`;
      }).join('\n');
    } else {
      liveDatesText += '- আসন্ন ডেটসমূহ: নিয়মিত মর্নিং ও ডে স্লটে সিট খালি রয়েছে, অফিশিয়াল ফি ৩১,১০০ টাকা।';
    }
  } catch (e) {
    liveDatesText += '- নিয়মিত কম্পিউটার এক্সাম স্লট উপলব্ধ রয়েছে, ফি ৩১,১০০ টাকা।';
  }

  const DYNAMIC_PROMPT = `
You are Sara (সারা), Senior Admissions Counselor at UKA Technical Institute (ইউকা টেকনিক্যাল ইনস্টিটিউট), Banasree, Dhaka.
You are speaking live to a student or guardian over a real telephone voice call.

CONVERSATION STYLE & EMOTIONAL EXPRESSIONS (MAKE IT SOUND 100% REAL & ALIVE):
1. LIVELY HUMAN EXPRESSIONS: Begin your responses with warm, energetic, and caring conversational openers:
   - "জি অবশ্যই! আপনি একদম সঠিক জায়গায় এসেছেন।"
   - "দারুণ একটি প্রশ্ন করেছেন! একটু বুঝিয়ে বলছি..."
   - "আসলে সত্যি বলতে কি, আমাদের ৫০% অফারটি কিন্তু দারুণ চলছে!"
   - "নিশ্চিন্তে থাকুন, আমি আপনাকে সব বিস্তারিত বলে দিচ্ছি।"
   - "খুব চমৎকার! আপনি কবে নাগাদ পরীক্ষা দিতে চাচ্ছেন?"
2. SHORT & CRISP: 1 to 2 short sentences (maximum 18-22 words). Never give long textbook lectures over the phone.
3. ENGAGING QUESTION: Always conclude with a sweet, helpful question to keep the caller engaged.
4. GENDER NEUTRAL: Always address respectfully as "আপনি", never say "ভাইয়া".
5. CLEAN SPOKEN WORDS: Never output symbols (*, #, bullet points). All numbers and prices are spoken in natural Bengali words.

COMPLETE & ACCURATE UKA KNOWLEDGE BASE (DO NOT GIVE ANY INVENTED OR WRONG FACTS):
• ব্রিটিশ কাউন্সিল কম্পিউটার আইইএলটিএস এক্সাম:
  - অফিশিয়াল ব্রিটিশ কাউন্সিল টেস্ট ফি: ৩১,১০০ টাকা।
  - ইউকা এক্সক্লুসিভ অফার: আমাদের এখান থেকে এক্সাম ডেট বুক করলে ৫টি ফুল-লেংথ কম্পিউটার মক টেস্ট এবং ১ মাস আমাদের মেইন এক্সাম ল্যাবে আনলিমিটেড প্র্যাকটিস সম্পূর্ণ ফ্রি!
  ${liveDatesText}

• মক টেস্ট সুবিধা (Mock Test):
  - ফুল কম্পিউটার মক টেস্ট: ৫০% ছাড়ে মাত্র ৭৫০ টাকা (রেগুলার ১৫০০ টাকা)।
  - সিঙ্গেল মডিউল টেস্ট (যেমন শুধু স্পিকিং বা রাইটিং): মাত্র ৩০০ টাকা।
  - প্যাকেজ অফার: ২টি ১৪০০ টাকা, ৫টি ৩০০০ টাকা, ১০টি ৫০০০ টাকা।
  - ব্রিটিশ কাউন্সিল স্ট্যান্ডার্ড ল্যাবে ডেল আই-ফাইভ পিসিতে রিয়েল এক্সামিনার সফটওয়্যারে পরীক্ষা এবং ২৪ ঘণ্টার মধ্যে রেজাল্ট ও ফিডব্যাক।

• কোর্সসমূহ (Courses):
  - Easy IELTS কোর্স: ১৬,০০০ টাকার কোর্স ৫০% ছাড়ে মাত্র ৮,০০০ টাকা (৩২টি ক্লাস, ৩ মাস মেয়াদী, সপ্তাহে ৩ দিন মূল ক্লাস + সপ্তাহে ৬ দিন ফ্রি ল্যাব প্র্যাকটিস, ৫টি ফুল মক ও ৮টি সেকশনাল মক ফ্রি)।
  - One-to-One IELTS: ব্যক্তিগত ১ জন শিক্ষক ১ জন ছাত্র, মাত্র ১৬,০০০ টাকা (২৬টি ক্লাস, আড়াই মাস)।
  - Executive Spoken English & Phonetics: ৮,০০০ টাকার কোর্স ৫০% ছাড়ে মাত্র ৪,০০০ টাকা (৩০টি ক্লাস, আড়াই মাস, সপ্তাহে ৩ দিন ক্লাস + সপ্তাহে ৩ দিন ফ্রি ল্যাঙ্গুয়েজ ক্লাব)।
  - Junior Spoken English: স্কুল শিক্ষার্থীদের জন্য (ক্লাস ১ থেকে ৮), মাসিক ফি মাত্র ২,০০০ টাকা (কোনো এককালীন বড় কোর্স ফি নেই)। বই-খাতা ও ল্যাঙ্গুয়েজ ক্লাব ফ্রি।

• ক্যাম্পাস লোকেশন ও যাতায়াত (Location):
  - ঠিকানা: হাউস ১২, রোড এভিনিউ-৮, ব্লক এম, বনশ্রী, ঢাকা।
  - ল্যান্ডমার্ক: দক্ষিণ বনশ্রী মেরাদিয়া বাজার আড়ং শপিং মলের একদম পাশেই ইউকা স্কুল বিল্ডিং।
  - রামপুরা ব্রিজ বা হাতিরঝিল থেকে রিকশায় মাত্র ৫-৭ মিনিট, আফতাবনগর বা বাড্ডা থেকে ৫ মিনিট।

• ভিজিটের সময় ও অফিস আওয়ার্স:
  - প্রতিদিন খোলা: সকাল ৮:৩০ থেকে রাত ৮:৩০ পর্যন্ত। শুক্রবার সকাল ৯:০০ থেকে সন্ধ্যা ৭:০০। যে কেউ এসে ল্যাব ভিজিট করতে পারে।

• হটলাইন নম্বর:
  - হোয়াটসঅ্যাপ ও জেনারেল: ০১৫১৬-৫৭৯৭৬০
  - অ্যাডমিশন ডেস্ক: ০১৪০৭-০৬৩৪৬০, ০১৪০৭-০৬৩৪৩১

LEAD EXTRACTION:
- সিট বুকিং বা ডিসকাউন্ট রিজার্ভের জন্য ফোন নম্বর বা নাম জানতে চান।
- ফোন বা নাম পেলে উত্তরের একদম শেষে লিখুন:
<<<LEAD:{"name":"...","phone":"...","topic":"..."}>>>
`;

  // Build conversational contents for Gemini
  const contents = [];
  if (Array.isArray(history)) {
    history.slice(-8).forEach(h => {
      contents.push({
        role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(h.text || h.message || '') }]
      });
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  let replyText = '';
  for (const m of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: DYNAMIC_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 250
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        replyText = data.candidates[0].content.parts[0].text;
        break;
      }
    } catch (e) {}
  }

  if (!replyText) {
    replyText = 'জি, আমি শুনতে পাচ্ছি। ইউকা টেকনিক্যাল ইনস্টিটিউটের ব্রিটিশ কাউন্সিল আইইএলটিএস এক্সাম, ৫০% ছাড়ে মক টেস্ট নাকি স্পোকেন কোর্স—কোন বিষয়ে আপনাকে সহযোগিতা করতে পারি?';
  }

  // Parse LEAD metadata tag
  let extracted = null;
  const leadMatch = replyText.match(/<<<LEAD:([\s\S]*?)>>>/);
  if (leadMatch) {
    try {
      extracted = JSON.parse(leadMatch[1]);
    } catch (e) {}
    replyText = replyText.replace(/<<<LEAD:[\s\S]*?>>>/, '').trim();
  }

  // Sanitize text for crisp, human-like Bengali speech
  const spokenText = sanitizeForBengaliTTS(replyText);

  // Auto-save lead to database if phone is present
  let leadSaved = false;
  if (extracted && extracted.phone && /^[0-9+\-\s০-৯]{6,20}$/.test(extracted.phone)) {
    try {
      const cleanPhone = extracted.phone.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);
      await Admission.create({
        name: extracted.name || 'AI Phone Caller',
        phone: cleanPhone,
        courseTitle: `AI Voice Lead: ${extracted.topic || 'General Inquiry'}`,
        message: `[Live AI Phone Call with Sara]\nCaller Name: ${extracted.name || 'Not provided'}\nPhone: ${cleanPhone}\nTopic: ${extracted.topic || 'General'}\nLast Utterance: ${message}`
      });
      leadSaved = true;
    } catch (e) {}
  }

  // Synthesize audio using ElevenLabs Human Voice (with multi-key rotation and Edge-TTS fallback)
  let audioBase64 = null;
  try {
    const audioResult = await synthesizeAudio(spokenText, voice || 'nabanita');
    if (audioResult && audioResult.base64) {
      audioBase64 = audioResult.base64;
    }
  } catch (err) {
    console.warn('Server audio synthesis failed in interact:', err.message);
  }

  res.json({
    reply: replyText,
    spokenText,
    audioBase64,
    extracted,
    leadSaved
  });
});

// Dedicated speak endpoint for initial greetings and quick phrases
router.post('/speak', async (req, res) => {
  let text = (req.body && req.body.text || '').trim();
  const voiceChoice = (req.body && req.body.voice) || 'nabanita';

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const spokenText = sanitizeForBengaliTTS(text);

  try {
    const audioResult = await synthesizeAudio(spokenText, voiceChoice);
    if (!audioResult || !audioResult.buffer) {
      return res.status(500).json({ message: 'Failed to synthesize speech' });
    }

    res.setHeader('Content-Type', audioResult.mime || 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audioResult.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Voice generation error', error: err.message });
  }
});

module.exports = router;
