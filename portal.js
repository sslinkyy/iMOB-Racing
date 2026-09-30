/* Firebase owns authentication and persists data; rules enforce permissions. */
window.Portal = (() => {
    const $ = id => document.getElementById(id);
    const feedback = (message, error = false) => {
        const el = $('feedback');
        if (el) { el.textContent = message; el.dataset.error = String(error); }
    };
    const safeURL = value => {
        try {
            const u = new URL(value);
            return u.protocol === 'https:' && !u.username && !u.password ? u.href : '';
        } catch { return ''; }
    };
    const youtubeID = value => {
        try {
            const u = new URL(value);
            if (u.protocol !== 'https:') return '';
            let id = '';
            if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
            if (['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)) {
                id = u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || '';
            }
            return /^[\w-]{11}$/.test(id) ? id : '';
        } catch { return ''; }
    };
    const node = (tag, text, className) => {
        const el = document.createElement(tag);
        if (text !== undefined) el.textContent = text;
        if (className) el.className = className;
        return el;
    };
    const image = (url, alt) => {
        const img = node('img'); img.src = safeURL(url) || 'default-profile.webp';
        img.alt = alt; img.loading = 'lazy';
        img.addEventListener('error', () => { img.src = 'default-profile.webp'; }, {once:true});
        return img;
    };
    const mediaCard = (item, remove) => {
        const card = node('article', undefined, 'media-card');
        if (item.kind === 'photo' && safeURL(item.url)) card.append(image(item.url, item.title || 'Member picture'));
        const video = youtubeID(item.url);
        if (video) {
            const iframe = node('iframe'); iframe.src = `https://www.youtube-nocookie.com/embed/${video}`;
            iframe.title = item.title || 'Member video'; iframe.loading = 'lazy';
            iframe.allowFullscreen = true; card.append(iframe);
        }
        card.append(node('h3', item.title || 'Picture'));
        if (item.caption) card.append(node('p', item.caption));
        if (safeURL(item.url)) {
            const link = node('a', item.kind === 'photo' ? 'Open picture ↗' : 'Open link ↗');
            link.href = safeURL(item.url); link.target = '_blank'; link.rel = 'noopener'; card.append(link);
        }
        if (remove) {
            const button = node('button', 'Remove', 'secondary'); button.type = 'button';
            button.addEventListener('click', () => {
                if (confirm('Remove this item from the profile?')) run(button, remove);
            }); card.append(button);
        }
        return card;
    };
    const run = async (control, task) => {
        const buttons = control?.tagName === 'FORM' ? [...control.querySelectorAll('button')] : [control].filter(Boolean);
        buttons.forEach(b => b.disabled = true);
        try { await task(); }
        catch (error) {
            const messages = {
                'permission-denied': 'Access denied. Your permissions may have changed, or Firebase rules still need setup.',
                'auth/invalid-api-key': 'Member services need the correct Firebase configuration before login can work.',
                'auth/unauthorized-domain': 'This website address needs to be authorized in Firebase Authentication.',
                'auth/operation-not-allowed': 'This sign-in method needs to be enabled in Firebase Authentication.',
                'storage/unauthorized': 'Upload denied. Firebase Storage permissions need to be checked.',
                'auth/popup-closed-by-user': 'Sign-in window closed. You can try again.',
                'auth/wrong-password': 'Unable to sign in. Check your email and password.',
                'auth/user-not-found': 'Unable to sign in. Check your email and password.'
            };
            feedback(messages[error.code] || error.message || 'Something went wrong. Please try again.', true);
        } finally { buttons.forEach(b => b.disabled = false); }
    };
    let auth, db, storage, user = null, role = {admin:false,owner:false};
    let unsubscribeRole = () => {};
    const subscribers = new Set();
    const notify = () => {
        document.querySelectorAll('[data-member]').forEach(el => el.hidden = !user);
        document.querySelectorAll('[data-guest]').forEach(el => el.hidden = !!user);
        document.querySelectorAll('[data-admin]').forEach(el => el.hidden = !user || !role.admin);
        document.querySelectorAll('[data-logout]').forEach(el => el.hidden = !user);
        for (const fn of subscribers) Promise.resolve().then(() => fn(user, role)).catch(e => feedback(e.message, true));
    };
    let sessionReady = false;
    const onSession = fn => { subscribers.add(fn); if (sessionReady) Promise.resolve().then(() => fn(user,role)).catch(e => feedback(e.message,true)); };
    let resolveReady;
    const authReady = new Promise(resolve => resolveReady = resolve);
    try {
        if (typeof firebase === 'undefined' || typeof CONFIG === 'undefined') throw Error('Member services could not load. Refresh the page or try again later.');
        if (!firebase.apps.length) firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
        auth = firebase.auth(); db = firebase.firestore(); storage = firebase.storage();
        auth.onAuthStateChanged(async next => {
            unsubscribeRole(); user = next; role = {admin:false,owner:false};
            sessionReady = true; notify(); resolveReady();
            if (!next) return;
            // Only authenticated account details go in the private member index.
            db.collection('members').doc(next.uid).set({email:next.email || '',updatedAt:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true}).catch(e => feedback('Signed in, but member records could not load. Check Firebase setup.',true));
            unsubscribeRole = db.collection('roles').doc(next.uid).onSnapshot(doc => {
                if (user?.uid !== next.uid) return;
                role = doc.exists ? doc.data() : {admin:false,owner:false}; notify();
            }, () => { role = {admin:false,owner:false}; notify(); });
        }, () => { feedback('Unable to check your sign-in. Please refresh.',true); resolveReady(); });
        document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', () => run(button, () => auth.signOut())));
    } catch (e) { feedback(e.message,true); resolveReady(); }
    const upload = async (file, folder) => {
        if (!user) throw Error('Please log in before uploading.');
        if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw Error('Use a JPG, PNG, WebP or GIF picture.');
        if (file.size > 10 * 1024 * 1024) throw Error('Each picture must be 10 MB or smaller.');
        const path = `${folder}/${crypto.randomUUID()}`;
        const ref = storage.ref(path);
        await ref.put(file, {contentType:file.type});
        return {url:await ref.getDownloadURL(),path};
    };
    const removeMedia = async doc => {
        const data = doc.data();
        if (data.kind === 'photo' && /^member-media\/[A-Za-z0-9_-]+\/[^/]+$/.test(data.path || '')) {
            try { await storage.ref(data.path).delete(); }
            catch (error) { if (error.code !== 'storage/object-not-found') throw error; }
        }
        await doc.ref.delete();
    };
    return {$,feedback,safeURL,youtubeID,node,image,mediaCard,run,onSession,upload,removeMedia,authReady,
        get auth(){return auth},get db(){return db},get storage(){return storage},
        get user(){return user},get role(){return role},
        stamp:() => firebase.firestore.FieldValue.serverTimestamp()};
})();
