const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");

const loginBtn = document.getElementById('loginBtn');
const loggedInUser = localStorage.getItem('loggedInUser');
const userPreference = localStorage.getItem('userPreferences');
document.addEventListener("DOMContentLoaded", async () => {
  if (loggedInUser && userPreference) {
     window.location.href = "index.html";
  }
  else{
    ipcRenderer.send('create-only-first-user');
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
          ipcRenderer.send("get-bill-info");
          ipcRenderer.send("fetch-user-rights-by-user-no" , user._doc.user_no);

          const fetchBillInfo = new Promise((resolve) => {
            ipcRenderer.once("fetch-bill-info-success", (event, data) => resolve(data));
          });
          const fetchUserPreference = new Promise((resolve) => {
            ipcRenderer.once("fetch-user-preference-data", (event, data) => resolve(data));
          });
          const fetchUserRights = new Promise((resolve) => {
            ipcRenderer.once("fetch-user-rights-data", (event, data) => resolve(data));
          })
          const [ billInfo, userPreferences , userRights] = await Promise.all([fetchBillInfo, fetchUserPreference , fetchUserRights]);
    
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


// Keyboard
document.addEventListener('DOMContentLoaded', () => {
  const keyboard = document.getElementById('keyboard');
  const alphKeyboard = document.getElementById('alphKeyboard');
  let activeInput = null;
  let alphaActiveInput = null;

  // Function to create and append numerical keys
  const createKeys = () => {
      const keysContainer = document.createElement('div');
      keysContainer.className = 'keys flex flex-wrap justify-around';
      const keys = [
          { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' },
          { value: '5' }, { value: '6' }, { value: '7' }, { value: '8' },
          { value: '9' }, { value: '0' }, { value: '.' }, 
          { value: '❌', key: 'backspace' }, { value: 'Clear', key: 'clear' }
      ];

      keys.forEach(key => {
          const button = document.createElement('button');
          button.className = 'key bg-white border p-1 m-1 rounded text-center flex-1';
          button.dataset.key = key.key || key.value;
          button.textContent = key.value;
          button.addEventListener('click', () => {
              if (activeInput) {
                  const keyValue = button.dataset.key;
                  if (keyValue === 'backspace') {
                      activeInput.value = activeInput.value.slice(0, -1);
                  } else if (keyValue === 'clear') {
                      activeInput.value = '';
                  } else {
                      activeInput.value += keyValue;
                  }
                  activeInput.focus(); // Set focus on the input field
                  activeInput.dispatchEvent(new Event('input'));
                  activeInput.dispatchEvent(new Event('change'));
              }
          });
          keysContainer.appendChild(button);
      });
      keyboard.appendChild(keysContainer);
  };

  // Function to create and append alphabetical keys with numerical keys
  const createAlphabeticalKeys = () => {
      const keysContainer = document.createElement('div');
      keysContainer.className = 'alphakeys flex flex-wrap justify-around';
      const keysRow1 = '1234567890'.split('');
      const keysRow2 = 'QWERTYUIOP'.split('');
      const keysRow3 = 'ASDFGHJKL'.split('');
      const keysRow4 = 'ZXCVBNM'.split('');
      const keysRow5 = ['@', ' ', '❌', 'Clear'];

      const addKeysToContainer = (keysArray) => {
          const rowContainer = document.createElement('div');
          rowContainer.className = 'flex justify-around w-full';
          keysArray.forEach(key => {
              const button = document.createElement('button');
              button.className = 'alphakey bg-white border p-1 m-1 rounded text-center flex-1';
              button.dataset.key = key === '❌' ? 'backspace' : key === 'Clear' ? 'clear' : key;
              button.textContent = key === ' ' ? 'Space' : key; 
              button.addEventListener('click', () => {
                  if (alphaActiveInput) {
                      const keyValue = button.dataset.key;
                      if (keyValue === 'backspace') {
                          alphaActiveInput.value = alphaActiveInput.value.slice(0, -1);
                      } else if (keyValue === 'clear') {
                          alphaActiveInput.value = '';
                      } 
                      else if(keyValue === '@'){
                          alphaActiveInput.value += '@';
                      }
                      else {
                          alphaActiveInput.value += keyValue.toLowerCase();
                      }
                      alphaActiveInput.focus();
                      alphaActiveInput.dispatchEvent(new Event('input'));
                      alphaActiveInput.dispatchEvent(new Event('change'));
                  }
              });
              rowContainer.appendChild(button);
          });
          keysContainer.appendChild(rowContainer);
      };

      addKeysToContainer(keysRow1);
      addKeysToContainer(keysRow2);
      addKeysToContainer(keysRow3);
      addKeysToContainer(keysRow4);
      addKeysToContainer(keysRow5);

      alphKeyboard.appendChild(keysContainer);
  };

  createKeys();
  createAlphabeticalKeys();

  const updateKeyboardPosition = (input) => {
      const rect = input.getBoundingClientRect();
      const keyboardWidth = keyboard.offsetWidth;
      const spaceLeft = rect.left;
      if (spaceLeft >= keyboardWidth) {
          keyboard.style.left = `${rect.left - keyboardWidth - 45}px`;
          keyboard.style.top = `${rect.top - 120}px`;
      } else {
          keyboard.style.left = `${rect.left}px`;
          keyboard.style.top = `${rect.bottom}px`;
      }
  };

  const updateAlphaKeyboardPosition = (input) => {
      const rect = input.getBoundingClientRect();
      const keyboardWidth = alphKeyboard.offsetWidth;
      const spaceLeft = rect.left;
      if (spaceLeft >= keyboardWidth) {
          alphKeyboard.style.left = `${rect.left - keyboardWidth - 45}px`;
          alphKeyboard.style.top = `${rect.top - 120}px`;
      } else {
          alphKeyboard.style.left = `${rect.left}px`;
          alphKeyboard.style.top = `${rect.bottom + 10}px`;
      }
  };

  document.querySelectorAll('input[type="number"], input[type="tel"]').forEach(input => {
      input.addEventListener('focus', () => {
          activeInput = input;
          keyboard.style.display = 'block';
          updateKeyboardPosition(input);
          input.focus();
      });
  });

  document.querySelectorAll('input[type="text"]').forEach(input => {
      input.addEventListener('focus', () => {
          alphaActiveInput = input;
          alphKeyboard.style.display = 'block';
          updateAlphaKeyboardPosition(input);
          input.focus();
      });
  });

  document.addEventListener('click', (event) => {
      if (!keyboard.contains(event.target) && !event.target.matches('input[type="number"], input[type="tel"]')) {
          keyboard.style.display = 'none';
          activeInput = null;
      }

      if (!alphKeyboard.contains(event.target) && !event.target.matches('input[type="text"]')) {
          alphKeyboard.style.display = 'none';
          alphaActiveInput = null;
      }
  });
}); 