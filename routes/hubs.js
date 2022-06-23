const express = require('express');
const router = express.Router();
const hubs = require('../controllers/hubs');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateHub} = require('../middleware.js')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

const Hub = require('../Model/hubs');


  router.route('/')
  .get(catchAsync(hubs.index))
  .post(isLoggedIn, upload.array('image'),validateHub, catchAsync(hubs.createHub));

  router.get('/new', isLoggedIn, hubs.renderNewForm);
  
  router.route('/:id')
  .get(catchAsync(hubs.showHub))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateHub, catchAsync( hubs.updateHub))
  .delete(isLoggedIn, isAuthor, catchAsync( hubs.deleteHub));

  router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(hubs.renderEditForm));
  


  module.exports = router;