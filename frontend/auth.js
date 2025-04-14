const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const loginSubmitButton = document.getElementById('login-submit-button');
const registerSubmitButton = document.getElementById('register-submit-button')
loginButton.addEventListener('click', selectLoginForm, true);
registerButton.addEventListener('click', selectRegisterForm, true);
// loginSubmitButton.addEventListener('click', login, true);
// registerSubmitButton.addEventListener('click', register, true);

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

selectRegisterForm();

function getData() {
    return {
        'name': document.getElementById(`${selectedAuth}-username`).value,
        'password': document.getElementById(`${selectedAuth}-password`).value
    };
}

loginForm.addEventListener('submit', async (event) => {
    const formData = getData();
    const username = formData.username;
    const password = formData.password;

    const reqeustParams = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }

    // let response = await fetch('http://127.0.0.1:3000/login', reqeustParams);
    fetch('http://localhost:3000/login', reqeustParams)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
        });

    // window.location.href = "./index.html"; // if request is ok
    event.preventDefault();
})