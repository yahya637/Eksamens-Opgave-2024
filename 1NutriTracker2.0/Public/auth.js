// auth.js
if (!sessionStorage.getItem('userId')) {
    window.location.href = '/LogInPage.html'; // Omdiriger til login-side, hvis userID ikke findes
  }
  