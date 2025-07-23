const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trippat', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Get the Package model
const Package = require('../src/models/Package');

async function fixCorruptedImages() {
  try {
    console.log('🔍 Finding packages with corrupted image data...');
    
    // Find all packages
    const packages = await Package.find({});
    console.log(`📦 Found ${packages.length} total packages`);
    
    let fixedCount = 0;
    
    for (const pkg of packages) {
      let needsUpdate = false;
      const packageData = pkg.toObject();
      
      console.log(`\n📝 Checking package: ${pkg.title} (ID: ${pkg._id})`);
      console.log(`   Images count: ${pkg.images?.length || 0}`);
      
      if (pkg.images && pkg.images.length > 0) {
        const fixedImages = pkg.images.map((img, index) => {
          console.log(`   🖼️  Image ${index + 1}:`, typeof img);
          
          // Convert to plain object to access numeric properties
          const imgObj = img.toObject ? img.toObject() : img;
          console.log(`   🔍 Plain object keys:`, Object.keys(imgObj).slice(0, 20));
          
          // Check if it has numeric string keys (corrupted format)
          const hasCorruptedKeys = imgObj.hasOwnProperty('0') && imgObj.hasOwnProperty('1');
          
          if (typeof imgObj === 'object' && !imgObj.path && hasCorruptedKeys) {
            console.log(`   ❌ Found corrupted image object at index ${index}`);
            
            // Extract path from numeric keys
            const numericKeys = Object.keys(imgObj)
              .filter(key => !isNaN(Number(key)))
              .sort((a, b) => Number(a) - Number(b));
            
            const pathString = numericKeys.map(key => imgObj[key]).join('');
            console.log(`   🔧 Reconstructed path: ${pathString}`);
            needsUpdate = true;
            
            return {
              path: pathString,
              title: imgObj.title || '',
              title_ar: imgObj.title_ar || '',
              altText: imgObj.altText || '',
              altText_ar: imgObj.altText_ar || '',
              description: imgObj.description || '',
              description_ar: imgObj.description_ar || '',
              order: index,
              isFeatured: index === 0,
              uploadedAt: imgObj.uploadedAt || new Date()
            };
          }
          
          // If it's a string (legacy format), convert to new format
          if (typeof img === 'string') {
            console.log(`   🔄 Converting legacy string format: ${img}`);
            needsUpdate = true;
            
            return {
              path: img,
              title: '',
              title_ar: '',
              altText: '',
              altText_ar: '',
              description: '',
              description_ar: '',
              order: index,
              isFeatured: index === 0,
              uploadedAt: new Date()
            };
          }
          
          // If it's already a proper object with path, return as is
          if (typeof img === 'object' && img.path && typeof img.path === 'string') {
            console.log(`   ✅ Image ${index + 1} is already in correct format`);
            return img;
          }
          
          console.log(`   ⚠️  Unknown image format at index ${index}:`, img);
          return img;
        });
        
        if (needsUpdate) {
          console.log(`   💾 Updating package ${pkg.title}...`);
          
          // Update the package with fixed images
          await Package.findByIdAndUpdate(pkg._id, {
            $set: { images: fixedImages }
          });
          
          fixedCount++;
          console.log(`   ✅ Successfully updated package ${pkg.title}`);
        } else {
          console.log(`   ✅ Package ${pkg.title} images are already in correct format`);
        }
      } else {
        console.log(`   ℹ️  Package ${pkg.title} has no images`);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Packages processed: ${packages.length}`);
    console.log(`🔧 Packages fixed: ${fixedCount}`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

async function main() {
  await connectDB();
  await fixCorruptedImages();
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
}

// Run the migration
main().catch(console.error);