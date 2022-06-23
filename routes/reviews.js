const express = require('express')
const router = express.Router({mergeParams:true})
//mergeParams:true, to keep the parent req.params
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const Hub = require('../Model/hubs')
const Review = require('../Model/reviews')
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))
  
  
  router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
  

  module.exports = router;