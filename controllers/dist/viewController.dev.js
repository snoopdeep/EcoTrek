"use strict";

var Tour = require('../models/tourModel');

var catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(function _callee(req, res, next) {
  var tours;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.find());

        case 2:
          tours = _context.sent;
          // 2: BUILD TEMPLATE-> in overview.pug
          // 3: RENDER THE TEMPLATE USING TOUR DATA FROM 1
          res.status(200).render('overview', {
            tours: tours
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.getTour = catchAsync(function _callee2(req, res) {
  var tour;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Tour.findOne({
            slug: req.params.slug
          }).populate({
            path: 'reviews',
            field: 'review rating user'
          }));

        case 2:
          tour = _context2.sent;
          // 2: BUILD TEMPLATE-> tour.pug
          // 3: RENDER THE TEMPLATE USING TOUR DATA
          res.status(200).render('tour', {
            title: 'The Forest hiker',
            tour: tour
          });

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});