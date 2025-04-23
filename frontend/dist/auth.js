/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/auth.js":
/*!*********************!*\
  !*** ./src/auth.js ***!
  \*********************/
/***/ (() => {

eval("const loginButton = document.getElementById('login-button');\r\nconst registerButton = document.getElementById('register-button');\r\nconst loginSubmitButton = document.getElementById('login-submit-button');\r\nconst registerSubmitButton = document.getElementById('register-submit-button')\r\nloginButton.addEventListener('click', selectLoginForm, true);\r\nregisterButton.addEventListener('click', selectRegisterForm, true);\r\n// loginSubmitButton.addEventListener('click', login, true);\r\n// registerSubmitButton.addEventListener('click', register, true);\r\n\r\nconst errorDisplay = document.getElementById('error-display');\r\n\r\nconst loginForm = document.getElementById('login-form');\r\nconst registerForm = document.getElementById('register-form');\r\n\r\nlet selectedAuth = 'register';\r\n\r\nfunction selectLoginForm() {\r\n    registerForm.style.display = 'none';\r\n    loginForm.style.display = 'grid';\r\n    selectedAuth = 'login';\r\n\r\n    loginButton.classList.add('selected-button');\r\n    registerButton.classList.remove('selected-button');\r\n}\r\n\r\nfunction selectRegisterForm() {\r\n    loginForm.style.display = 'none';\r\n    registerForm.style.display = 'grid';\r\n    selectedAuth = 'register';\r\n\r\n    registerButton.classList.add('selected-button');\r\n    loginButton.classList.remove('selected-button');\r\n}\r\n\r\nselectLoginForm();\r\n\r\nfunction getData() {\r\n    return {\r\n        'name': document.getElementById(`${selectedAuth}-username`).value,\r\n        'password': document.getElementById(`${selectedAuth}-password`).value\r\n    };\r\n}\r\n\r\nloginForm.addEventListener('submit', async (event) => {\r\n    event.preventDefault();\r\n    const formData = getData();\r\n\r\n    const requestParams = {\r\n        method: 'POST',\r\n        mode: 'cors',\r\n        headers: {\r\n            'Content-Type': 'application/json'\r\n        },\r\n        body: JSON.stringify(formData)\r\n    }\r\n\r\n    const res = await fetch('http://localhost:3000/login', requestParams);\r\n    const body = await res.json();\r\n\r\n    if (!res.ok) {\r\n        errorDisplay.textContent = body.error;\r\n        return;\r\n    }\r\n    \r\n    localStorage.setItem('userId', body.id);\r\n    localStorage.setItem('userName', body.name);\r\n    localStorage.setItem('userPassword', formData.password);\r\n\r\n    window.location.href = \"./index.html\";\r\n})\r\n\r\nregisterForm.addEventListener('submit', async (event) => {\r\n    event.preventDefault();\r\n    const formData = getData();\r\n    const verifyPassword = document.getElementById('register-verify-password').value;\r\n\r\n    if (verifyPassword != formData.password) {\r\n        errorDisplay.textContent = 'passwords doesnt match';\r\n        return;\r\n    }\r\n\r\n    const requestParams = {\r\n        method: 'POST',\r\n        mode: 'cors',\r\n        headers: {\r\n            'Content-Type': 'application/json'\r\n        },\r\n        body: JSON.stringify(formData)\r\n        /*\r\n        body: {\r\n            'name': formData.name, \r\n            'password': formData.password\r\n        }\r\n        */\r\n    }\r\n\r\n    console.log(requestParams);\r\n\r\n    const res = await fetch('http://localhost:3000/register', requestParams);\r\n    const body = await res.json();\r\n\r\n    if (!res.ok) {\r\n        errorDisplay.textContent = body.error;\r\n        return;\r\n    }\r\n    \r\n    localStorage.setItem('userId', body.id);\r\n    localStorage.setItem('userName', body.name);\r\n    localStorage.setItem('userPassword', verifyPassword);\r\n\r\n    window.location.href = \"./index.html\";\r\n})\r\n\n\n//# sourceURL=webpack://frontend/./src/auth.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/auth.js"]();
/******/ 	
/******/ })()
;