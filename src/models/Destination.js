const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'City name in English is required'],
      trim: true
    },
    ar: {
      type: String,
      required: [true, 'City name in Arabic is required'],
      trim: true
    }
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const destinationSchema = new mongoose.Schema({
  country: {
    en: {
      type: String,
      required: [true, 'Country name in English is required'],
      trim: true
    },
    ar: {
      type: String,
      required: [true, 'Country name in Arabic is required'],
      trim: true
    }
  },
  countryCode: {
    type: String,
    required: [true, 'Country code is required'],
    uppercase: true,
    trim: true,
    unique: true,
    minlength: [2, 'Country code must be at least 2 characters'],
    maxlength: [3, 'Country code must not exceed 3 characters']
  },
  cities: [citySchema],
  continent: {
    type: String,
    enum: ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Australia', 'Antarctica'],
    required: [true, 'Continent is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
destinationSchema.index({ countryCode: 1 });
destinationSchema.index({ 'country.en': 1 });
destinationSchema.index({ 'country.ar': 1 });
destinationSchema.index({ 'cities.name.en': 1 });
destinationSchema.index({ 'cities.name.ar': 1 });
destinationSchema.index({ continent: 1 });
destinationSchema.index({ isActive: 1 });

// Pre-save middleware
destinationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slugs for cities if not provided
  this.cities.forEach(city => {
    if (!city.slug) {
      city.slug = city.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
    }
  });
  
  next();
});


// Virtual for getting active cities count
destinationSchema.virtual('activeCitiesCount').get(function() {
  return this.cities.filter(city => city.isActive).length;
});

// Virtual for getting all city names (English)
destinationSchema.virtual('cityNamesEn').get(function() {
  return this.cities.filter(city => city.isActive).map(city => city.name.en);
});

// Virtual for getting all city names (Arabic)
destinationSchema.virtual('cityNamesAr').get(function() {
  return this.cities.filter(city => city.isActive).map(city => city.name.ar);
});

// Instance method to add a city
destinationSchema.methods.addCity = function(cityData) {
  const slug = cityData.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
  const newCity = {
    name: cityData.name,
    slug: slug,
    isActive: cityData.isActive !== undefined ? cityData.isActive : true
  };
  this.cities.push(newCity);
  return this.save();
};

// Instance method to update a city
destinationSchema.methods.updateCity = function(cityId, updateData) {
  const city = this.cities.id(cityId);
  if (!city) {
    throw new Error('City not found');
  }
  
  if (updateData.name) {
    city.name = updateData.name;
    city.slug = updateData.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
  }
  if (updateData.isActive !== undefined) {
    city.isActive = updateData.isActive;
  }
  
  return this.save();
};

// Instance method to remove a city
destinationSchema.methods.removeCity = function(cityId) {
  this.cities.id(cityId).remove();
  return this.save();
};

// Static method to get destinations with cities
destinationSchema.statics.getDestinationsWithCities = function(options = {}) {
  const {
    continent,
    country,
    activeOnly = true,
    includeInactiveCities = false
  } = options;
  
  let query = {};
  if (activeOnly) query.isActive = true;
  if (continent) query.continent = continent;
  if (country) {
    query.$or = [
      { 'country.en': new RegExp(country, 'i') },
      { 'country.ar': new RegExp(country, 'i') }
    ];
  }
  
  const pipeline = [
    { $match: query },
    {
      $addFields: {
        cities: {
          $filter: {
            input: '$cities',
            cond: includeInactiveCities ? {} : { $eq: ['$$this.isActive', true] }
          }
        }
      }
    },
    { $sort: { 'country.en': 1 } }
  ];
  
  return this.aggregate(pipeline);
};

// Export the model
module.exports = mongoose.model('Destination', destinationSchema);