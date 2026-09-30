(() => {
 const P=Portal;const list=P.$('members-list');if(!list)return;
 let cursor=null;
 const load=async()=>{
  let q=P.db.collection('memberProfiles').orderBy('displayName').limit(24);if(cursor)q=q.startAfter(cursor);
  const result=await q.get();
  for(const doc of result.docs){const data=doc.data();const card=P.node('article',undefined,'media-card');
   card.append(P.image(data.avatarUrl,data.displayName||'Member'));
   const link=P.node('a',data.displayName||'Member');link.href=`public_profile.html?uid=${encodeURIComponent(doc.id)}`;
   card.append(link,P.node('p',(data.bio||'').slice(0,180)));list.append(card);
  }
  cursor=result.docs.at(-1)||null;P.$('more-members').hidden=result.size<24;
  if(!list.children.length)list.append(P.node('p','No member profiles published yet. Log in to add yours.'));
 };
 P.feedback("Loading members…");
 P.authReady.then(()=>P.run(null,async()=>{await load();P.feedback("");}));P.$('more-members').addEventListener('click',e=>P.run(e.currentTarget,load));
})();
