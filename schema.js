const Joi = require('joi');
const review = require('./model/review');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location :Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.string().required().min(0),
        image:Joi.string().allow("" , null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating: Joi.number().required(),
        Comment:Joi.string().required(),
    }).required(),
});