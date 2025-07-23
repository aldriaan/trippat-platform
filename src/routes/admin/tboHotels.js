const express = require('express');
const router = express.Router();
const HotelSyncService = require('../../services/hotelSyncService');
const Hotel = require('../../models/Hotel');
const { authenticate } = require('../../middleware/auth');

const hotelSyncService = new HotelSyncService();

// Country code mapping for TBO API compatibility
const countryCodeMapping = {
  'UK': 'GB',  // United Kingdom -> Great Britain
  'US': 'US',  // United States (no change needed)
  'AE': 'AE',  // UAE (no change needed)
  'SA': 'SA',  // Saudi Arabia (no change needed)
  'TH': 'TH',  // Thailand (no change needed)
  'TR': 'TR',  // Turkey (no change needed)
  // Add more mappings as needed
};

/**
 * Map country code to TBO-compatible format
 * @param {string} countryCode - Original country code
 * @returns {string} TBO-compatible country code
 */
function mapCountryCodeForTBO(countryCode) {
  const mappedCode = countryCodeMapping[countryCode?.toUpperCase()];
  if (!mappedCode) {
    console.log(`⚠️  Country code mapping not found for '${countryCode}', using as-is`);
    return countryCode;
  }
  
  if (mappedCode !== countryCode) {
    console.log(`🗺️  Mapped country code: ${countryCode} -> ${mappedCode}`);
  }
  
  return mappedCode;
}

/**
 * Search TBO hotels by city
 * GET /api/admin/tbo-hotels/search?city=London&country=AE
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { city, country = 'AE' } = req.query;
    
    // Map country code to TBO-compatible format
    const tboCountryCode = mapCountryCodeForTBO(country);
    console.log(`🔍 TBO hotel search request: city=${city}, country=${country} (mapped to: ${tboCountryCode})`);
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    console.log('🚀 Starting TBO hotel search...');
    const tboHotels = await hotelSyncService.searchTBOHotelsByCity(city, tboCountryCode);
    console.log(`✅ Found ${tboHotels.length} TBO hotels`);
    
    res.json({
      success: true,
      data: {
        hotels: tboHotels,
        count: tboHotels.length,
        searchQuery: { 
          city, 
          originalCountry: country,
          tboCountryCode: tboCountryCode 
        }
      }
    });
  } catch (error) {
    console.error('❌ TBO hotels search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search TBO hotels'
    });
  }
});

/**
 * Find TBO matches for a local hotel
 * GET /api/admin/tbo-hotels/matches/:hotelId
 */
router.get('/matches/:hotelId', authenticate, async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const matches = await hotelSyncService.findTBOMatches(hotel);
    
    res.json({
      success: true,
      data: {
        hotel: {
          id: hotel._id,
          name: hotel.name,
          city: hotel.location.city,
          starRating: hotel.starRating,
          currentTBOLink: hotel.tboIntegration
        },
        matches,
        matchCount: matches.length
      }
    });
  } catch (error) {
    console.error('TBO matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to find TBO matches'
    });
  }
});

/**
 * Link hotel to TBO
 * POST /api/admin/tbo-hotels/link
 */
router.post('/link', authenticate, async (req, res) => {
  try {
    const { hotelId, tboHotelData } = req.body;
    
    if (!hotelId || !tboHotelData) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID and TBO hotel data are required'
      });
    }

    const updatedHotel = await hotelSyncService.linkHotelToTBO(hotelId, tboHotelData);
    
    res.json({
      success: true,
      message: 'Hotel successfully linked to TBO',
      data: {
        hotel: updatedHotel,
        tboIntegration: updatedHotel.tboIntegration
      }
    });
  } catch (error) {
    console.error('TBO link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to link hotel to TBO'
    });
  }
});

/**
 * Unlink hotel from TBO
 * DELETE /api/admin/tbo-hotels/link/:hotelId
 */
router.delete('/link/:hotelId', authenticate, async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Reset TBO integration
    hotel.tboIntegration = {
      isLinked: false,
      syncStatus: 'not_linked',
      livePricing: false,
      autoSync: false
    };

    await hotel.save();
    
    res.json({
      success: true,
      message: 'Hotel unlinked from TBO',
      data: {
        hotel: {
          id: hotel._id,
          name: hotel.name,
          tboIntegration: hotel.tboIntegration
        }
      }
    });
  } catch (error) {
    console.error('TBO unlink error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unlink hotel from TBO'
    });
  }
});

/**
 * Sync hotel data from TBO
 * POST /api/admin/tbo-hotels/sync/:hotelId
 */
router.post('/sync/:hotelId', authenticate, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { fieldsToSync } = req.body;
    
    const syncResult = await hotelSyncService.syncHotelData(hotelId, fieldsToSync);
    
    res.json({
      success: true,
      message: 'Hotel data synced successfully',
      data: syncResult
    });
  } catch (error) {
    console.error('TBO sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync hotel data'
    });
  }
});

/**
 * Get live pricing for TBO hotel
 * POST /api/admin/tbo-hotels/pricing/:hotelId
 */
router.post('/pricing/:hotelId', authenticate, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, rooms } = req.body;
    
    if (!checkIn || !checkOut || !rooms) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date, check-out date, and rooms are required'
      });
    }

    const pricing = await hotelSyncService.getLivePricing(hotelId, {
      checkIn,
      checkOut,
      rooms
    });
    
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('TBO pricing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get live pricing'
    });
  }
});

/**
 * Enable/disable live pricing for hotel
 * PATCH /api/admin/tbo-hotels/live-pricing/:hotelId
 */
router.patch('/live-pricing/:hotelId', authenticate, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { enabled } = req.body;
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.tboIntegration.isLinked) {
      return res.status(400).json({
        success: false,
        message: 'Hotel must be linked to TBO first'
      });
    }

    hotel.tboIntegration.livePricing = enabled;
    await hotel.save();
    
    res.json({
      success: true,
      message: `Live pricing ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        hotelId,
        livePricing: hotel.tboIntegration.livePricing
      }
    });
  } catch (error) {
    console.error('Live pricing toggle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle live pricing'
    });
  }
});

/**
 * Get TBO integration status for all hotels
 * GET /api/admin/tbo-hotels/status
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, syncStatus, livePricing } = req.query;
    
    const filter = {};
    if (syncStatus) {
      filter['tboIntegration.syncStatus'] = syncStatus;
    }
    if (livePricing !== undefined) {
      filter['tboIntegration.livePricing'] = livePricing === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const hotels = await Hotel.find(filter)
      .select('name location.city starRating tboIntegration')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'tboIntegration.lastSyncDate': -1 });
    
    const totalCount = await Hotel.countDocuments(filter);
    
    // Get summary statistics
    const stats = await Hotel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          linked: {
            $sum: {
              $cond: ['$tboIntegration.isLinked', 1, 0]
            }
          },
          livePricing: {
            $sum: {
              $cond: ['$tboIntegration.livePricing', 1, 0]
            }
          },
          synced: {
            $sum: {
              $cond: [{ $eq: ['$tboIntegration.syncStatus', 'synced'] }, 1, 0]
            }
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$tboIntegration.syncStatus', 'failed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNextPage: skip + hotels.length < totalCount,
          hasPrevPage: parseInt(page) > 1
        },
        statistics: stats[0] || {
          total: 0,
          linked: 0,
          livePricing: 0,
          synced: 0,
          failed: 0
        }
      }
    });
  } catch (error) {
    console.error('TBO status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get TBO status'
    });
  }
});

module.exports = router;