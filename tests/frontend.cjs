const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
(async()=>{
 const dom=new JSDOM(fs.readFileSync('profile.html','utf8'),{url:'https://example.com/profile.html',runScripts:'outside-only'});
 const w=dom.window;let saved;const user={uid:'alice',email:'alice@example.com',displayName:'Alice'};
 const profile={displayName:'Alice',bio:'Existing bio',avatarUrl:'https://example.com/avatar.jpg'};
 const media={kind:'photo',title:'<img src=x onerror=alert(1)>',caption:'<script>alert(1)</script>',url:'https://example.com/car.jpg',path:'member-media/alice/car'};
 const mediaDoc={data:()=>media,ref:{delete:async()=>{}}};
 const query={orderBy(){return this},limit(){return this},startAfter(){return this},get:async()=>({docs:[mediaDoc],size:1})};
 const db={collection(name){return {doc(uid){return {
  get:async()=>({exists:name==='memberProfiles',data:()=>profile}),
  set:async data=>{if(name==='memberProfiles')saved=data},
  collection:()=>query,
  onSnapshot:cb=>{queueMicrotask(()=>cb({exists:false}));return ()=>{};}
 };}};}};
 const auth={onAuthStateChanged(cb){queueMicrotask(()=>cb(user));},currentUser:user};
 const firestore=()=>db;firestore.FieldValue={serverTimestamp:()=> 'SERVER_TIME'};
 w.CONFIG={FIREBASE_CONFIG:{}};w.firebase={apps:[{}],auth:()=>auth,firestore,storage:()=>({})};
 w.eval(fs.readFileSync('portal.js','utf8'));w.eval(fs.readFileSync('profile.js','utf8'));
 const flush=()=>new Promise(resolve=>setTimeout(resolve,20));await flush();
 assert.equal(w.document.getElementById('profile-media').querySelectorAll('article').length,1);
 assert.equal(w.document.querySelector('#profile-media script'),null);
 assert.equal(w.document.getElementById('member-avatar').getAttribute('src'),profile.avatarUrl);
 w.document.getElementById('bio').value='Updated biography';
 w.document.getElementById('profile-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await flush();
 assert.equal(saved.bio,'Updated biography');assert.equal(saved.avatarUrl,profile.avatarUrl);
 assert.equal(w.document.getElementById('profile-media').querySelectorAll('article').length,1);
 assert.equal(w.Portal.safeURL('javascript:alert(1)'), '');
 assert.equal(w.Portal.safeURL('https://user:password@example.com'), '');
 assert.equal(w.Portal.youtubeID('https://youtu.be/RPGg_y2FHNs'),'RPGg_y2FHNs');
 assert.equal(w.Portal.youtubeID('https://youtube.com.attacker.test/watch?v=RPGg_y2FHNs'),'');
 assert.equal(w.Portal.youtubeID('https://youtube.com/watch?v=bad%22onload%3Dalert(1)'), '');
 console.log('PASS: existing gallery/avatar retained after bio edit; malicious text/links cannot become HTML or embed sources.');
 dom.window.close();
})().catch(e=>{console.error(e);process.exit(1)});
