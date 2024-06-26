<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Editor</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.ckeditor.com/4.16.0/standard/ckeditor.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-storage.js"></script>
    <script src="config.js"></script>
</head>
<body>
    <nav class="navbar">
        <div class="navbar-container">
            <span class="navbar-toggle" id="js-navbar-toggle">
                <i class="fas fa-bars"></i>
            </span>
            <a href="index.html" class="logo">iMOB Racing</a>
            <ul class="main-nav" id="js-menu">
                <li><a href="index.html" class="nav-links">Home</a></li>
                <li><a href="drivers.html" class="nav-links">Drivers</a></li>
                <li><a href="cars.html" class="nav-links">Cars</a></li>
                <li><a href="mission.html" class="nav-links">Our Mission</a></li>
                <li><a href="index.html#contact" class="nav-links">Contact</a></li>
                <li><a href="all_profiles.html" class="nav-links">All Profiles</a></li>
                <li><a href="profile.html" class="nav-links">Profile</a></li>
            </ul>
        </div>
    </nav>
    <h1>Profile Editor</h1>
    <label for="username">Username:</label>
    <input type="text" id="username-input" name="username"><br>
    <label for="email">Email:</label>
    <input type="text" id="email-input" name="email" disabled><br>
    <label for="profile-image-input">Profile Image:</label>
    <input type="file" id="profile-image-input" name="profile-image-input" accept="image/*"><br>
    <label for="editor">Profile Content:</label>
    <textarea id="editor" name="editor" rows="10" cols="80"></textarea><br>
    <label for="vehicle-images-input">Vehicle Images:</label>
    <input type="file" id="vehicle-images-input" name="vehicle-images-input" accept="image/*" multiple><br>
    <button onclick="saveProfile()">Save Profile</button>
    <button onclick="togglePreview()">Toggle Preview</button>
    <div id="profile-preview" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px;"></div>
    <script>
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
        }

        CKEDITOR.replace('editor');

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                document.getElementById('username-input').value = user.displayName || user.email;
                document.getElementById('email-input').value = user.email;
                loadProfile(user.uid);
            } else {
                window.location.href = 'login.html';
            }
        });

        function loadProfile(uid) {
            const db = firebase.firestore();
            const profileRef = db.collection('profiles').doc(uid);

            profileRef.get().then(doc => {
                if (doc.exists) {
                    const profile = doc.data();
                    document.getElementById('username-input').value = profile.username || '';
                    CKEDITOR.instances.editor.setData(profile.profileContent || '');
                    document.getElementById('profile-preview').innerHTML = profile.profileContent || 'No profile content';
                } else {
                    console.error('No profile data found');
                }
            }).catch(error => console.error('Error loading profile: ', error));
        }

        async function saveProfile() {
            const user = firebase.auth().currentUser;
            if (!user) {
                alert('No user logged in!');
                return;
            }

            const db = firebase.firestore();
            const storage = firebase.storage();

            const username = document.getElementById('username-input').value;
            const profileContent = CKEDITOR.instances.editor.getData();
            const profileImageFile = document.getElementById('profile-image-input').files[0];
            const vehicleImageFiles = document.getElementById('vehicle-images-input').files;

            let profileImageUrl = '';
            if (profileImageFile) {
                const profileImageRef = storage.ref().child(`profile-images/${user.uid}/${profileImageFile.name}`);
                await profileImageRef.put(profileImageFile);
                profileImageUrl = await profileImageRef.getDownloadURL();
            }

            const vehicleImageUrls = [];
            for (let i = 0; i < vehicleImageFiles.length; i++) {
                const vehicleImageRef = storage.ref().child(`vehicle-images/${user.uid}/${vehicleImageFiles[i].name}`);
                await vehicleImageRef.put(vehicleImageFiles[i]);
                const url = await vehicleImageRef.getDownloadURL();
                vehicleImageUrls.push(url);
            }

            const profileData = {
                username,
                email: user.email,
                profileContent,
                profileImageUrl: profileImageUrl || 'default-profile.png',
                vehicleImages: vehicleImageUrls
            };

            db.collection('profiles').doc(user.uid).set(profileData)
                .then(() => {
                    alert('Profile saved successfully!');
                    updatePreview(profileData);
                })
                .catch(error => console.error('Error saving profile: ', error));
        }

        function updatePreview(profile) {
            document.getElementById('profile-preview').innerHTML = profile.profileContent || 'No profile content';
            const vehicleContainer = document.getElementById('vehicle-previews');
            vehicleContainer.innerHTML = '';
            (profile.vehicleImages || []).forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Vehicle Image';
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                vehicleContainer.appendChild(img);
            });
        }

        function togglePreview() {
            const preview = document.getElementById('profile-preview');
            if (preview.style.display === 'none') {
                preview.style.display = 'block';
                updatePreview({
                    profileContent: CKEDITOR.instances.editor.getData(),
                    vehicleImages: Array.from(document.getElementById('vehicle-images-input').files).map(file => URL.createObjectURL(file))
                });
            } else {
                preview.style.display = 'none';
            }
        }
    </script>
</body>
</html>
