const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');
console.log(process.env.NODE_ENV);
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
// HANDLING UNCAUGHT EXPECTIONS
process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
    process.exit(1);
})
// console.log(x);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then((con) => {
        // console.log(con.connection);
        console.log('DB is connected successfully!');
    })
    .catch((err) => console.log(err));

// Creating a tour document and save it to the database;
// const testTour = new Tour({
//     name: 'The park camper',
//     price: 5448,
//     // rating: 4.7,
// });
// testTour
//     .save()
//     .then((doc) => {
//         console.log(doc);
//     })
//     .catch((err) => console.log(err));

// start the server
const port = 5000;
const server = app.listen(port, () => {
    console.log('Server is ready to take requests....');
});

// HANDLING UNHANDLED PROMISES GLOBALLY
process.on('uncaughtException', (err) => {
    console.log(err.message, err.name);
    server.close(() => {
        process.exit(1);
    });
});
