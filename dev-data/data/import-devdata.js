const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// console.log(__dirname);
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

// console.log(typeof process.env.DATABASE);
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
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
// READ THE DATA
// console.log(__dirname);
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`), 'utf8');
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`), 'utf8');
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`),
    'utf8'
);

// console.log(tours);

// IMPORT DATA IN DB
const importData = async () => {
    try {
        await Tour.create(tours);
        // stop validation of confirmPassword and password encryption coz password is already incrypted..
        await User.create(users, {validateBeforeSave:false});
        await Review.create(reviews);

        console.log('Data Successfully imported');
    } catch (err) {
        console.log(err);
    } finally {
        process.exit();
    }
};
// DELETE DATA FORM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log('Data Successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '___import') {
    importData();
} else if (process.argv[2] === '___delete') {
    deleteData();
}
