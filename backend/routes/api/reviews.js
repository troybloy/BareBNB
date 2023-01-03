const express = require('express')

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const spotimage = require('../../db/models/spotimage');
const { Op } = require("sequelize")

const router = express.Router();

const validateReview = [
    check('review')
      .exists({ checkFalsy: true })
      .withMessage("Review text is required"),
    check('stars')
      .exists({ checkFalsy: true })
      .isInt({min: 1, max: 5})
      .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
  ];
// add image to review based on ID
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
    const loggedInUserId = res.req.user.dataValues.id;
    const currentReviewId = Number(req.params.reviewId)

    const reviewChecker = await Review.findByPk(currentReviewId, {
        include: [{model: ReviewImage}]
    })

    if (!reviewChecker) {
        const err = new Error()
        err.message = "Review couldn't be found"
        err.statusCode = 404;
        err.status = 404
        return next(err)
    }
    const parsedReviewCheckerArr = reviewChecker.toJSON();

    if (parsedReviewCheckerArr.userId !== loggedInUserId) {
        const err = new Error()
        err.message = "User must be the owner of this review to create a picture"
        err.status = 403;
        err.statusCode = 403;
        return next(err)
    }
    if (parsedReviewCheckerArr.ReviewImages.length >= 10) {
        const err = new Error()
        err.message = "Maximum number of images for this resource was reached."
        err.status = 403;
        err.statusCode = 403;
        return next(err)
    }

    const { url } = req.body
    const newReviewImage = ReviewImage.build({
        reviewId: currentReviewId,
        url
    })
    await newReviewImage.save()
    const newReviewImageId = newReviewImage.toJSON().id;

    const newReviewImageRes = await ReviewImage.findByPk(newReviewImageId)

    res.json(newReviewImageRes)
})

// get all reviews of current user

router.get('/current', requireAuth, async (req, res) => {
    const loggedInUserId = res.req.user.dataValues.id;
    const reviewsQueryArray = await Review.findAll({
        where: {userId: loggedInUserId},
        include: [
            {model: User, attributes: ["id", "firstName", "lastName"]},
            {
                model: Spot,
                attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "price"],
                include: [{model: SpotImage, where: {preview: true}}]
            },
            {model: ReviewImage}
        ]
    })
    const reviewsParsedQueryArray = []
    reviewsQueryArray.forEach(reviewObject => {reviewsParsedQueryArray.push(reviewObject.toJSON())});


    reviewsParsedQueryArray.forEach(review => {

        review.Spot.previewImage = review.Spot.SpotImages[0].url
        delete review.Spot.SpotImages
    })


    res.json({Reviews: reviewsParsedQueryArray})
})


// edit review

router.put('/:reviewId', requireAuth, validateReview, async (req, res, next) => {
    const loggedInUserId = res.req.user.dataValues.id;
    const reviewId = Number(req.params.reviewId)
    const reviewQuery = await Review.findByPk(reviewId)

    if (!reviewQuery) {
        const err = new Error()
        err.message = "Review couldn't be found"
        err.statusCode = 404;
        err.status = 404;
        return next(err)
    }
    const parsedReviewQuery = reviewQuery.toJSON()
    if (parsedReviewQuery.userId !== loggedInUserId) {
        const err = new Error()
        err.message = "This user is not authorized to edit this review"
        err.status = 403;
        err.statusCode = 403;
        return next(err)
    }
    const { review, stars } = req.body

    reviewQuery.update({
        review, stars
    })

    res.json(reviewQuery)
})

// delete review

router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    const currentReviewId = Number(req.params.reviewId)
    const loggedInUserId = res.req.user.dataValues.id

    const reviewQueryTest = await Review.findOne({
        where: {id: currentReviewId},
    })
    if (reviewQueryTest === null) {
        const err = new Error()
        err.message = "Review couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }
    if (reviewQueryTest.dataValues.userId !== loggedInUserId)  {
        const err = new Error()
        err.message = "Review must belong to the current User"
        err.status = 403
        err.statusCode = 403
        return next(err)
    }

    await reviewQueryTest.destroy()
    res.json({message: "Successfully deleted"})
})


module.exports = router;
