const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/productdb', {
        });
        console.log('Connected to the database successfully...');
    } catch (err) {
        console.error('Failed to connect to the database:', err);
    }
}

connectDB();
