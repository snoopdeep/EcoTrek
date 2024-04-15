import '@babel/polyfill';

// importing login module
import { login, logout } from './login';
import { signUp } from './signup';
import { updateUser, updatePassword } from './updateSettings';
import { bookTour } from './stripe';
// console.log(login);
// console.log(updateUser);

// DOM ELEMENTS -> if(domElement) then perform action to avoid errors
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
const signUpBtn = document.querySelector('.form--signup');

// console.log(loginForm);
// console.log(updateUserForm);

// VALUES : VALUES FORM THE DOM ELEMENTS : MAKE SURE THEY ARE AVAILBE IN BEGINING OTHERVISE IT WILL BE NULL VALUE
// EX: selecting email and pass from login from here will not work coz that field will not contain anything when this file loads.

// 1: SELECTING REQUIRED ELEMENTS FROM THE base.pug for login feature
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        // console.log('You have clicked the login button...');
        e.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        login(email, password);
    });
}

// 1A: SIGN UP
if (signUpBtn) {
    signUpBtn.addEventListener('submit', (e) => {
        console.log('Sign Up botton clicked....');
        e.preventDefault();
        // SIGN UP
        const name = document.getElementById('nameSignup').value;
        const email = document.getElementById('emailSignup').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        console.log(name, email, password, passwordConfirm);
        signUp(name, email, password, passwordConfirm);
    });
}

// 2: LOGOUT
if (logOutBtn) {
    logOutBtn.addEventListener('click', () => {
        // console.log('logOutBtn clicked..');
        // console.log('message from inside of click event of logOutBtn');
        logout();
    });
}

// 3: UPDATE USER(ME)
if (updateUserForm) {
    updateUserForm.addEventListener('submit', (e) => {
        // console.log('Update user cliked...');
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('photo', document.getElementById('photo').files[0]);
        // const name = document.getElementById('name').value;
        // const email = document.getElementById('email').value;
        // console.log('FormData is ..', formData);
        // console.log('Submitted for updating user name and email..');
        updateUser(formData);
    });
}

// 4: UPDATE PASSWORD(ME)

if (updatePasswordForm) {
    // we have to clear the field after password change.. we have to await updatePassword() method coz its a async function
    // so that we execute the line afer finished that..
    // saving the password to db takes some time due to encryption process so let user know that something happingin in background..
    updatePasswordForm.addEventListener('submit', async (e) => {
        // console.log('Update Password clicked...');
        e.preventDefault();
        document.querySelector('.saving--password--btn ').textContent =
            'Updating...';
        const passwordCurrent =
            document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm =
            document.getElementById('password-confirm').value;
        // console.log(passwordCurrent, password, passwordConfirm);
        await updatePassword(passwordCurrent, password, passwordConfirm);
        document.querySelector('.saving--password--btn ').textContent =
            'Save Password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}
// console.log('Hi from index.js');
//PAYMENT;
if (bookBtn) {
    // console.log('Booked button is clicked...');
    bookBtn.addEventListener('click', async (e) => {
        // console.log('Booked button is clickedd...');
        // console.log(e.target);
        e.target.textContent = 'Processing...';
        // const tourId = e.target.dataset.tourId;
        const { tourId } = e.target.dataset;
        await bookTour(tourId);
    });
}
// if (bookBtn)
// console.log('This is from bookBtn.. ');
//   bookBtn.addEventListener('click', e => {
//     e.target.textContent = 'Processing...';
//     const { tourId } = e.target.dataset;
//     bookTour(tourId);
//   });
