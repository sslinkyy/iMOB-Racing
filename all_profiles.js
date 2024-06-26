document.addEventListener('DOMContentLoaded', function() {
    loadAllProfiles();
});

function loadAllProfiles() {
    const db = firebase.firestore();
    const profilesContainer = document.getElementById('profiles-container');
    profilesContainer.innerHTML = '';  // Clear any existing content

    db.collection('profiles').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const profile = doc.data();
            const profileDiv = document.createElement('div');
            profileDiv.className = 'profile-card';

            const profileImage = document.createElement('img');
            profileImage.src = profile.profileImageUrl || 'default-profile.webp';
            profileImage.alt = profile.username || 'No username';
            profileImage.style.maxWidth = '100px';
            profileImage.style.maxHeight = '100px';

            const profileUsername = document.createElement('h2');
            profileUsername.textContent = profile.username || 'No username';

            const profileEmail = document.createElement('p');
            profileEmail.textContent = profile.email || 'No email';

            profileDiv.appendChild(profileImage);
            profileDiv.appendChild(profileUsername);
            profileDiv.appendChild(profileEmail);

            profileDiv.addEventListener('click', function() {
                window.location.href = `profile.html?uid=${doc.id}`;
            });

            profilesContainer.appendChild(profileDiv);
        });
    }).catch(error => console.error('Error loading profiles: ', error));
}
