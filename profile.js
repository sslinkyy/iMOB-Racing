document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            document.getElementById('username').value = user.displayName || user.email;
            document.getElementById('email').value = user.email;
            loadProfile(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });
});

function loadProfile(uid) {
    const db = firebase.firestore();
    const profileRef = db.collection('profiles').doc(uid);

    profileRef.get().then(doc => {
        if (doc.exists) {
            const profile = doc.data();
            document.getElementById('username').value = profile.username || '';
            CKEDITOR.instances.editor.setData(profile.profileContent || '');
            document.getElementById('profileImagePreview').src = profile.profileImageUrl || 'default-profile.png';
            updateVehiclePreviews(profile.vehicleImages || []);
        } else {
            console.log('No profile data found');
        }
    }).catch(error => console.error('Error loading profile: ', error));
}

function saveProfile() {
    const user = firebase.auth().currentUser;
    if (user) {
        const uid = user.uid;
        const username = document.getElementById('username').value;
        const profileContent = CKEDITOR.instances.editor.getData();
        const profileImage = document.getElementById('profileImage').files[0];
        const vehicleImages = Array.from(document.getElementById('vehicleImages').files);

        const db = firebase.firestore();
        const storage = firebase.storage();
        const profileRef = db.collection('profiles').doc(uid);

        let profileImageUrl = '';
        let vehicleImageUrls = [];

        const profileImagePromise = profileImage ? uploadFile(storage, `profile-images/${uid}/${profileImage.name}`, profileImage) : Promise.resolve('');
        const vehicleImagePromises = vehicleImages.map(file => uploadFile(storage, `vehicle-images/${uid}/${file.name}`, file));

        profileImagePromise.then(url => {
            profileImageUrl = url;
            return Promise.all(vehicleImagePromises);
        }).then(urls => {
            vehicleImageUrls = urls;
            return profileRef.set({
                username,
                email: user.email,
                profileContent,
                profileImageUrl,
                vehicleImages: vehicleImageUrls
            });
        }).then(() => {
            alert('Profile saved successfully');
            updatePreview();
        }).catch(error => console.error('Error saving profile: ', error));
    }
}

function uploadFile(storage, path, file) {
    const ref = storage.ref().child(path);
    return ref.put(file).then(snapshot => snapshot.ref.getDownloadURL());
}

function updateVehiclePreviews(vehicleImages) {
    const vehicleContainer = document.getElementById('vehiclePreviews');
    vehicleContainer.innerHTML = '';
    vehicleImages.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Vehicle Image';
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        vehicleContainer.appendChild(img);
    });
}

function updatePreview() {
    const profileContent = CKEDITOR.instances.editor.getData();
    document.getElementById('profile-preview').innerHTML = profileContent;
}
