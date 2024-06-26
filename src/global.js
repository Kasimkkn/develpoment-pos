const { ipcRenderer } = require("electron");
const path = require('path');
const fs = require('fs');

const btnToSetDefault = document.getElementById("btnToSetDefault");
if (btnToSetDefault) {
    btnToSetDefault.addEventListener("click", () => {
        localStorage.removeItem('primary-color');
        localStorage.removeItem('secondary-color');
        localStorage.removeItem('tertiary-color');
        localStorage.removeItem('common-color');
        localStorage.removeItem('common-hover-color');
        location.reload();
    })
}

const updateColor = (variable, value) => {
    document.documentElement.style.setProperty(variable, value);
};
const loadSavedColors = () => {
    const savedPrimaryColor = localStorage.getItem('primary-color');
    const savedSecondaryColor = localStorage.getItem('secondary-color');
    const savedTertiaryColor = localStorage.getItem('tertiary-color');
    const savedCommonColor = localStorage.getItem('common-color');
    const savedCommonHoverColor = localStorage.getItem('common-hover-color');
    if (savedPrimaryColor) {
        updateColor('--primary-color', savedPrimaryColor);
        updateColor('--input-color', savedPrimaryColor)
    }

    if (savedSecondaryColor) {
        updateColor('--secondary-color', savedSecondaryColor);
    }

    if (savedTertiaryColor) {
        updateColor('--tertiary-color', savedTertiaryColor);
    }

    if (savedCommonColor) {
        updateColor('--common-color', savedCommonColor);
    }

    if (savedCommonHoverColor) {
        updateColor('--common-hover-color', savedCommonHoverColor);
    }
};

const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (loggedInUser) {
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("userRights");
            const loginPath = path.join(__dirname, 'login.html');
            window.location.href = loginPath;
        }
    });
}

function validateDiscount(input) {
    let value = input.value;
    value = value.replace(/\D/g, '');
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
        num = 0;
    } else if (num > 100) {
        num = 100;
    }
    input.value = num;
}

const syncDataOnline = document.getElementById("syncDataOnline");
// syncDataOnline.style.display = "none";
if (syncDataOnline) {
    syncDataOnline.addEventListener("click", () => {
        ipcRenderer.send("sync-data");
    });
}

const languageSelector = document.getElementById("languageSettign");
if (languageSelector) {
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const selectedLanguage = languageSelector.value;
            localStorage.setItem("language", selectedLanguage);
        })
    }
}

function setLocale(locale) {
    let filepath;
    let file1path = path.join(__dirname, '../', 'lang', `${locale}.json`);
    const file2path = path.join(__dirname, 'lang', `${locale}.json`);
    const fileName = ["dashboard.html", "index.html", "login.html", "preference.html", "profile.html", "settting.html", "unsettle-bill.html", "edit-bill.html?billNo="];

    const currentFile = window.location.href.split('/').pop();
    if (fileName.includes(currentFile)) {
        filepath = file2path;
    }
    else {
        filepath = file1path;
    }

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error fetching translations:", err);
            return;
        }
        const translations = JSON.parse(data);
        applyTranslations(translations, locale);
        document.documentElement.lang = locale;
    });
}
function applyTranslations(translations, locale) {
    for (const key in translations) {
        if (translations.hasOwnProperty(key)) {
            const element = document.getElementById(key);
            if (element) {
                if (locale === "ar") {
                    element.dir = "rtl";
                }
                element.innerText = translations[key];
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const languageValue = localStorage.getItem("language");
    if (languageValue) {
        if (languageSelector) {
            languageSelector.value = languageValue;
        }
        setLocale(languageValue);
    }
    else {
        setLocale("en");
    }
})

document.addEventListener("DOMContentLoaded", () => {
    loadSavedColors();
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userRights = JSON.parse(localStorage.getItem('userRights'));
    const billInfo = JSON.parse(localStorage.getItem("billInfo"))
    if (loggedInUser) {
        if (userRights != null && userRights[0]?._doc) {
            const userDoc = userRights[0]._doc;
            const elementsToHide = Object.keys(userDoc).filter(key => key !== '_id' && key !== 'user_no' && key !== 'first_name' && userDoc[key] === false);
            elementsToHide.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = "none";
                }
            });
        }
        const resturantName = billInfo._doc.resturant_name;
        const CustomerHotelName = document.getElementById("CustomerHotelName");
        if (CustomerHotelName) {
            CustomerHotelName.innerHTML = resturantName;
        }
    }
    else {
        const loginPath = path.join(__dirname, 'login.html');
        window.location.href = loginPath;
    }
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
                        else if (keyValue === '@') {
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
            keyboard.style.top = `${rect.top + 20}px`;
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
            alphKeyboard.style.display = 'none';
            keyboard.style.transition = "all 0.8s ease"
            updateKeyboardPosition(input);
            input.focus();
        });
    });
    document.querySelectorAll('input[type="number"], input[type="tel"]').forEach(input => {
        input.addEventListener('click', () => {
            activeInput = input;
            keyboard.style.display = 'block';
            alphKeyboard.style.display = 'none';
            keyboard.style.transition = "all 0.8s ease"
            updateKeyboardPosition(input);
            input.focus();
        });
    });

    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('focus', () => {
            alphaActiveInput = input;
            alphKeyboard.style.display = 'block';
            keyboard.style.display = 'none';
            keyboard.style.transition = "all 0.8s ease"
            updateAlphaKeyboardPosition(input);
            input.focus();
        });
    });
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('click', () => {
            alphaActiveInput = input;
            alphKeyboard.style.display = 'block';
            keyboard.style.display = 'none';
            keyboard.style.transition = "all 0.8s ease"
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

