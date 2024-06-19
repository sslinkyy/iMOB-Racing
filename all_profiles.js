document.addEventListener('DOMContentLoaded', async function() {
    const db = firebase.firestore();

    try {
        const profilesSnapshot = await db.collection('profiles').get();
        const profilesList = document.getElementById('profiles-list');
        profilesList.innerHTML = '';

        profilesSnapshot.forEach(doc => {
            const profile = doc.data();
            const profileItem = document.createElement('div');
            profileItem.classList.add('profile-item');
            profileItem.innerHTML = `
                <a href="profile.html?userId=${doc.id}">
                    <img src="${profile.profileImageUrl}" alt="Profile Image" style="max-width: 100px; max-height: 100px;">
                </a>
                <h2>${profile.username}</h2>
                <p>${profile.email}</p>
            `;
            profilesList.appendChild(profileItem);
        });
    } catch (error) {
        console.error('Error loading profiles: ', error);
        alert('Error loading profiles.');
    }
});
