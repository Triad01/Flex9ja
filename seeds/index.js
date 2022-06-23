const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Hub = require('../Model/hubs');

mongoose.connect('mongodb://localhost:27017/flexhub-Db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Hub.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const random700 = Math.floor(Math.random() * 700);
    const price = Math.floor(Math.random() * 10000) + 10;
    const hub = new Hub({
      author: '62b2030b79340f5f8369b0e9',
      location: `${cities[random700].city}, ${cities[random700].admin_name}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: 'https://source.unsplash.com/collection/168939',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random700].lng,
          cities[random700].lat  
        ]
     
    },
      images: [
        {
         
            url: 'https://res.cloudinary.com/dvidneho8/image/upload/v1655893159/FlexHub/ojdmfxly1ad3pdj1fphd.jpg',
            filename: 'FlexHub/ojdmfxly1ad3pdj1fphd',
        },
        {
          url: 'https://res.cloudinary.com/dvidneho8/image/upload/v1655892831/FlexHub/l0vgcy169v9clj49ajn1.jpg',
          filename: 'FlexHub/l0vgcy169v9clj49ajn1',
        }
    ]

    });
    await hub.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});


