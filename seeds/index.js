const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const cities = require('./cities.js')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open",() => {
    console.log("Database connected");
})

const seedDb = async () =>{
    await Campground.deleteMany();
    for(let i =0; i<50; i++){
        const random1000 = Math.floor(Math.random()*50);
        const camp = new Campground({
            location: `${cities[random1000.city]},${cities[random1000.state]}`
        })
        await camp.save();
    }
    
};

seedDb();