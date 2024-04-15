import axios from 'axios';
import { showAlert } from './alert';

export const signUp = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === 'success') {
            showAlert(
                'success',
                'You have signup successfully. Welcome to EcoTrek!!'
            );
            window.setInterval(() => {
                location.assign('/');
            }, 500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
