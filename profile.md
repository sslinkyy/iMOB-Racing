---
layout: default
title: Profile
---

<h1>Profile Page</h1>
<h2 id="username"></h2>
<p id="user-email"></p>
<textarea id="editor" name="editor" rows="10" cols="80"></textarea>
<script>
    CKEDITOR.replace('editor');
</script>
<button onclick="saveProfile()">Save Profile</button>

<script>
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            document.getElementById('username').innerText = user.displayName || user.email;
            document.getElementById('user-email').innerText = user.email;
            loadProfile(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });

    function saveProfile() {
        var content = CKEDITOR.instances.editor.getData();
        var user = firebase.auth().currentUser;
        if (user) {
            var db = firebase.firestore();
            db.collection('profiles').doc(user.uid).set({
                htmlContent: content
            }).then(function() {
                alert('Profile saved!');
            }).catch(function(error) {
                console.error('Error saving profile: ', error);
            });
        }
    }

    function loadProfile(uid) {
        var db = firebase.firestore();
        db.collection('profiles').doc(uid).get().then(function(doc) {
            if (doc.exists) {
                CKEDITOR.instances.editor.setData(doc.data().htmlContent);
            }
        }).catch(function(error) {
            console.error('Error loading profile: ', error);
        });
    }
</script>
