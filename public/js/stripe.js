// import axios from 'axios';
// import { showAlert } from './alert';
// const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);
// //- This is stripe object that is coming from tour.pug and takes public key..

// // tourId is coming from ui(tour.pug-> (data-tour-id=`${tour.id}`))
// export const bookTour = async (tourId) => {
//     try {
//         // const stripe = getStripe();
//         console.log('Hi form the stripe.js...');
//         // 1: GET CHECKOUT SESSION FROM server/api
//         const session = await axios(
//             `http://127.0.0.1:5000/api/v1/booking/checkoutSession/${tourId}`
//         );
//         // 2: CREATE CHECKOUT FORM + CHARGE CREDIT CARD
//         await stripe.redirectToCheckout({
//             sessionId: session.data.session.id,
//         });
//     } catch (err) {
//         showAlert('error', err);
//     }
// };

/* eslint-disable */
// import { method } from 'stripe/lib/StripeResource';
// THIS IS PUBLIC STRIPE KEY USED FOR REDIRECTING TO THE SESSION URL -> BUT I'M NOT USING IT COZ IT 
// GIVING ME ERROR SO USING THE JAVASCRIPT METHOD FOR REDIRECTING..
// const stripe = Stripe('pk_test_51P4GiCSCm8aTigxATrInWQuwp6aA4stUXIiynyh2DnAZXlAM0evVy1mKlv9lWI6qe6Ku5RYvUpvEoUfQOUKwMwSS00a0Xa1VCs');
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
    // console.log('Hello from the stripe.js this is bookTour...');
    try {
        // 1) Get checkout session from API
        const session = await axios({
            method: 'GET',
            url: `/api/v1/bookings/checkoutSession/${tourId}`,
            withCredentials: true,
        });
        // console.log(session);
        window.setTimeout(() => {
            location.assign(session.data.session.url);
        }, 1500);

        // THIS IS PUBLIC STRIPE KEY USED FOR REDIRECTING TO THE SESSION URL -> BUT I'M NOT USING IT COZ IT 
        // GIVING ME ERROR SO USING THE JAVASCRIPT METHOD FOR REDIRECTING..

        // 2) Create checkout form + charge credit card
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id,
        // });
    } catch (err) {
        // console.log(err);
        showAlert('error', err);
    }
};
