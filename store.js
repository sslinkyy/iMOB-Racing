(() => {
 const P=Portal;document.getElementById('snipcart').dataset.apiKey=CONFIG.SNIPCART_API_KEY;
 if(!P.db)return;
 P.run(null,async()=>{
  const result=await P.db.collection('store-items').get(),grid=P.$('store-grid');
  for(const doc of result.docs){const data=doc.data(),card=P.node('article',undefined,'media-card');
   if(P.safeURL(data.imageUrl))card.append(P.image(data.imageUrl,data.name));
   card.append(P.node('h3',data.name),P.node('p',data.description||''),P.node('p',`$${Number(data.price).toFixed(2)}`));
   const button=P.node('button','Add to cart','button snipcart-add-item');
   Object.assign(button.dataset,{itemId:doc.id,itemName:data.name,itemPrice:String(data.price),itemUrl:'https://imobracingonline.com/store.html',itemDescription:data.description||''});
   card.append(button);grid.append(card);
  }
  if(!result.size)P.feedback('No products available yet.');
 });
})();
