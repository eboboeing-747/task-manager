const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const loginSubmitButton = document.getElementById('login-submit-button');
const registerSubmitButton = document.getElementById('register-submit-button')
loginButton.addEventListener('click', selectLoginForm, true);
registerButton.addEventListener('click', selectRegisterForm, true);
// loginSubmitButton.addEventListener('click', login, true);
// registerSubmitButton.addEventListener('click', register, true);

const errorDisplay = document.getElementById('error-display');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

let selectedAuth = 'register';

function selectLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'grid';
    selectedAuth = 'login';

    loginButton.classList.add('selected-button');
    registerButton.classList.remove('selected-button');
}

function selectRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'grid';
    selectedAuth = 'register';

    registerButton.classList.add('selected-button');
    loginButton.classList.remove('selected-button');
}

selectLoginForm();

function getData() {
    return {
        'name': document.getElementById(`${selectedAuth}-username`).value,
        'password': document.getElementById(`${selectedAuth}-password`).value
    };
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = getData();

    const requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }

    const res = await fetch('http://localhost:3000/login', requestParams);
    const body = await res.json();

    if (!res.ok) {
        errorDisplay.textContent = body.error;
        return;
    }
    
    localStorage.setItem('userId', body.id);
    localStorage.setItem('userName', body.name);
    localStorage.setItem('userPassword', formData.password);

    window.location.href = "./index.html";
})

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = getData();
    const verifyPassword = document.getElementById('register-verify-password').value;

    if (verifyPassword != formData.password) {
        errorDisplay.textContent = 'passwords doesnt match';
        return;
    }

    const requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
        /*
        body: {
            'name': formData.name, 
            'password': formData.password
        }
        */
    }

    console.log(requestParams);

    const res = await fetch('http://localhost:3000/register', requestParams);
    const body = await res.json();

    if (!res.ok) {
        errorDisplay.textContent = body.error;
        return;
    }
    
    localStorage.setItem('userId', body.id);
    localStorage.setItem('userName', body.name);
    localStorage.setItem('userPassword', verifyPassword);

    window.location.href = "./index.html";
})
