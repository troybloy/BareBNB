const express = require('express')

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User, Booking, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op, where } = require("sequelize")

const router = express.Router();

const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage("Country is required"),
    check('lat')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Latitude is not valid"),
    check('lng')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Longitude is not valid"),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 1, max: 49 })
        .withMessage("Name must be less than 50 characters"),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check('price')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Price per day is required and it must be a number"),
    handleValidationErrors
]

const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage("Review text is required"),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

const endDateChecker = (date1, date2) => {
    const startDate = new Date(date1).getTime()
    const endDate = new Date(date2).getTime()
    if (startDate >= endDate) return false
    else return true
}

const bookingConflictChecker = (date1, date2, date3, date4) => {
    const currentStartDate = new Date(date1).getTime()
    const currentEndDate = new Date(date2).getTime()
    const dateCheckStartDate = new Date(date3).getTime()
    const dateCheckEndDate = new Date(date4).getTime()

    const errors = []
    if (currentStartDate >= dateCheckStartDate && currentStartDate <= dateCheckEndDate) {
        // console.log("Start date is between the start date and end date of another booking!")
        errors.push("Start date conflicts with an existing booking")
    }
    if (currentEndDate >= dateCheckStartDate && currentEndDate <= dateCheckEndDate) {
        // console.log("End date is between the start date and end date of another booking!")
        errors.push("End date conflicts with an existing booking")
    }
    return errors;
}

// ================================= GET ALL SPOTS =================================
router.get('/', async (req, res) => {
    const reviews = await Review.findAll({
        attributes: ['id', 'spotId', 'stars']
    })

    let reviewsObj = {}
    for (const review of reviews) {
        const { spotId, stars } = review
        if (!reviewsObj[spotId]) {
            reviewsObj[spotId] = {};
            reviewsObj[spotId].stars = stars
            reviewsObj[spotId].numberOfReviews = 1
            reviewsObj[spotId].averageStars = stars
        }
        else {
            reviewsObj[spotId].numberOfReviews += 1
            reviewsObj[spotId].stars += stars
            reviewsObj[spotId].averageStars = reviewsObj[spotId].stars / reviewsObj[spotId].numberOfReviews
        }
    }
    const reviewsObjSpotIds = Object.keys(reviewsObj)


    let { page, size } = req.query;
    let pagination = {}
    if(!page) page = 1
    if(!size) size = 20
    if(Number(page) > 10) page = 10
    if (Number(page) > 20) size = 20
    pagination.limit = size;
    pagination.offset = size * (page - 1)
    let whereQueryParams = {}
    if (req.query.minLat) whereQueryParams.lat = {[Op.gte]: req.query.minLat}
    if (req.query.maxLat) whereQueryParams.lat = {[Op.lte]: req.query.maxLat}
    if (req.query.minLng) whereQueryParams.lng = {[Op.gte]: req.query.minLng}
    if (req.query.maxLng) whereQueryParams.lng = {[Op.lte]: req.query.maxLng}
    if (req.query.minPrice) whereQueryParams.price = {[Op.gte]: req.query.minPrice}
    if (req.query.maxPrice) whereQueryParams.price = {[Op.lte]: req.query.maxPrice}



    const spots = await Spot.findAll({
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat',
            'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'],
        include: [{
            model: SpotImage,
            where: {
                preview: true
            }
        }],
        whereQueryParams,
        ...pagination,
    })

    for (let spot of spots) {
        spot.dataValues.previewImage = spot.dataValues.SpotImages[0].dataValues.url
        delete spot.dataValues.SpotImages
    }

    for (let spot of spots) {
        for (let reviewsObjSpotId of reviewsObjSpotIds) {
            if (spot.id === Number(reviewsObjSpotId)) {
                let currentReview = reviewsObj[reviewsObjSpotId]
                spot.dataValues.avgRating = currentReview.averageStars
            }
        }
    }
    res.json({ Spots: spots, page: Number(page), size: Number(size) })
})


// create spot

router.post('/', requireAuth, validateSpot, async (req, res, next) => {
    const { address, city, state, country, lat, lng, name, description, price } = await req.body
    let err = new Error('Validation Error')
    err.errors = []

    const newSpot = Spot.build({
        address, city, state, country, lat, lng, name, description, price
    })
    ownerId = res.req.user.dataValues.id
    newSpot.ownerId = ownerId

    await newSpot.save()
    res.json(newSpot)

})

//get all spots owned by logged in user

router.get('/current', requireAuth, async (req, res) => {
    const loggedInUserId = res.req.user.dataValues.id
    const loggedInUserSpots = await Spot.findAll({
        where: { ownerId: loggedInUserId }
    })
    let spotsArr = []
    loggedInUserSpots.forEach(spot => { spotsArr.push(spot.toJSON()) })
    for (let spot of spotsArr) {
        const previewImage = await SpotImage.findOne({
            attributes: ["spotId", "url"],
            where: { preview: true, spotId: spot.id }
        })
        if (!previewImage) spot.previewImage = "No preview image url found!"
        else spot.previewImage = previewImage.toJSON().url
    }
    for (let spot of spotsArr) {
        const spotAvgRatings = await Review.findAll({
            where: { spotId: spot.id },
            attributes: ["spotId", [sequelize.fn("AVG", sequelize.col("stars")), "avgRating"]],
            group: "spotId"
        })
        if (spotAvgRatings.length === 0) {
            spot.avgRating = "No reviews for this spot yet!"
        } else {
            spot.avgRating = Number(spotAvgRatings[0].toJSON().avgRating)
        }
    }
    res.json({ "Spots": spotsArr })
})


// add image to spot

router.post('/:spotId/images', requireAuth, async (req, res, next) => {
    const loggedInUserId = res.req.user.dataValues.id
    const spotId = Number(req.params.spotId)
    const { url, preview } = await req.body
    const spotIdCheck = await Spot.findOne({
        where: { id: spotId }
    })
    // error if spot isn't found

    if (spotIdCheck === null) {
        const err = new Error()
        err.message = "Spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }

    if (loggedInUserId !== spotIdCheck.dataValues.ownerId) {
        const err = new Error()
        err.message = "The user must own this spot to add an image"
        err.status = 403;
        return next(err)
    }

    const newSpotImage = SpotImage.build({
        spotId, url, preview
    })
    await newSpotImage.save()
    const spotImageId = newSpotImage.toJSON().id
    const spotImage = await SpotImage.findOne({
        where: { id: spotImageId }
    })
    res.json(spotImage)
})


//get spot details

router.get('/:spotId', async (req, res, next) => {
    const spotId = Number(req.params.spotId)
    const spotIdCheck = await Spot.findOne({
        where: { id: spotId }
    })
    if (spotIdCheck === null) {
        const err = new Error()
        err.message = "Spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }
    const spotQuery = await Spot.findByPk(spotId)

    const spot = spotQuery.toJSON()
    const numberOfReviews = await Review.count({ where: { spotId } })
    spot.numReviews = numberOfReviews
    const reviewAvgQuery = await Review.findAll({
        where: { spotId },
        attributes: [[sequelize.fn("AVG", sequelize.col("stars")), "avgRating"]]
    })
    if (reviewAvgQuery.num === 0) spot.avgStarRating = "There is no review for this spot yet!"
    else spot.avgStarRating = Number(reviewAvgQuery[0].toJSON().avgRating)

    const SpotImages = []
    const spotImages = await SpotImage.findAll({
        where: { spotId }
    })
    spotImages.forEach(spotImage => { SpotImages.push(spotImage.toJSON()) })
    spot.SpotImages = SpotImages;

    const ownerDataQuery = await User.findByPk(spot.ownerId, {
        attributes: ["id", "firstName", "lastName"]
    })
    const ownerData = ownerDataQuery.toJSON()
    spot.Owner = ownerData



    res.json(spot)
})


//edit spot
router.put('/:spotId', requireAuth, validateSpot, async (req, res, next) => {
    const loggedInUserId = res.req.user.dataValues.id;
    const spotId = req.params.spotId;
    const currentSpot = await Spot.findByPk(spotId)
    if (currentSpot === null) {
        const err = new Error()
        err.message = "Spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }

    if (currentSpot.toJSON().ownerId !== loggedInUserId) {
        const err = new Error()
        err.errors =[]
        err.errors.push("Spot must belong to the current User")
        err.status = 403
        err.statusCode = 403
        return next(err)
    }

    const { address, city, state, country, lat, lng, name, description, price } = req.body
    let err = new Error('Validation Error')
    err.errors = []

    currentSpot.update({
        address, city, state, country, lat, lng, name, description, price
    })
    res.json(currentSpot)
})

//create spot review based on ID

router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res, next) => {
    const loggedInUserId = res.req.user.dataValues.id
    const spotId = Number(req.params.spotId);
    const currentSpot = await Spot.findByPk(spotId)

    if (currentSpot === null) {
        const err = new Error()
        err.message = "Spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }
    const { review, stars } = req.body;

    let err = new Error('Validation Error')
    err.errors = []
    if (!review || (stars < 1 || stars > 5)) {
        if (!review) err.errors.push("Review text is required")
        if (stars < 1 || stars > 5) err.errors.push("Stars must be an integer from 1 to 5")
        err.status = 400;
        err.statusCode = 400;
        return next(err)
    }

    const userReviews = await Review.findAll({
        where: { userId: loggedInUserId },
    })
    let userReviewsArr = []
    userReviews.forEach(userReview => { userReviewsArr.push(userReview.toJSON()) })
    for (const userReview of userReviewsArr) {
        if (userReview.spotId === spotId) {
            const err = new Error()
            err.errors = []
            err.errors.push("User already has a review for this spot")
                err.status = 403;
            err.statusCode = 403;
            return next(err)
        }
    }
    const newReview = Review.build({
        userId: loggedInUserId,
        spotId,
        review,
        stars
    })

    await newReview.save()

    res.json(newReview)
})



//get all reviews of a spot

router.get('/:spotId/reviews', async (req, res, next) => {
    const currentSpotId = req.params.spotId
    const unparsedReviewsArr = await Review.findAll({
        where: { spotId: currentSpotId },
        include: [
            { model: User, attributes: ["id", "firstName", "lastName"] },
            { model: ReviewImage }
        ]
    })
    if (unparsedReviewsArr.length === 0) {
        res.json({Reviews: []})
    } else {
        const parsedReviewsArr = []
        unparsedReviewsArr.forEach(review => { parsedReviewsArr.push(review.toJSON()) })

        res.json({ Reviews: parsedReviewsArr})
    }
})

//create booking for spot

router.post('/:spotId/bookings', requireAuth, async (req, res, next) => {
    const spotId = Number(req.params.spotId)
    const loggedInUserId = res.req.user.dataValues.id

    const spotQuery = await Spot.findByPk(spotId)

    if (spotQuery === null) {
        const err = new Error()
        err.message = "Spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }

    const { startDate, endDate } = req.body
    const startDateJS = new Date(startDate)
    const endDateJS = new Date(endDate)

    if (endDateChecker(startDate, endDate) === false) {
        const err = new Error()
        err.message = "Validation error"
        err.statusCode = 400;
        err.status = 400;
        err.errors = ["endDate cannot be on or before startDate"]
        return next(err)
    }
    const bookingQuery = await Booking.findAll({
        where: {
            spotId,
            startDate: {
                [Op.gte]: startDateJS
            }
        }
    })
    if (bookingQuery.length > 0) {
        for (let booking of bookingQuery) {
            const bookingErrors = bookingConflictChecker(startDate, endDate, booking.dataValues.startDate, booking.dataValues.endDate)

            if (bookingErrors.length > 0) {
                const err = new Error()
                err.message = "Sorry, this spot is already booked for the specified dates"
                err.status = 403;
                err.statusCode = 403;
                err.errors = bookingErrors;
                return next(err)
            }
        }
    }
    const newBooking = await Booking.build({
        spotId, userId: loggedInUserId, startDate, endDate
    })
    await newBooking.save()

    res.json(newBooking)
})


//get all of a spot's bookings based on ID

router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
    const currentSpotId = Number(req.params.spotId)
    const loggedInUserId = res.req.user.dataValues.id

    const spotQueryTest = await Spot.findOne({
        where: {id: currentSpotId}
    })
    if (spotQueryTest === null) {
        const err = new Error()
        err.message = "Spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }

    const bookingResponseArr = []
    if (spotQueryTest.dataValues.ownerId === loggedInUserId) {
        const spotQuery = await Booking.findAll({
            where: {spotId: currentSpotId},
            include: [
                {
                    model: User,
                    attributes: ["id", "firstName", "lastName"]
                }
            ],
            attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"]
        })
        spotQuery.forEach(booking => {bookingResponseArr.push(booking.toJSON())})
    } else {
        const spotQuery = await Booking.findAll({
            where: {spotId: currentSpotId},
            attributes: ["spotId", "startDate", "endDate"]
        })
        spotQuery.forEach(booking => {bookingResponseArr.push(booking.toJSON())})
    }

    res.json({Bookings: bookingResponseArr})
})


// DELETE a spot
router.delete('/:spotId', requireAuth, async (req, res, next) => {
    const currentSpotId = Number(req.params.spotId)
    const loggedInUserId = res.req.user.dataValues.id

    const spotQueryTest = await Spot.findOne({
        where: {id: currentSpotId},
    })
    if (spotQueryTest === null) {
        const err = new Error()
        err.message = "spot couldn't be found";
        err.status = 404;
        err.statusCode = 404;
        return next(err)
    }
    if (spotQueryTest.dataValues.ownerId !== loggedInUserId)  {
        const err = new Error()
        err.errors = []
        err.errors.push("Spot must belong to the current User")
        err.status = 403
        err.statusCode = 403
        return next(err)
    }

    await spotQueryTest.destroy()
    res.json({message: "Successfully deleted"})
})
module.exports = router;
