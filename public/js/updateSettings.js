import axios from 'axios';
import { showAlert } from './alert';

// UPDATE USER NAME AND EMAIL
//-> api ko name and email chahiye update krne ke liye
export const updateUser = async (formData) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMe',
            data: formData,
        });
        if (res.data.status === 'success') {
            // show alert
            showAlert('success', 'Data Updated Successfully!');
            // reload the current user page;
            window.setTimeout(() => {
                location.assign('/me');
            }, 1009);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

// UPDATE USER PASSWORD
// api ko "passwordCurrent"| "password"| "passwordConfirm"| current user| chahiye
// req object ke sath user hoga hi qki login hai pahale se hi so
export const updatePassword = async (
    passwordCurrent,
    password,
    passwordConfirm
) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMyPassword',
            data: {
                passwordCurrent,
                password,
                passwordConfirm,
            },
        });
        // console.log('This is from updateSettings.js and res is->', res);
        // console.log('Response is -> ', res.data.status);
        if (res.data.status === 'success') {
            // console.log(
            //     'this is after successful password updation.. going to show the alert..'
            // );
            showAlert('success', 'Password changed Successfully!');
            // reload the current user page;
            window.setInterval(() => {
                location.assign('/me');
            }, 1000);
        }
    } catch (err) {
        // console.log('Error in updating password is..');
        showAlert('error', err.response.data.message);
    }
};
