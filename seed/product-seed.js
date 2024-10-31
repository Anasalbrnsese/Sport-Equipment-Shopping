const db = require('../config/database');
const Product = require('../models/products');  // Ensure correct capitalization if the model is defined with a capital 'P'

async function createProducts() {
    const productsArray = [
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'Dell Laptop',
            priceProduct: '900',
            descriptionProduct: 'Dell laptop with Windows 11, mouse, and additional gift.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'HP Laptop',
            priceProduct: '850',
            descriptionProduct: 'HP laptop, Windows 11, and free bag.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'Lenovo Laptop',
            priceProduct: '780',
            descriptionProduct: 'Lenovo laptop with Windows 10 and wireless mouse.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'MacBook Air',
            priceProduct: '1,200',
            descriptionProduct: 'MacBook Air with M1 chip and accessories.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'Asus Laptop',
            priceProduct: '890',
            descriptionProduct: 'Asus laptop, Intel i7, with gaming keyboard.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'Acer Laptop',
            priceProduct: '750',
            descriptionProduct: 'Acer laptop with SSD storage and Windows 10.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'Samsung Chromebook',
            priceProduct: '400',
            descriptionProduct: 'Samsung Chromebook with long battery life.'
        },
        {
            imageProduct: 'https://img.freepik.com/free-photo/laptop-with-colorful-screen-white-background-3d-rendering_1142-58703.jpg?w=740&t=st=1729283360~exp=1729283960~hmac=4355e318727bb086d284c4137181e4242a24bb1617c1343f3fa68f724fe9c949',
            titleProduct: 'Microsoft Surface',
            priceProduct: '950',
            descriptionProduct: 'Microsoft Surface Pro with Windows 11 and touch screen.'
        }
    ];

    try {
        // Insert multiple products in one go
        await Product.insertMany(productsArray);  // Use insertMany for bulk insertion
        console.log("All records were added");
    } catch (err) {
        console.log(err);
    }
}

createProducts();  // Call the function to insert the products
