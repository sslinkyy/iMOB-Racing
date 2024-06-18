document.addEventListener('DOMContentLoaded', () => {
    firebase.initializeApp(CONFIG.FIREBASE_CONFIG);

    ClassicEditor
        .create(document.querySelector('#editor'))
        .then(editor => {
            window.editor = editor;
            loadProfile();
        })
        .catch(error => {
            console.error(error);
        });

    document.getElementById('profileForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const editorData = window.editor.getData();
        const user = firebase.auth().currentUser;

        if (user) {
            await firebase.firestore().collection('profiles').doc(user.uid).set({
                profileContent: editorData
            });

            alert('Profile saved successfully!');
            document.getElementById('profile-preview').innerHTML = editorData;
        } else {
            alert('No user is logged in.');
        }
    });

    document.getElementById('fetchSocialMediaButton').addEventListener('click', populateSocialMedia);
});

function loadProfile() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            firebase.firestore().collection('profiles').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    window.editor.setData(doc.data().profileContent);
                    document.getElementById('profile-preview').innerHTML = doc.data().profileContent;
                }
            }).catch(error => {
                console.error('Error loading profile: ', error);
            });
        } else {
            alert('No user is logged in.');
        }
    });
}

async function fetchSocialMediaContent() {
    const response = await fetch('/api/getSocialMediaContent');
    const data = await response.json();
    return data;
}

async function populateSocialMedia() {
    const content = await fetchSocialMediaContent();
    const container = document.getElementById('socialMediaContent');
    container.innerHTML = '';
    content.forEach(item => {
        const mediaElement = document.createElement(item.media_type === 'IMAGE' ? 'img' : 'video');
        mediaElement.src = item.media_url;
        container.appendChild(mediaElement);
    });
}
