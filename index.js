//const { default: mongoose, default: mongoose } = require('mongoose');
//const Joi = require('joi')
// const {campgroundSchema} = require('./schemas');
// const {reviewSchema} = require('./schemas');

const express = require('express');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const path = require('path');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const Campground = require('./models/campground.js');
const Review = require('./models/review');
const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open",() => {
    console.log("Database connected");
})

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const sessionConfig ={
    secret: 'thisisbest',
    resave : false,
    saveUninitialized: true,
    cookie: {
        expiress: Date.now() + 1000*60*60*7*24,
        maxAge: 1000*60*60*7*24,
        httpOnly: true
        //secure: true
        }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) =>{
    res.locals.success= req.flash('success')
    next();
})


app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)
app.use(express.static('public'))


app.get('/',( req, res) =>{
    res.render('home')
})

app.get('/makecampground', async (req,res) =>{
    const camp = new Campground({title: "home", desciption: "new york"});
    await camp.save();
    res.send(camp)
})


app.all("*", (req,res, next)=>{
    next(new ExpressError('page not found', 404))
})

app.use((err,req,res,next) =>{
    const {statusCode=500}=err
    if(!err.message) err.message ='oh no, something is broken';
    res.status(statusCode).render('error', {err})
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})