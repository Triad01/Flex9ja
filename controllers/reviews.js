const Review = require('../Model/reviews')
const Hub = require('../Model/hubs')


module.exports.createReview = async (req, res) => {
  const hub = await Hub.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author= req.user._id;
  hub.reviews.push(review);
  await review.save();
  await hub.save();
  req.flash('success', 'Created new review!')
  res.redirect(`/hubs/${hub._id}`);
}


module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Hub.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review')
  res.redirect(`/hubs/${id}`);
}

