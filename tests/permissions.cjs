/* Run via Firebase emulators; never against a production project. */
const fs=require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,deleteDoc,serverTimestamp,collection,getDocs,query,where}=require('firebase/firestore');
const {ref,uploadBytes}=require('firebase/storage');
(async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-imob-rules',firestore:{rules:fs.readFileSync('firestore.rules','utf8')},storage:{rules:fs.readFileSync('storage.rules','utf8')}});
 try{
  await env.withSecurityRulesDisabled(async ctx=>{
   const db=ctx.firestore();
   await setDoc(doc(db,'roles/owner'),{admin:true,owner:true});
   await setDoc(doc(db,'roles/admin'),{admin:true,owner:false});
   await setDoc(doc(db,'memberProfiles/bob'),{displayName:'Bob',bio:'',avatarUrl:'',updatedAt:new Date()});
   await setDoc(doc(db,'showcase/draft'),{published:false,title:'Draft'});
   await setDoc(doc(db,'showcase/public'),{published:true,title:'Public'});
  });
  const alice=env.authenticatedContext('alice',{email:'alice@example.com'}).firestore();
  const admin=env.authenticatedContext('admin',{email:'admin@example.com'}).firestore();
  const anon=env.unauthenticatedContext().firestore();
  const profile={displayName:'Alice',bio:'My build',avatarUrl:'',updatedAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(alice,'memberProfiles/alice'),profile));
  await assertFails(setDoc(doc(alice,'memberProfiles/bob'),profile));
  await assertFails(setDoc(doc(alice,'memberProfiles/alice'),{...profile,admin:true}));
  await assertFails(setDoc(doc(alice,'roles/alice'),{admin:true,owner:false}));
  await assertSucceeds(setDoc(doc(admin,'roles/alice'),{admin:true,owner:false}));
  await assertFails(setDoc(doc(admin,'roles/owner'),{admin:false,owner:false}));
  await assertFails(deleteDoc(doc(admin,'roles/owner')));
  await assertFails(setDoc(doc(admin,'roles/admin'),{admin:false,owner:false}));
  await assertSucceeds(setDoc(doc(admin,'roles/alice'),{admin:false,owner:false}));
  await assertFails(setDoc(doc(alice,'members/alice'),{email:'other@example.com',updatedAt:serverTimestamp()}));
  await assertSucceeds(setDoc(doc(alice,'members/alice'),{email:'alice@example.com',updatedAt:serverTimestamp()}));
  await assertFails(getDocs(collection(alice,'members')));
  await assertFails(getDoc(doc(anon,'members/alice')));
  await assertSucceeds(getDocs(collection(admin,'members')));
  await assertFails(getDoc(doc(anon,'showcase/draft')));
  await assertFails(getDocs(collection(anon,'showcase')));
  await assertSucceeds(getDocs(query(collection(anon,'showcase'),where('published','==',true))));
  const home={intro:'Hello',title:'Our video',videoUrl:'https://www.youtube.com/watch?v=RPGg_y2FHNs',imageUrl:'',updatedAt:serverTimestamp()};
  await assertFails(setDoc(doc(alice,'siteContent/home'),home));
  await assertSucceeds(setDoc(doc(admin,'siteContent/home'),home));
  const update={title:'Track day',body:'Garage work',url:'',imageUrl:'',published:false,createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(admin,'showcase/new'),update));
  const media={kind:'photo',title:'Picture',caption:'',url:'https://example.com/pic.jpg',path:'member-media/alice/file',createdAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(alice,'memberProfiles/alice/media/file'),media));
  await assertFails(setDoc(doc(alice,'memberProfiles/bob/media/file'),{...media,path:'member-media/bob/file'}));
  await assertSucceeds(deleteDoc(doc(admin,'memberProfiles/alice/media/file')));
  await assertFails(setDoc(doc(alice,'profiles/alice'),{isAdmin:true}));
  await assertFails(setDoc(doc(alice,'users/alice'),{isAdmin:true}));
  const storage=env.authenticatedContext('alice',{email:'alice@example.com'}).storage();
  await assertSucceeds(uploadBytes(ref(storage,'member-media/alice/pic'),new Uint8Array([1,2,3]),{contentType:'image/jpeg'}));
  await assertFails(uploadBytes(ref(storage,'member-media/bob/pic'),new Uint8Array([1]),{contentType:'image/jpeg'}));
  await assertFails(uploadBytes(ref(storage,'member-media/alice/html'),new Uint8Array([1]),{contentType:'text/html'}));
  await assertFails(uploadBytes(ref(storage,'member-media/alice/large'),new Uint8Array(10*1024*1024+1),{contentType:'image/jpeg'}));
  await assertFails(uploadBytes(ref(storage,'site-media/alice/feature'),new Uint8Array([1]),{contentType:'image/jpeg'}));
  const adminStorage=env.authenticatedContext('admin',{email:'admin@example.com'}).storage();
  await assertSucceeds(uploadBytes(ref(adminStorage,'site-media/admin/feature'),new Uint8Array([1]),{contentType:'image/jpeg'}));
  console.log('PASS: profile ownership, self-escalation denial, owner protection, admin promotion/demotion, private email, draft privacy, content management, image type/size and upload ownership.');
 }finally{await env.cleanup();}
})().catch(error=>{console.error(error);process.exit(1)});
