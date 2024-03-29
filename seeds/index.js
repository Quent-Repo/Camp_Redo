const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const cities = require('./cities.js')
const {places, descriptions} = require('./seedhelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open",() => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () =>{
    await Campground.deleteMany({});
    for(let i =0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const money = Math.floor(Math.random()*100);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptions)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'its a good place to go if you are looking to get away from it all',
            price: money
        })
        await camp.save();
    }
    
};

seedDb().then(() =>{
    mongoose.connection.close();
});