// THIS IS LOGIN MODULE WHICH WILL BE SERVE TO INDEX.JS

// IMPORTING AXIOS FROM NPM HERE AND THIS FILE WILL BE BUNDLED WITH REQUIRED FILES AND SAVE IN bundle.js

import axios from 'axios';
import { showAlert } from './alert';

// axios is promise based http cliet which send the http request to server from client side(browser)
// it through the error send by the api so catch it and display to the user..
// const axios = require('axios/dist/browser/axios.cjs'); // browser

export const login = async (email, password) => {
    // console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:5000/api/v1/users/signin',
            data: {
                email,
                password,
            },
        });
        // console.log(res);
        // if successful login the api will send data with status code we define..
        if (res.data.status === 'success') {
            // when successfull login => showAlert
            showAlert('success', 'Logged In Successfully!');
            window.setInterval(() => {
                location.assign('/');
            }, 500);
        }
    } catch (err) {
        // console.log(err);
        showAlert('error', err.response.data.message);
    }
};

// signOut : send request to api if triggered signout button
export const logout = async () => {
    try { 
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:5000/api/v1/users/logout',
        });
        // back to the home page.. api will send res with status 'success'
        console.log('this is after api call');
        console.log(res);
        // if(!res.cookies.jwt){console.log('No cookie is found');location.reload(true)};
        if (res.data.status === 'success'){console.log('this is final..'); location.reload(true);}
        // true-> we want reload from server side coz if reload from client side it can reload the page from the cache so
    } catch (err) {
        // clicking logout button didn't through any error only when if there is no connection
        console.log('no way');
        showAlert('error', 'Error Logging Out! Try Again.');
    }
};
