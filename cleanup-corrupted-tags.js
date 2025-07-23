require('dotenv').config();
const mongoose = require('mongoose');
const Package = require('./src/models/Package');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanupCorruptedTags = async () => {
  try {
    console.log('Starting cleanup of corrupted tags...');
    
    // Find packages with corrupted tags (longer than 500 characters)
    const packages = await Package.find({});
    
    for (const pkg of packages) {
      let needsUpdate = false;
      
      // Check if tags field is corrupted
      if (pkg.tags && Array.isArray(pkg.tags)) {
        for (let i = 0; i < pkg.tags.length; i++) {
          const tag = pkg.tags[i];
          if (typeof tag === 'string' && tag.length > 100) {
            console.log(`Found corrupted tag in package ${pkg._id}: ${tag.substring(0, 100)}...`);
            pkg.tags[i] = 'corrupted-tag-cleaned'; // Replace with safe placeholder
            needsUpdate = true;
          }
        }
        
        // Remove any corrupted tags and keep only valid ones
        pkg.tags = pkg.tags.filter(tag => 
          typeof tag === 'string' && 
          tag.length < 100 && 
          tag !== 'corrupted-tag-cleaned'
        );
      }
      
      if (needsUpdate) {
        console.log(`Cleaning package ${pkg._id}...`);
        console.log(`Old tags length: ${JSON.stringify(pkg.tags).length}`);
        
        // Save the cleaned package
        await Package.findByIdAndUpdate(pkg._id, { 
          tags: pkg.tags.length > 0 ? pkg.tags : ['travel', 'package']
        });
        
        console.log(`✅ Cleaned package ${pkg._id}`);
      }
    }
    
    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};

const run = async () => {
  await connectDB();
  await cleanupCorruptedTags();
  await mongoose.disconnect();
  console.log('Script completed');
};

run();