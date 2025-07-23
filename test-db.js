require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

const testDBConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    
    await connectDB();
    
    console.log(' MongoDB connection test successful!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    
    await mongoose.connection.close();
    console.log(' Connection closed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('L MongoDB connection test failed:', error.message);
    process.exit(1);
  }
};

testDBConnection();