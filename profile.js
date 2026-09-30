(() => {
 const P=Portal; const params=new URLSearchParams(location.search);
 const requested=params.get('uid')||params.get('userId');
 let uid=null,profile={},mediaCursor=null,loading=false,sessionToken=0;
 const own=()=>P.user?.uid===uid;
 const validUID=value=>value&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
 const renderProfile=()=>{
  P.$('member-profile').hidden=false;
  P.$('member-name').textContent=profile.displayName||'Member';
  P.$('member-bio').textContent=profile.bio||'';
  P.$('member-avatar').src=P.safeURL(profile.avatarUrl)||'default-profile.webp';
  if(P.$('editor-panel')){
   P.$('editor-panel').hidden=!own();P.$('media-panel').hidden=!own();
   P.$('displayName').value=profile.displayName||P.user?.displayName||'';
   P.$('bio').value=profile.bio||'';
  }
 };
 const loadMedia=async(reset=false)=>{
  if(!uid||loading)return; loading=true;
  const currentUID=uid;
  try {
   if(reset){mediaCursor=null;P.$('profile-media').replaceChildren();}
   let q=P.db.collection('memberProfiles').doc(currentUID).collection('media').orderBy('createdAt','desc').limit(12);
   if(mediaCursor)q=q.startAfter(mediaCursor);
   const result=await q.get();if(uid!==currentUID)return;
   for(const doc of result.docs){const item=doc.data();
    P.$('profile-media').append(P.mediaCard(item,(own()||P.role.admin)?async()=>{
     await P.removeMedia(doc);P.feedback('Item removed.');await loadMedia(true);
    }:null));
   }
   mediaCursor=result.docs.at(-1)||null;P.$('more-media').hidden=result.size<12;
   if(!P.$('profile-media').children.length)P.$('profile-media').append(P.node('p','No pictures or links shared yet.'));
  }finally{loading=false;}
 };
 P.onSession(async user=>{
  const token=++sessionToken;
  uid=requested||user?.uid;
  if(P.$("editor-panel")){P.$("editor-panel").hidden=!own();P.$("media-panel").hidden=!own();}
  if(!uid){P.feedback('Log in to create and edit your profile.');P.$('member-profile').hidden=true;return;}
  if(!validUID(uid)){P.feedback('This profile address is invalid.',true);return;}
  try {
   const result=await P.db.collection('memberProfiles').doc(uid).get();
   if(token!==sessionToken)return;
   if(result.exists)profile=result.data();
   else if(own()){
    profile={displayName:user.displayName||'',bio:'',avatarUrl:''};
    // Read only the signed-in member's old profile. Convert old rich text to text.
    try {const legacy=await P.db.collection('profiles').doc(uid).get();
     if(legacy.exists){const old=legacy.data();const parsed=new DOMParser().parseFromString(old.bio||old.profileContent||'', 'text/html');
      profile={displayName:(old.username||user.displayName||'').slice(0,80),bio:(parsed.body.textContent||'').slice(0,5000),avatarUrl:P.safeURL(old.profileImageUrl)||''};
     }
    }catch{/* An absent or denied legacy record does not block new profiles. */}
   }else {P.feedback('This member has not published a profile yet.');P.$('member-profile').hidden=true;return;}
   renderProfile();await loadMedia(true);
  }catch{P.feedback('Profiles could not load. Check your connection or Firebase setup.',true);}
 });
 P.$('more-media').addEventListener('click',event=>P.run(event.currentTarget,()=>loadMedia()));
 if(!P.$('profile-form'))return;
 const persistProfile=async()=>{
  if(!own())throw Error('Log in to edit your own profile.');
  const displayName=P.$('displayName').value.trim();if(!displayName)throw Error('Enter a display name.');
  profile={displayName,bio:P.$('bio').value,avatarUrl:profile.avatarUrl||''};
  await P.db.collection('memberProfiles').doc(uid).set({...profile,updatedAt:P.stamp()});
 };
 P.$('profile-form').addEventListener('submit',event=>{event.preventDefault();P.run(event.currentTarget,async()=>{
  const file=P.$('avatar').files[0];if(file)profile.avatarUrl=(await P.upload(file,`member-media/${P.user.uid}`)).url;
  await persistProfile();P.$('avatar').value='';renderProfile();P.feedback('Profile saved.');
 });});
 P.$('photo-form').addEventListener('submit',event=>{event.preventDefault();P.run(event.currentTarget,async()=>{
  const files=[...P.$('photos').files];if(files.length>10)throw Error('Choose up to 10 pictures at a time.');
  await persistProfile();let saved=0;
  try {for(const file of files){P.feedback(`Uploading picture ${saved+1} of ${files.length}…`);
   const uploaded=await P.upload(file,`member-media/${P.user.uid}`);
   await P.db.collection('memberProfiles').doc(uid).collection('media').add({kind:'photo',title:file.name.slice(0,120),caption:P.$('photo-caption').value,...uploaded,createdAt:P.stamp()});saved++;
  }}catch(e){P.feedback(`${saved} pictures saved. ${e.message}`,true);await loadMedia(true);return;}
  P.$('photo-form').reset();await loadMedia(true);P.feedback(`${saved} pictures uploaded.`);
 });});
 P.$('link-form').addEventListener('submit',event=>{event.preventDefault();P.run(event.currentTarget,async()=>{
  const url=P.safeURL(P.$('link-url').value);if(!url)throw Error('Use a complete https:// website or video URL.');
  await persistProfile();await P.db.collection('memberProfiles').doc(uid).collection('media').add({kind:'link',title:P.$('link-title').value.trim(),caption:'',url,path:'',createdAt:P.stamp()});
  P.$('link-form').reset();await loadMedia(true);P.feedback('Link added.');
 });});
})();
