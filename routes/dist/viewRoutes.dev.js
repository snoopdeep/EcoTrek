"use strict";

var express = require('express');

var router = express.Router();

var viewController = require('../controllers/viewController'); // overview page route( this is the home route page)


router.get('/', viewController.getOverview); // tour page route

router.get('/tour/:slug', viewController.getTour);
module.exports = router;