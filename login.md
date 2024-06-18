---
layout: default
title: Login
---

<h1>Login Test</h1>
<input type="email" id="email" placeholder="Email">
<input type="password" id="password" placeholder="Password">
<button id="loginButton">Login</button>
<button id="registerButton">Register</button>
<button id="googleLoginButton">Login with Google</button>

<script>
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
