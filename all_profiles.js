document.addEventListener('DOMContentLoaded', function() {
    var db = firebase.firestore();
    var profilesList = document.getElementById('profiles-list');

    function createProfileCard(profile) {
        var card = document.createElement('div');
        card.classList.add('profile-card');
        card.innerHTML = `
            <h3>${profile.username}</h3>
            <p>Email: ${profile.email}</p>
            <div>${profile.htmlContent}</div>
            <div>Social Media URLs: ${profile.socialMediaUrls}</div>
            <div>Special Items: ${profile.specialItems}</div>
            <div>Vehicles: ${profile.vehicles}</div>
        `;
        return card;
    }

    db.collection('profiles').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var profileData = doc.data();
            profilesList.appendChild(createProfileCard(profileData));
        });
    }).catch((error) => {
        console.error("Error loading profiles: ", error);
    });
});
