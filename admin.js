(() => {
 const P=Portal;let loaded=false,memberCursor=null,home={},updates=new Map(),products=new Map(),moderationUID=null,moderationCursor=null;
 const requireAdmin=()=>{if(!P.user||!P.role.admin)throw Error('Admin access is required.');};
 const button=(text,task)=>{const b=P.node('button',text,'secondary');b.type='button';b.addEventListener('click',()=>P.run(b,async()=>{requireAdmin();await task();}));return b;};
 const uploadAdmin=file=>P.upload(file,`site-media/${P.user.uid}`);
 const loadHome=async()=>{
  const doc=await P.db.collection('siteContent').doc('home').get();home=doc.exists?doc.data():{};
  P.$('hero-intro').value=home.intro||"We're iMob Racing. A crew of builders, drivers and friends who would rather turn a wrench than watch from the sidelines.";
  P.$('hero-title').value=home.title||'iMob / FROM THE TRACK';
  P.$('hero-video').value=home.videoUrl||'https://www.youtube.com/watch?v=RPGg_y2FHNs';
 };
 const loadUpdates=async()=>{
  const result=await P.db.collection('showcase').orderBy('createdAt','desc').limit(100).get();
  updates=new Map(result.docs.map(d=>[d.id,d.data()]));P.$('showcase-list').replaceChildren();
  for(const doc of result.docs){const data=doc.data();const row=P.node('article',undefined,'admin-row');
   row.append(P.node('h3',data.title),P.node('p',data.published?'Published':'Draft'),P.node('p',data.body||''));
   row.append(button('Edit',async()=>{
    P.$('showcase-id').value=doc.id;P.$('showcase-title').value=data.title||'';P.$('showcase-body').value=data.body||'';
    P.$('showcase-url').value=data.url||'';P.$('showcase-published').checked=!!data.published;P.$('showcase-photo').value='';
    P.$('showcase-form').scrollIntoView({behavior:'smooth'});
   }),button(data.published?'Unpublish':'Publish',async()=>{await doc.ref.update({published:!data.published,updatedAt:P.stamp()});await loadUpdates();}),button('Delete',async()=>{
    if(!confirm('Delete this team update?'))return;await doc.ref.delete();await loadUpdates();
   }));P.$('showcase-list').append(row);
  }
 };
 const loadModeration=async(reset=false)=>{
  if(!moderationUID)return;if(reset){moderationCursor=null;P.$('moderation-media').replaceChildren();}
  let query=P.db.collection('memberProfiles').doc(moderationUID).collection('media').orderBy('createdAt','desc').limit(12);
  if(moderationCursor)query=query.startAfter(moderationCursor);
  const result=await query.get();
  for(const doc of result.docs)P.$('moderation-media').append(P.mediaCard(doc.data(),async()=>{
   requireAdmin();await P.removeMedia(doc);await loadModeration(true);P.feedback('Member media removed.');
  }));
  moderationCursor=result.docs.at(-1)||null;P.$('more-moderation').hidden=result.size<12;
  if(!P.$('moderation-media').children.length)P.$('moderation-media').append(P.node('p','No media to review.'));
 };
 const loadMembers=async(reset=false)=>{
  if(reset){memberCursor=null;P.$('admin-member-list').replaceChildren();}
  let query=P.db.collection('members').orderBy('email').limit(25);if(memberCursor)query=query.startAfter(memberCursor);
  const result=await query.get();
  for(const member of result.docs){
   const [profileDoc,roleDoc]=await Promise.all([P.db.collection('memberProfiles').doc(member.id).get(),P.db.collection('roles').doc(member.id).get()]);
   const profile=profileDoc.exists?profileDoc.data():{},role=roleDoc.exists?roleDoc.data():{};
   const row=P.node('article',undefined,'admin-row');row.append(P.node('h3',profile.displayName||'Member'),P.node('p',member.data().email||member.id),P.node('p',role.owner?'Site owner':role.admin?'Admin':'Member'));
   const link=P.node('a','View profile ↗');link.href=`public_profile.html?uid=${encodeURIComponent(member.id)}`;link.target='_blank';link.rel='noopener';row.append(link);
   if(!role.owner&&member.id!==P.user.uid)row.append(button(role.admin?'Remove admin access':'Make admin',async()=>{
    if(!confirm(`${role.admin?'Remove':'Grant'} admin access for ${profile.displayName||member.data().email||'this member'}?`))return;
    await P.db.collection('roles').doc(member.id).set({admin:!role.admin,owner:false});await loadMembers(true);P.feedback('Admin access updated.');
   }));
   row.append(button('Review pictures & links',async()=>{
    moderationUID=member.id;P.$('moderation-name').textContent=`Media: ${profile.displayName||'Member'}`;
    P.$('moderation').hidden=false;await loadModeration(true);P.$('moderation').scrollIntoView({behavior:'smooth'});
   }));P.$('admin-member-list').append(row);
  }
  memberCursor=result.docs.at(-1)||null;P.$('more-admin-members').hidden=result.size<25;
 };
 const loadProducts=async()=>{
  const result=await P.db.collection('store-items').limit(100).get();products=new Map(result.docs.map(d=>[d.id,d.data()]));P.$('product-list').replaceChildren();
  for(const doc of result.docs){const data=doc.data(),row=P.node('article',undefined,'admin-row');
   row.append(P.node('h3',data.name),P.node('p',`$${Number(data.price).toFixed(2)}`));
   row.append(button('Edit',async()=>{P.$('product-id').value=doc.id;P.$('product-name').value=data.name||'';P.$('product-description').value=data.description||'';P.$('product-price').value=data.price||'';P.$('product-image').value=data.imageUrl||'';P.$('product-file').value='';P.$('product-form').scrollIntoView({behavior:'smooth'});}),button('Delete',async()=>{if(!confirm('Delete this store product?'))return;await doc.ref.delete();await loadProducts();}));P.$('product-list').append(row);
  }
 };
 P.onSession(async(user,role)=>{
  P.$('admin-panel').hidden=!user||!role.admin;
  if(!user){loaded=false;P.feedback('Log in with an admin account to manage the site.');return;}
  if(!role.admin){loaded=false;P.feedback('Admin access is required. If this is your first setup, the site owner must be assigned in Firebase.');return;}
  if(loaded)return;loaded=true;P.feedback('Loading admin tools…');
  const results=await Promise.allSettled([loadHome(),loadUpdates(),loadMembers(true),loadProducts()]);
  if(results.some(r=>r.status==='rejected')){loaded=false;P.feedback('Some admin data could not load. Check Firebase rules and configuration.',true);}else P.feedback('Admin tools ready.');
 });
 for(const [id,task] of [['more-admin-members',()=>loadMembers()],['more-moderation',()=>loadModeration()]])P.$(id).addEventListener('click',event=>P.run(event.currentTarget,async()=>{requireAdmin();await task();}));
 P.$('home-form').addEventListener('submit',event=>{event.preventDefault();P.run(event.currentTarget,async()=>{
  requireAdmin();let videoUrl=P.$('hero-video').value.trim();if(videoUrl&&!P.youtubeID(videoUrl))throw Error('Enter a valid YouTube video URL.');
  let imageUrl=P.$('clear-hero-image').checked?'':home.imageUrl||'';const file=P.$('hero-image').files[0];
  if(file){imageUrl=(await uploadAdmin(file)).url;videoUrl='';}else if(videoUrl)imageUrl='';
  if(!videoUrl&&!imageUrl)throw Error('Choose a featured picture or a YouTube video.');
  await P.db.collection('siteContent').doc('home').set({intro:P.$('hero-intro').value.trim(),title:P.$('hero-title').value.trim(),videoUrl,imageUrl,updatedAt:P.stamp()});
  P.$('hero-image').value='';P.$('clear-hero-image').checked=false;await loadHome();P.feedback('Homepage feature saved.');
 });});
 P.$('showcase-form').addEventListener('submit',event=>{event.preventDefault();P.run(event.currentTarget,async()=>{
  requireAdmin();const id=P.$('showcase-id').value;const previous=updates.get(id)||{};
  const value=P.$('showcase-url').value.trim();const url=value?P.safeURL(value):'';if(value&&!url)throw Error('Use an https:// link.');
  let imageUrl=previous.imageUrl||'';if(P.$('showcase-photo').files[0])imageUrl=(await uploadAdmin(P.$('showcase-photo').files[0])).url;
  const data={title:P.$('showcase-title').value.trim(),body:P.$('showcase-body').value,url,imageUrl,published:P.$('showcase-published').checked,updatedAt:P.stamp(),createdAt:previous.createdAt||P.stamp()};
  const ref=id?P.db.collection('showcase').doc(id):P.db.collection('showcase').doc();await ref.set(data);
  P.$('showcase-form').reset();P.$('showcase-id').value='';await loadUpdates();P.feedback('Team update saved.');
 });});
 P.$('cancel-update').addEventListener('click',()=>{P.$('showcase-form').reset();P.$('showcase-id').value='';});
 P.$('product-form').addEventListener('submit',event=>{event.preventDefault();P.run(event.currentTarget,async()=>{
  requireAdmin();let imageUrl=P.$('product-image').value.trim();if(imageUrl&&!P.safeURL(imageUrl))throw Error('Use an https:// picture URL.');
  if(P.$('product-file').files[0])imageUrl=(await uploadAdmin(P.$('product-file').files[0])).url;
  const data={name:P.$('product-name').value.trim(),description:P.$('product-description').value,price:Number(P.$('product-price').value),imageUrl};
  const id=P.$('product-id').value;const ref=id?P.db.collection('store-items').doc(id):P.db.collection('store-items').doc();await ref.set(data);
  P.$('product-form').reset();P.$('product-id').value='';await loadProducts();P.feedback('Product saved.');
 });});
 P.$('cancel-product').addEventListener('click',()=>{P.$('product-form').reset();P.$('product-id').value='';});
})();
