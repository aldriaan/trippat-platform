require('dotenv').config();
const mongoose = require('mongoose');

async function fixDestinationIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the destinations collection
    const db = mongoose.connection.db;
    const collection = db.collection('destinations');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the problematic index if it exists
    try {
      await collection.dropIndex('cities.slug_1');
      console.log('Successfully dropped cities.slug_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index cities.slug_1 does not exist (which is good)');
      } else {
        console.error('Error dropping index:', error);
      }
    }

    // List indexes again to confirm
    const indexesAfter = await collection.indexes();
    console.log('Indexes after cleanup:', indexesAfter.map(idx => ({ name: idx.name, key: idx.key })));

    console.log('Index cleanup completed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixDestinationIndex();