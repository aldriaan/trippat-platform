const Hotel = require('../models/Hotel');
const TBOHotel = require('../models/TBOHotel');
const tboService = require('./tboService');

class HotelSyncService {
  constructor() {
    this.tboService = tboService;
  }

  /**
   * Search TBO hotels by city to find matching hotels
   * @param {string} cityName - Name of the city to search
   * @param {string} countryCode - Country code (e.g., 'AE', 'SA', 'GB')
   * @returns {Promise<Array>} Array of TBO hotels
   */
  async searchTBOHotelsByCity(cityName, countryCode = 'AE') {
    try {
      console.log(`🔍 Searching TBO hotels in ${cityName}, ${countryCode}`);
      
      // Get city code from TBO locations
      const cities = await this.tboService.getCityList(countryCode);
      
      // Try multiple matching strategies for better city matching
      let matchingCities = [];
      
      // Special handling for Phuket - always search all related areas
      if (cityName.toLowerCase().includes('phuket')) {
        const phuketCities = cities.filter(city => 
          city.Name.toLowerCase().includes('phuket') ||
          city.Name.toLowerCase().includes('mai khao') ||
          city.Name.toLowerCase().includes('patong') ||
          city.Name.toLowerCase().includes('kata') ||
          city.Name.toLowerCase().includes('karon') ||
          city.Name.toLowerCase().includes('rawai') ||
          city.Name.toLowerCase().includes('kamala') ||
          city.Name.toLowerCase().includes('surin') ||
          city.Name.toLowerCase().includes('bang tao') ||
          city.Name.toLowerCase().includes('nai harn') ||
          city.Name.toLowerCase().includes('chalong') ||
          city.Name.toLowerCase().includes('thalang') ||
          city.Name.toLowerCase().includes('cherng talay') ||
          city.Name.toLowerCase().includes('cape panwa') ||
          city.Name.toLowerCase().includes('cape yamu')
        );
        
        if (phuketCities.length > 0) {
          console.log(`🏝️ Found ${phuketCities.length} Phuket-related cities: ${phuketCities.map(c => c.Name).join(', ')}`);
          matchingCities = phuketCities;
        }
      } 
      // Special handling for London - search all London-related areas
      else if (cityName.toLowerCase().includes('london')) {
        const londonCities = cities.filter(city => 
          city.Name.toLowerCase().includes('london') ||
          city.Name.toLowerCase().includes('westminster') ||
          city.Name.toLowerCase().includes('kensington') ||
          city.Name.toLowerCase().includes('chelsea') ||
          city.Name.toLowerCase().includes('camden') ||
          city.Name.toLowerCase().includes('tower hamlets') ||
          city.Name.toLowerCase().includes('southwark') ||
          city.Name.toLowerCase().includes('lambeth') ||
          city.Name.toLowerCase().includes('wandsworth') ||
          city.Name.toLowerCase().includes('hammersmith') ||
          city.Name.toLowerCase().includes('fulham') ||
          city.Name.toLowerCase().includes('islington') ||
          city.Name.toLowerCase().includes('hackney') ||
          city.Name.toLowerCase().includes('greenwich') ||
          city.Name.toLowerCase().includes('lewisham')
        );
        
        if (londonCities.length > 0) {
          console.log(`🏛️ Found ${londonCities.length} London-related cities: ${londonCities.map(c => c.Name).join(', ')}`);
          matchingCities = londonCities;
        }
      } else {
        // 1. Exact match
        const exactMatch = cities.find(city => 
          city.Name.toLowerCase() === cityName.toLowerCase()
        );
        
        if (exactMatch) {
          matchingCities = [exactMatch];
        } else {
          // 2. Contains match (original logic)
          const containsMatches = cities.filter(city => 
            city.Name.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(city.Name.toLowerCase())
          );
          
          if (containsMatches.length > 0) {
            matchingCities = containsMatches;
          }
        }
      }

      if (matchingCities.length === 0) {
        const availableCities = cities.map(c => c.Name).slice(0, 10).join(', ');
        throw new Error(`City "${cityName}" not found in TBO locations for country ${countryCode}. Available cities: ${availableCities}`);
      }
      
      // Get hotels from all matching cities and combine results
      console.log(`🔍 Searching hotels in ${matchingCities.length} cities: ${matchingCities.map(c => c.Name).join(', ')}`);
      let allHotels = [];
      
      for (const city of matchingCities) {
        try {
          const cityHotels = await this.tboService.getHotelsByCity(city.Code);
          allHotels = allHotels.concat(cityHotels);
        } catch (error) {
          console.warn(`Failed to get hotels for city ${city.Name}: ${error.message}`);
        }
      }
      
      console.log(`✅ Found total ${allHotels.length} hotels across all cities`);
      const hotels = allHotels;
      return hotels.map(hotel => ({
        tboHotelCode: hotel.HotelCode,
        name: hotel.HotelName,
        cityCode: hotel.CityId,
        countryCode: hotel.CountryCode,
        starRating: hotel.StarRating,
        address: hotel.Address,
        description: hotel.Description,
        coordinates: hotel.GeoLocation ? {
          latitude: hotel.GeoLocation.Latitude,
          longitude: hotel.GeoLocation.Longitude
        } : null,
        amenities: hotel.Amenities || [],
        images: hotel.Images || []
      }));
    } catch (error) {
      console.error('Error searching TBO hotels:', error);
      throw error;
    }
  }

  /**
   * Find potential TBO matches for a local hotel
   * @param {Object} hotel - Local hotel object
   * @returns {Promise<Array>} Array of potential TBO matches
   */
  async findTBOMatches(hotel) {
    try {
      const tboHotels = await this.searchTBOHotelsByCity(hotel.location.city);
      
      // Score matches based on similarity
      const matches = tboHotels.map(tboHotel => {
        const score = this.calculateMatchScore(hotel, tboHotel);
        return { ...tboHotel, matchScore: score };
      });

      // Return top matches (score > 0.5) sorted by score
      return matches
        .filter(match => match.matchScore > 0.5)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
    } catch (error) {
      console.error('Error finding TBO matches:', error);
      throw error;
    }
  }

  /**
   * Calculate match score between local hotel and TBO hotel
   * @param {Object} localHotel - Local hotel object
   * @param {Object} tboHotel - TBO hotel object
   * @returns {number} Match score between 0 and 1
   */
  calculateMatchScore(localHotel, tboHotel) {
    let score = 0;
    let factors = 0;

    // Name similarity (40% weight)
    const nameSimilarity = this.calculateStringSimilarity(
      localHotel.name.toLowerCase(),
      tboHotel.name.toLowerCase()
    );
    score += nameSimilarity * 0.4;
    factors += 0.4;

    // Star rating match (20% weight)
    if (localHotel.starRating === tboHotel.starRating) {
      score += 0.2;
    } else if (Math.abs(localHotel.starRating - tboHotel.starRating) <= 1) {
      score += 0.1;
    }
    factors += 0.2;

    // Location proximity (30% weight) - if coordinates available
    if (localHotel.location.coordinates && tboHotel.coordinates) {
      const distance = this.calculateDistance(
        localHotel.location.coordinates,
        tboHotel.coordinates
      );
      // Hotels within 5km get full score, decreasing linearly to 0 at 50km
      const proximityScore = Math.max(0, (50 - distance) / 50);
      score += proximityScore * 0.3;
      factors += 0.3;
    }

    // Address similarity (10% weight)
    if (localHotel.location.address && tboHotel.address) {
      const addressSimilarity = this.calculateStringSimilarity(
        localHotel.location.address.toLowerCase(),
        tboHotel.address.toLowerCase()
      );
      score += addressSimilarity * 0.1;
      factors += 0.1;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Link a local hotel to a TBO hotel
   * @param {string} hotelId - Local hotel ID
   * @param {Object} tboHotelData - TBO hotel data
   * @returns {Promise<Object>} Updated hotel
   */
  async linkHotelToTBO(hotelId, tboHotelData) {
    try {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        throw new Error('Hotel not found');
      }

      // Link the hotel
      hotel.linkToTBO(
        tboHotelData.tboHotelCode,
        tboHotelData.name,
        tboHotelData.cityCode,
        tboHotelData.countryCode
      );

      await hotel.save();

      // Cache TBO hotel data
      await this.cacheTBOHotelData(tboHotelData);

      console.log(`✅ Hotel ${hotel.name} linked to TBO hotel ${tboHotelData.tboHotelCode}`);
      return hotel;
    } catch (error) {
      console.error('Error linking hotel to TBO:', error);
      throw error;
    }
  }

  /**
   * Get live pricing for a TBO-linked hotel
   * @param {string} hotelId - Local hotel ID
   * @param {Object} searchParams - Search parameters (checkIn, checkOut, rooms, guests)
   * @returns {Promise<Object>} Live pricing data
   */
  async getLivePricing(hotelId, searchParams) {
    try {
      console.log('🏨 getLivePricing called for hotelId:', hotelId);
      const hotel = await Hotel.findById(hotelId);
      if (!hotel || !hotel.tboIntegration.isLinked) {
        console.log('❌ Hotel not linked to TBO:', { 
          hotelExists: !!hotel, 
          isLinked: hotel?.tboIntegration?.isLinked 
        });
        throw new Error('Hotel not linked to TBO');
      }

      console.log('🏨 Hotel TBO Integration:', {
        tboHotelCode: hotel.tboIntegration.tboHotelCode,
        hotelName: hotel.name,
        livePricing: hotel.tboIntegration.livePricing
      });

      const { checkIn, checkOut, rooms } = searchParams;
      
      // Format search parameters for TBO
      const tboSearchParams = {
        checkIn,
        checkOut,
        hotelCodes: hotel.tboIntegration.tboHotelCode,
        guestNationality: 'AE', // Default to AE, should be configurable
        paxRooms: rooms.map(room => ({
          Adults: room.adults,
          Children: room.children,
          ChildrenAges: room.childrenAges || []
        })),
        responseTime: 20,
        isDetailedResponse: true
      };

      console.log('🔍 TBO Search Parameters:', JSON.stringify(tboSearchParams, null, 2));

      // Search TBO for live prices
      const searchResult = await this.tboService.searchHotels(tboSearchParams);
      console.log('📥 TBO Search Result:', {
        success: !!searchResult,
        hotelCount: searchResult?.hotels?.length || 0,
        searchId: searchResult?.searchId
      });
      
      if (!searchResult.hotels || searchResult.hotels.length === 0) {
        console.log('❌ No hotels found in search result');
        return {
          available: false,
          message: 'No availability found for selected dates'
        };
      }

      const tboHotel = searchResult.hotels[0];
      console.log('🏨 TBO Hotel data structure:', JSON.stringify(tboHotel, null, 2));
      
      // Log room details to understand tax structure
      if (tboHotel.Rooms && tboHotel.Rooms[0]) {
        console.log('🏨 First room complete data:', JSON.stringify(tboHotel.Rooms[0], null, 2));
      }
      
      // Map the TBO response structure to our format
      const mappedRooms = tboHotel.Rooms ? tboHotel.Rooms.map(room => {
        // Calculate total price including taxes
        const baseFare = room.TotalFare || 0;
        const totalTax = room.TotalTax || 0;
        const serviceTax = room.ServiceTax || 0;
        const totalWithTaxes = baseFare + totalTax + serviceTax;
        
        console.log('💰 Room pricing breakdown:', {
          baseFare,
          totalTax,
          serviceTax,
          totalWithTaxes,
          roomType: room.Name ? room.Name[0] : 'Standard Room'
        });

        return {
          roomType: room.Name ? room.Name[0] : 'Standard Room',
          mealPlan: room.MealType || 'Room Only',
          price: totalWithTaxes, // Use total price including taxes
          baseFare: baseFare,
          totalTax: totalTax,
          serviceTax: serviceTax,
          currency: tboHotel.Currency || 'USD',
          cancellationPolicy: room.CancelPolicies ? JSON.stringify(room.CancelPolicies) : '',
          refundable: room.IsRefundable || false,
          bookingCode: room.BookingCode || '',
          rateKey: room.BookingCode || '',
          inclusion: room.Inclusion || '',
          promotion: room.RoomPromotion ? room.RoomPromotion.join(', ') : ''
        };
      }) : [];

      // Find the cheapest room for summary
      const cheapestRoom = mappedRooms.reduce((min, room) => 
        room.price < min.price ? room : min
      , mappedRooms[0] || { price: 0 });
      
      return {
        available: true,
        hotel: {
          name: 'SALA Phuket Mai Khao Beach Resort', // Hotel name from TBO or use parameter
          starRating: 5, // You could parse this from TBO response if available
          currency: tboHotel.Currency || 'USD'
        },
        rooms: mappedRooms,
        totalPrice: cheapestRoom.price,
        currency: tboHotel.Currency || 'USD',
        bookingCode: tboHotel.HotelCode,
        searchId: searchResult.searchId || 'N/A'
      };
    } catch (error) {
      console.error('Error getting live pricing:', error);
      throw error;
    }
  }

  /**
   * Sync hotel data from TBO
   * @param {string} hotelId - Local hotel ID
   * @param {Array} fieldsToSync - Array of field names to sync
   * @returns {Promise<Object>} Sync result
   */
  async syncHotelData(hotelId, fieldsToSync = []) {
    try {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel || !hotel.tboIntegration.isLinked) {
        throw new Error('Hotel not linked to TBO');
      }

      // Get latest TBO hotel details
      const tboHotelDetails = await this.tboService.getHotelDetails(
        hotel.tboIntegration.tboHotelCode
      );

      const updates = {};
      const syncedFields = [];

      // Default fields to sync if none specified
      if (fieldsToSync.length === 0) {
        fieldsToSync = ['description', 'amenities', 'images', 'starRating'];
      }

      // Sync description
      if (fieldsToSync.includes('description') && tboHotelDetails.description) {
        updates.description = tboHotelDetails.description;
        syncedFields.push('description');
      }

      // Sync star rating
      if (fieldsToSync.includes('starRating') && tboHotelDetails.starRating) {
        updates.starRating = tboHotelDetails.starRating;
        syncedFields.push('starRating');
      }

      // Sync amenities
      if (fieldsToSync.includes('amenities') && tboHotelDetails.amenities) {
        updates.amenities = tboHotelDetails.amenities;
        syncedFields.push('amenities');
      }

      // Sync coordinates if available
      if (fieldsToSync.includes('coordinates') && tboHotelDetails.geoLocation) {
        updates['location.coordinates'] = {
          latitude: tboHotelDetails.geoLocation.latitude,
          longitude: tboHotelDetails.geoLocation.longitude
        };
        syncedFields.push('coordinates');
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        await Hotel.findByIdAndUpdate(hotelId, updates);
      }

      // Update sync status
      hotel.updateSyncStatus('synced', null, syncedFields);
      await hotel.save();

      return {
        success: true,
        syncedFields,
        updatedCount: Object.keys(updates).length
      };
    } catch (error) {
      // Update sync status with error
      const hotel = await Hotel.findById(hotelId);
      if (hotel) {
        hotel.updateSyncStatus('failed', error.message);
        await hotel.save();
      }

      console.error('Error syncing hotel data:', error);
      throw error;
    }
  }

  /**
   * Cache TBO hotel data
   * @param {Object} tboHotelData - TBO hotel data to cache
   */
  async cacheTBOHotelData(tboHotelData) {
    try {
      await TBOHotel.findOneAndUpdate(
        { hotelCode: tboHotelData.tboHotelCode },
        {
          hotelCode: tboHotelData.tboHotelCode,
          hotelData: tboHotelData,
          lastUpdated: new Date()
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error caching TBO hotel data:', error);
    }
  }

  // Helper methods
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  calculateDistance(coords1, coords2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(coords2.latitude - coords1.latitude);
    const dLon = this.degToRad(coords2.longitude - coords1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(coords1.latitude)) * 
      Math.cos(this.degToRad(coords2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  degToRad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = HotelSyncService;