document.addEventListener('DOMContentLoaded', async function() {
    const db = firebase.firestore();
    const storage = firebase.storage();

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

    if (userId) {
        try {
            const doc = await db.collection('profiles').doc(userId).get();
            if (doc.exists) {
                const profile = doc.data();
                document.getElementById('username').innerText = profile.username || '';
                document.getElementById('email').innerText = profile.email || '';
                document.getElementById('profile-content').innerHTML = profile.profileContent || '';
                document.getElementById('profile-image').src = profile.profileImageUrl || '';
                updateVehiclePreviews(profile.vehicleImages || []);
            } else {
                alert('Profile not found.');
            }
        } catch (error) {
            console.error('Error loading profile: ', error);
            alert('Error loading profile.');
        }
    } else {
        alert('No user ID specified.');
    }

    function updateVehiclePreviews(vehicleImages) {
        const vehicleContainer = document.getElementById('vehicle-previews');
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
});

async function saveProfile() {
    const user = firebase.auth().currentUser;
    if (user) {
        const db = firebase.firestore();
        const storage = firebase.storage();

        const profileImageFile = document.getElementById('profileImage').files[0];
        const vehicleImagesFiles = document.getElementById('vehicleImages').files;
        const profileContent = CKEDITOR.instances.editor.getData();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;

        const profileRef = db.collection('profiles').doc(user.uid);
        let profileImageUrl, vehicleImageUrls = [];

        if (profileImageFile) {
            const profileImageRef = storage.ref(`profile-images/${user.uid}/${profileImageFile.name}`);
            await profileImageRef.put(profileImageFile);
            profileImageUrl = await profileImageRef.getDownloadURL();
        }

        if (vehicleImagesFiles.length > 0) {
            for (let i = 0; i < vehicleImagesFiles.length; i++) {
                const file = vehicleImagesFiles[i];
                const vehicleImageRef = storage.ref(`vehicle-images/${user.uid}/${file.name}`);
                await vehicleImageRef.put(file);
                const url = await vehicleImageRef.getDownloadURL();
                vehicleImageUrls.push(url);
            }
        }

        await profileRef.set({
            username,
            email,
            profileImageUrl,
            vehicleImages: vehicleImageUrls,
            profileContent
        });

        alert('Profile saved successfully!');
        updatePreview();
    }
}

function loadProfile(uid) {
    const db = firebase.firestore();
    const profileRef = db.collection('profiles').doc(uid);

    profileRef.get().then(doc => {
        if (doc.exists) {
            const profile = doc.data();
            document.getElementById('username').value = profile.username || '';
            document.getElementById('email').value = profile.email || '';
            CKEDITOR.instances.editor.setData(profile.profileContent || '');
            document.getElementById('profileImagePreview').src = profile.profileImageUrl || '';
            updateVehiclePreviews(profile.vehicleImages || []);
        }
    }).catch(error => console.error('Error loading profile: ', error));
}

function updatePreview() {
    const profileContent = CKEDITOR.instances.editor.getData();
    document.getElementById('profile-preview').innerHTML = `
        <h2>${document.getElementById('username').value}</h2>
        <img src="${document.getElementById('profileImagePreview').src}" alt="Profile Image" style="max-width: 200px; max-height: 200px;">
        ${profileContent}
    `;
    updateVehiclePreviews(Array.from(document.getElementById('vehiclePreviews').children).map(img => img.src));
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
