const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    imageProduct: {
        type: String,
        required: true,
        urlP: String
    },
    titleProduct: {
        type: String,
        required: true,
    },
    priceProduct: {
        type: String,
        required: true,
    },
    descriptionProduct: {
        type: String,
        required: true,
    },
});

let product = mongoose.model('Product', productSchema, 'login');


module.exports=product;