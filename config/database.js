const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/logindb');
        console.log("Connected successfully.");
    } catch (err) {
        console.log("Failed to connect to the database. " + err);
    }
}

connectDB();
