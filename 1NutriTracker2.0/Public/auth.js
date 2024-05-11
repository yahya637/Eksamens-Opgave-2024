// Extra script file for authentication, otherwise user will be redirected to login page
if (!sessionStorage.getItem('userId')) {
    window.location.href = '/LogInPage.html'; 
  }
  