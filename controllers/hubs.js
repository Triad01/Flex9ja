const Hub = require('../Model/hubs');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})
const {cloudinary} = require('../cloudinary')


module.exports.index = async (req, res) => {
    const hubs = await Hub.find({});
    res.render('hubs/index', { hubs });
  }

  module.exports.renderNewForm = (req, res) => {
    res.render('hubs/new');
  }

  module.exports.createHub = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
      query: req.body.hub.location,
      limit:1
    }).send()
    const hub = await new Hub(req.body.hub);
    hub.geometry = geoData.body.features[0].geometry;
    hub.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hub.author = req.user._id;
    await hub.save();
    console.log(hub)
    req.flash('success', 'Successfully added a new Hub!')
    res.redirect(`/hubs/${hub._id}`);
  }


  module.exports.showHub = async (req, res,) => {
    const hub = await Hub.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!hub) {
        req.flash('error', 'Cannot find that hub!');
        return res.redirect('/hubs');
    }
    res.render('hubs/show', { hub });
}

module.exports.renderEditForm =  async (req, res) => {
  const {id} = req.params;
  const hub = await Hub.findById(req.params.id);
  if(!hub){
      req.flash('error', 'Cannot find that Hub!')
      res.redirect('/hubs')
  }
  res.render('hubs/edit', { hub });
}

module.exports.updateHub = async (req, res) => {
  const { id } = req.params;
  const hub = await Hub.findByIdAndUpdate(id, { ...req.body.hub });
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  hub.images.push(...imgs);
  await hub.save()
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
    }
    await hub.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
}
 req.flash('success', 'Successfully updated Hub!')
  res.redirect(`/hubs/${hub._id}`);
}

module.exports.deleteHub = async (req, res) => {
  const { id } = req.params;
   await Hub.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted Hub!')
  res.redirect('/hubs');
}