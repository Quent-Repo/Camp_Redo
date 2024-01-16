const express = require('express');
//const { default: mongoose, default: mongoose } = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
//const Joi = require('joi')
const {campgroundSchema} = require('./schemas');
const path = require('path');
const catchAsync = require('./utils/catchAsync.js')
const ExpressError = require('./utils/ExpressError')
const mongoose = require('mongoose');
const Campground = require('./models/campground.js');
const Review = require('./models/review')
const {reviewSchema} = require('./schemas')


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    //useNewUrlParser : true,
    //useCreateIndex: true,
    //useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open",() => {
    console.log("Database connected");
})
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.engine('ejs',ejsMate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    }
    else{
        next()
    }
    console.log(result);
}

const validateReview = (req, res, next)=>{
    const {error} = reviewSchema.validate(req.body)
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    }
    else{
        next()
    }
    // console.log(result);
}

app.get('/',( req, res) =>{
    res.render('home')
})

app.get('/makecampground', async (req,res) =>{
    const camp = new Campground({title: "home", desciption: "new york"});
    await camp.save();
    res.send(camp)
})



app.get('/campgrounds', async (req,res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req, res)=>{
    res.render("campgrounds/new");
})

app.post('/campgrounds', catchAsync(async(req, res, next)=>{
    /// if(!req.body.campground) throw new WxpressError('Invalid campgreound', 404)
    // const campgroundSchema= Joi.object({
    //     campground : Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0),
    //         image: Joi.string().required(),
    //         location: Joi.string().require(),
    //         description: Joi.string().require()
    //     }).required()
    // })
    
    // const {error} = campgroundSchema.validate(req.body);
    // if (error){
    //     const msg = error.details.map(el => el.message).join(',')
    //     throw new ExpressError(msg, 404)
    // }
    // console.log(result);
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id/edit',  catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit",{campground})
}))


app.put('/campgrounds/:id',  catchAsync(async (req,res)=>{
    // res.send("it worked")
    const { id }=req.params;
    const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
    
}))

app.get('/campgrounds/:id',  catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews')
    console.log(campground)
    res.render("campgrounds/show", {campground})
}))

app.delete('/campgrounds/:id',  catchAsync(async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync (async(req, res)=>{
    const{ id, reviewId } = req.params
    Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

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