const fs = require('fs');
const path = 'frontend/index.html';
let html = fs.readFileSync(path, 'utf8');

// Replace cpn block
html = html.replace(
  /<div class="cpn" id="cpn"[\s\S]*?<div id="agentMount">[\s\S]*?<\/div><\/div>/,
  `<div class="cpn" id="cpn" role="dialog" aria-label="Call agent"><button class="x" id="cx" aria-label="Close">×</button><h3>Talk to our AI Admissions Officer</h3><p>Ask about IELTS exam dates, 50% off mock tests, courses and fees, right now.</p>\r\n<div id="agentMount" style="border:none;padding:0;min-height:auto;margin-top:14px"><button class="btn red" id="startAiCallModalBtn" style="width:100%;font-size:15px;padding:14px;border-radius:30px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px">📞 Start Live Voice Call with Sara</button></div></div>`
);

// Replace click handler in index.html script
html = html.replace(
  /const cpn=\$\('#cpn'\);[\s\S]*?\$\('#cx'\)\.onclick=\(\)=>cpn\.classList\.remove\('open'\);/,
  `const cpn=$('#cpn');$('#callBtn').onclick=(e)=>{e.preventDefault();if(window.UKA_Agent){window.UKA_Agent.startCall();}else{cpn.classList.toggle('open');}};$('#cx').onclick=()=>cpn.classList.remove('open');document.addEventListener('click',e=>{if(e.target.closest('#startAiCallModalBtn')){cpn.classList.remove('open');if(window.UKA_Agent)window.UKA_Agent.startCall();}});`
);

// Ensure call-agent.css and call-agent.js are in index.html
if (!html.includes('call-agent.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="css/call-agent.css">\r\n</head>');
}
if (!html.includes('call-agent.js')) {
  html = html.replace('</body>', '<script src="js/call-agent.js"></script>\r\n</body>');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated frontend/index.html');
