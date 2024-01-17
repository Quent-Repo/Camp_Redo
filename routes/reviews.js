const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const Campground = require('../models/campground.js');
const Review = require('../models/review');
const reviews = require('../routes/reviews')
const {reviewSchema} = require('../schemas');

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

router.post('/', validateReview, catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
}))


router.delete('/:reviewId', catchAsync (async(req, res)=>{
    const{ id, reviewId } = req.params
    Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))



module.exports=router