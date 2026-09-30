(() => {
 const P=Portal;const form=P.$('login-form');
 P.onSession(user=>{if(user) location.replace('profile.html');});
 const credentials=()=>({email:P.$('email').value.trim(),password:P.$('password').value});
 form.addEventListener('submit',event=>{event.preventDefault();P.run(form,async()=>{
  if(!P.auth) throw Error('Sign-in service unavailable.');
  const {email,password}=credentials();await P.auth.signInWithEmailAndPassword(email,password);
 });});
 P.$('register').addEventListener('click',()=>P.run(form,async()=>{
  if(!form.reportValidity()) return;
  const {email,password}=credentials();await P.auth.createUserWithEmailAndPassword(email,password);
 }));
 P.$('google-login').addEventListener('click',event=>P.run(event.currentTarget,()=>P.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())));
 P.$('reset-password').addEventListener('click',event=>P.run(event.currentTarget,async()=>{
  const email=P.$('email');if(!email.reportValidity())return;
  await P.auth.sendPasswordResetEmail(email.value.trim());P.feedback('If an account exists for this email, password reset instructions will be sent.');
 }));
})();
