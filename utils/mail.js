const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// const sendEmail = async (options) => {
//     //1:crete a transporter

//     const transporter = nodemailer.createTransport({
//         // host: process.env.EMAIL_HOST,
//         // port: process.env.EMAIL_PORT,
//         // secure:false,
//         // auth: {
//         //     user: process.env.EMAIL_USERNAME,
//         //     pass: process.env.EMAIL_PASSWORD,
//         // },
//         host: 'sandbox.smtp.mailtrap.io',
//         port: 2525,
//         auth: {
//             user: '61f39aa790ddf4',
//             pass: 'bea70f2ac754af',
//         },
//     });

//     //2:Define the mail options

//     const mailOptions = {
//         from: 'snoopdeep<snoop@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };

//     //3:Actually send the mail
//     await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;

// // var transport = nodemailer.createTransport({
// //     host: "sandbox.smtp.mailtrap.io",
// //     port: 2525,
// //     auth: {
// //       user: "61f39aa790ddf4",
// //       pass: "bea70f2ac754af"
// //     }
// //   });

// SEND EMAIL CLASS->

module.exports = class Email {
    constructor(user, url) {
        (this.to = user.email),
            (this.firstName = user.name.split(' ')[0]),
            (this.url = url),
            // SET AN CONFIGURATION VARIABLE FOR FROM
            (this.from = `SNOOPDEEP <${process.env.EMAIL_FROM}>`);
    }
    // CREATE TRANSPORT
    // 1: SENDGRID FOR PRODUCTION (real email)
    // 2: NODEMAILER FOR DEVELOPMENT
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //sendgird
            return 1;
        } else {
            return nodemailer.createTransport({
                host: 'sandbox.smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: '61f39aa790ddf4',
                    pass: 'bea70f2ac754af',
                },
            });
        }
    }
    // SEND METHOD-> ACTUAL SENDING OF EMAIL
   async send(template, subject) {
        //1: RENDER HTML BASED ON PUG TEMPLATE
        // here template-> welcome/forgotPassword etc..
        // we pass some data to template for persinalization..
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );

        // 2: DEFINE MAIL OPTIONS
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            // converting all html to simple text-> option hoga jab mail jayega tab
            // fromString convert all html to string
            // text: htmlToText.fromString(html),
            text:htmlToText.convert(html),
        };

        // 3: CREATE A TRANSPORT AND SEND EMAIL
        await this.newTransport().sendMail(mailOptions)
    }

    //SPECIFIC SEND METHOD FOR DIFFERENT PROCESSES->
    // 1: WELCOME MESSAGE
    async sendWelcome() {
       await this.send('welcome', 'Welcome to the Natours Family!');
    }
    // 2: RESET PASSWORD 
    async sendResetPassword(){
        await this.send('passwordReset','Your password reset token(valid for only 10 min)..')
    }
};
