---
layout: default
title: "Login"
description: "Login to your iMOB Racing account"
---

<section id="login" class="login-section" data-aos="fade-up">
    <h1>Login</h1>
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Password">
    <button id="loginButton">Login</button>
    <button id="registerButton">Register</button>
    <button id="googleLoginButton">Login with Google</button>

    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-auth.js"></script>
    <script src="{{ site.baseurl }}/assets/js/config.js"></script>
    <script>
        firebase.initializeApp(CONFIG.FIREBASE_CONFIG);

        document.getElementById('loginButton').addEventListener('click', login);
        document.getElementById('registerButton').addEventListener('click', register);
        document.getElementById('googleLoginButton').addEventListener('click', loginWithGoogle);

        function login() {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    window.location.href = 'profile.html';
                })
                .catch((error) => {
                    console.error('Error logging in: ', error);
                });
        }

        function register() {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    window.location.href = 'profile.html';
                })
                .catch((error) => {
                    console.error('Error registering: ', error);
                });
        }

        function loginWithGoogle() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    window.location.href = 'profile.html';
                })
                .catch((error) => {
                    console.error('Error logging in with Google: ', error);
                });
        }
    </script>
</section>
