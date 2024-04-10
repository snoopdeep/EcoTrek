const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

// ROUTES FOR USERS
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/logout', authController.logout);
// FORGET AND RESET PASSWORD
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// now all the routes below should be protected.. so use protect middleware before all of them
// authorization...
router.use(authController.protect);

// UPDATE PASSWORD
router.patch('/updateMyPassword', authController.updatePassword);

//UPDATE USER DATA
router.patch('/updateMe', userController.uploadUserPhoto,userController.resizeUserImgage,userController.updateMe);

// DELETE CURRENT USER
router.delete('/deleteMe', userController.deleteMe);

// GET ME
router.get('/me', userController.getMe, userController.getUser);

// NOW ALL THE ROUTES SHOULD BE PROTECTED ONLY TO ADMIN=> authorization;

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
