const { ipcRenderer } = require("electron");
const Swal = require('sweetalert2')

const loginBtn = document.getElementById('loginBtn');
const loggedInUser = localStorage.getItem('loggedInUser');
const userPreference = localStorage.getItem('userPreferences');
document.addEventListener("DOMContentLoaded", () => {
  if (loggedInUser && userPreference) {
     window.location.href = "index.html";
  }
  else{
    // stay here    
  }
})


loginBtn.addEventListener('click', async () => {
  const userId = document.getElementById('userId').value;
  const password = document.getElementById('password').value;

  if (userId === '' || password === '') {
    Swal.fire({
      title: 'Error!',
      text: 'Please enter user id and password',
      icon: 'error',
      timer: 1000
    });
    return;
  }

  ipcRenderer.send('login', userId, password);

  loginBtn.textContent = 'Logging in...';

    ipcRenderer.on('login-success',async (event, user) =>{
      loginBtn.textContent = 'Login';
      try {
          localStorage.setItem('loggedInUser', JSON.stringify(user));
      
          ipcRenderer.send("fetch-user-preference");
          ipcRenderer.send("fetch-categories");
          ipcRenderer.send("get-bill-info");
          ipcRenderer.send("fetch-user-rights-by-user-no" , user._doc.user_no);
          const fetchCategories = new Promise((resolve) => {
            ipcRenderer.once("categories-data", (event, categories) => resolve(categories));
          });
          const fetchBillInfo = new Promise((resolve) => {
            ipcRenderer.once("fetch-bill-info-success", (event, data) => resolve(data));
          });
          const fetchUserPreference = new Promise((resolve) => {
            ipcRenderer.once("fetch-user-preference-data", (event, data) => resolve(data));
          });
          const fetchUserRights = new Promise((resolve) => {
            ipcRenderer.once("fetch-user-rights-data", (event, data) => resolve(data));
          })
          const [categories, billInfo, userPreferences , userRights] = await Promise.all([fetchCategories, fetchBillInfo, fetchUserPreference , fetchUserRights]);
    
          localStorage.setItem("categories", JSON.stringify(categories));
          localStorage.setItem("billInfo", JSON.stringify(billInfo));
          localStorage.setItem("userRights", JSON.stringify(userRights));
          if (!userPreferences) {
            window.location.href = 'preference.html';
          } 
          else {
            localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
            window.location.href = "index.html";
          }

      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: "Invalid username or password",
          icon: 'error',
          timer: 1500
        });
      }
    });

    ipcRenderer.on('login-error', (event, error) => {
      loginBtn.textContent = 'Login';
      Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
        timer: 1500
      });
    });
});
