(() => {
 const P=Portal;if(!P.db)return;
 P.db.collection('siteContent').doc('home').onSnapshot(doc=>{
  if(!doc.exists)return;const data=doc.data();
  if(data.intro)document.querySelector('.hero .intro').textContent=data.intro;
  const frame=document.querySelector('.hero-film iframe'),picture=document.querySelector('.hero-film img');
  const film=document.querySelector('.hero-film');const video=P.youtubeID(data.videoUrl);
  if(P.safeURL(data.imageUrl)){
   const img=P.image(data.imageUrl,data.title||'iMob Racing showcase');img.loading='eager';
   (frame||picture)?.replaceWith(img);
  }else if(video){
   const iframe=P.node('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${video}`;
   iframe.title=data.title||'iMob Racing showcase';iframe.allowFullscreen=true;(frame||picture)?.replaceWith(iframe);
  }
  if(data.title)film.querySelector('.film-top span').textContent=data.title;
  const link=film.querySelector('.film-bottom a');link.href=P.safeURL(data.imageUrl)||P.safeURL(data.videoUrl)||link.href;
  link.textContent=data.imageUrl?'Open picture ↗':'Watch on YouTube ↗';
  film.querySelector('.film-top span:last-child').textContent=data.imageUrl?'PHOTO':'▶ PLAY';
 },()=>{/* Keep static homepage footage when services are unavailable. */});
 P.db.collection('showcase').where('published','==',true).onSnapshot(snapshot=>{
  const container=document.getElementById('showcase-feed');container.replaceChildren();
  const docs=[...snapshot.docs].sort((a,b)=>(b.data().createdAt?.toMillis()||0)-(a.data().createdAt?.toMillis()||0)).slice(0,12);
  for(const doc of docs){const data=doc.data();const card=P.node('article',undefined,'media-card');
   if(P.safeURL(data.imageUrl))card.append(P.image(data.imageUrl,data.title));
   const video=P.youtubeID(data.url);if(video){const iframe=P.node('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${video}`;iframe.title=data.title;iframe.loading='lazy';iframe.allowFullscreen=true;card.append(iframe);}
   card.append(P.node('h3',data.title),P.node('p',data.body||''));
   if(data.createdAt){const time=P.node('time',data.createdAt.toDate().toLocaleDateString());time.dateTime=data.createdAt.toDate().toISOString();card.append(time);}
   if(P.safeURL(data.url)){const link=P.node('a','See more ↗');link.href=P.safeURL(data.url);link.target='_blank';link.rel='noopener';card.append(link);}container.append(card);
  }
  container.hidden=!docs.length;
 },()=>{/* External team links remain available. */});
})();
