const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    productId: {
        type: String,
        unique: true, // تأكيد فريد
        required: true,
        default: function () {
            return 'PROD-' + Math.floor(Math.random() * 10000); // توليد رقم عشوائي أو يمكنك تخصيص التنسيق
        },
    },
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

let product = mongoose.model('Product', productSchema, 'products');


module.exports=product;