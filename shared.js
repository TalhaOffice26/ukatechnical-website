/* Shared NAV + FOOTER — edit here, every page updates. */
const L=(items)=>items.map(([t,h])=>`<li><a href="${h}">${t}</a></li>`).join('');
const NAV=`
<header id="nav"><div class="wrap">
 <a class="logo" href="index.html"><img src="/logo.png" style="height:46px;max-width:220px;object-fit:contain" alt="" onerror="this.outerHTML='<i>UKA</i>'"><span></small></span></a>
 <ul class="menu" id="menu">
  <li class="has"><a href="ielts-exam.html">IELTS Exam</a><ul class="dd">${L([['About IELTS','ielts-exam.html'],['IELTS Academic','ielts-academic.html'],['IELTS General Training','ielts-general.html'],['Exam Dates & Fees','exam-dates.html'],['Book Your Exam','book-exam.html'],['Results','results.html']])}</ul></li>
  <li class="has"><a href="mock-test.html">Mock Test</a><ul class="dd">${L([['IELTS Mock Test','mock-test.html'],['Spoken English Test','spoken-test.html'],['Book a Mock Test','book-mock.html']])}</ul></li>
  <li class="has"><a href="courses.html">Our Courses</a><ul class="dd">${L([['IELTS Preparation','ielts-courses.html'],['Spoken English (Adult)','spoken-adult.html'],['Junior Spoken English','junior-spoken.html'],['Secondary English Test','secondary-test.html'],['Primary English Test','primary-test.html'],['Online Courses','online-courses.html'],['One to One Session','one-to-one.html']])}</ul></li>
  <li class="has"><a href="about.html">About Us</a><ul class="dd">${L([['Our Story','our-story.html'],['Our Branches','branches.html'],['Career','career.html'],['Our Teachers','teachers.html'],['Gallery','gallery.html']])}</ul></li>
  <li><a href="contact.html">Contact Us</a></li>
 </ul>
 <div class="auth"><a href="login.html">Login</a><a class="s" href="signup.html">Sign up</a></div>
 <button class="burger" id="burger" aria-label="Menu">☰</button>
</div></header>`;
const FOOT=`
<footer id="footer"><div class="wrap">
 <div class="fgrid">
  <div><a class="logo" href="index.html"><img src="/logo.png" style="height:46px;max-width:220px;object-fit:contain" alt="" onerror="this.outerHTML='<i>UKA</i>'"><span>UKA Technical Institute</span></a>
   <p>Official British Council IELTS exam center and English learning institute. Learn, practise and achieve your dream score.</p>
   <div class="soc"><a href="#">f</a><a href="#">in</a><a href="#">yt</a><a href="#">ig</a></div></div>
  <div><h4>Courses</h4><ul>${L([['IELTS Courses','ielts-courses.html'],['Online Courses','online-courses.html'],['Mock Test','mock-test.html'],['Junior Spoken English','junior-spoken.html'],['Spoken English Adult','spoken-adult.html'],['One to One Session','one-to-one.html']])}</ul></div>
  <div><h4>Services</h4><ul>${L([['IELTS Exam','ielts-exam.html'],['SET','set.html'],['PET','pet.html'],['Study Abroad','study-abroad.html']])}</ul></div>
  <div><h4>Company</h4><ul>${L([['About Us','about.html'],['Contact Us','contact.html'],['News & Events','news.html']])}</ul></div>
  <div><h4>Support</h4><ul>${L([['Help Center','support.html'],['Contact Support','contact.html']])}</ul></div>
  <div><h4>My Account</h4><ul>${L([['Login','login.html'],['Sign up','signup.html'],['My Bookings','account.html']])}<li style="margin-top:18px"><a href="faq.html"><b style="color:#fff">FAQ</b></a></li></ul></div>
 </div>
 <div class="copy"><span>© ${new Date().getFullYear()} UKA Technical Institute. All rights reserved.</span><span><a href="privacy.html">Privacy</a> &nbsp;|&nbsp; <a href="terms.html">Terms</a></span></div>
</div></footer>`;
document.getElementById('site-nav').innerHTML=NAV;
document.getElementById('site-footer').innerHTML=FOOT;
const nav=document.getElementById('nav'),menu=document.getElementById('menu');
const sc=()=>nav.classList.toggle('solid',scrollY>40);sc();addEventListener('scroll',sc,{passive:true});
document.getElementById('burger').onclick=()=>menu.classList.toggle('open');
menu.querySelectorAll('.has>a').forEach(a=>a.addEventListener('click',e=>{if(innerWidth<=980&&!a.parentNode.classList.contains('show')){e.preventDefault();a.parentNode.classList.add('show')}}));