const express = require('express');
const router = express.Router();
const HotelSyncService = require('../services/hotelSyncService');
const Hotel = require('../models/Hotel');
const rateLimit = require('express-rate-limit');

const hotelSyncService = new HotelSyncService();

// Rate limiting for pricing requests
const pricingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    success: false,
    message: 'Too many pricing requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Get live hotel pricing
 * POST /api/hotel-pricing/:hotelId
 */
router.post('/:hotelId', pricingLimiter, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, rooms, guestNationality = 'AE' } = req.body;

    // Validate required parameters
    if (!checkIn || !checkOut || !rooms || !Array.isArray(rooms)) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date, check-out date, and rooms configuration are required'
      });
    }

    // Validate date format and logic
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Get hotel and check if it supports live pricing
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Hotel is not available'
      });
    }

    // Check if hotel has TBO integration and live pricing enabled
    if (!hotel.tboIntegration.isLinked || !hotel.tboIntegration.livePricing) {
      return res.json({
        success: true,
        data: {
          hotelId,
          hotel: {
            name: hotel.name,
            starRating: hotel.starRating,
            location: hotel.location
          },
          livePricingAvailable: false,
          staticPricing: {
            basePrice: hotel.basePrice,
            currency: hotel.currency,
            roomTypes: hotel.roomTypes.map(room => ({
              name: room.name,
              capacity: room.capacity,
              pricePerNight: room.pricePerNight,
              currency: room.currency,
              amenities: room.amenities
            }))
          },
          message: 'Live pricing not available, showing static rates'
        }
      });
    }

    // Get live pricing from TBO
    const pricingData = await hotelSyncService.getLivePricing(hotelId, {
      checkIn,
      checkOut,
      rooms: rooms.map(room => ({
        adults: room.adults || 2,
        children: room.children || 0,
        childrenAges: room.childrenAges || []
      }))
    });

    res.json({
      success: true,
      data: {
        hotelId,
        hotel: {
          name: hotel.name,
          starRating: hotel.starRating,
          location: hotel.location
        },
        livePricingAvailable: true,
        searchParams: {
          checkIn,
          checkOut,
          rooms,
          guestNationality
        },
        pricing: pricingData
      }
    });

  } catch (error) {
    console.error('Hotel pricing error:', error);
    
    // Return appropriate error response
    if (error.message.includes('not linked to TBO')) {
      return res.status(400).json({
        success: false,
        message: 'Live pricing not available for this hotel'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get hotel pricing. Please try again later.'
    });
  }
});

/**
 * Get multiple hotels pricing (for package bookings)
 * POST /api/hotel-pricing/bulk
 */
router.post('/bulk', pricingLimiter, async (req, res) => {
  try {
    const { hotels, checkIn, checkOut, rooms, guestNationality = 'AE' } = req.body;

    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hotels array is required'
      });
    }

    if (hotels.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 hotels can be priced at once'
      });
    }

    // Validate common parameters
    if (!checkIn || !checkOut || !rooms) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date, check-out date, and rooms are required'
      });
    }

    const results = [];
    const errors = [];

    // Process each hotel
    for (const hotelRequest of hotels) {
      const { hotelId, nights = 1 } = hotelRequest;
      
      try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
          errors.push({ hotelId, error: 'Hotel not found' });
          continue;
        }

        if (!hotel.tboIntegration.isLinked || !hotel.tboIntegration.livePricing) {
          // Return static pricing for non-TBO hotels
          results.push({
            hotelId,
            hotel: {
              name: hotel.name,
              starRating: hotel.starRating
            },
            livePricingAvailable: false,
            staticPricing: {
              totalPrice: hotel.basePrice * nights,
              currency: hotel.currency,
              pricePerNight: hotel.basePrice
            }
          });
          continue;
        }

        // Get live pricing
        const pricingData = await hotelSyncService.getLivePricing(hotelId, {
          checkIn,
          checkOut,
          rooms
        });

        results.push({
          hotelId,
          hotel: {
            name: hotel.name,
            starRating: hotel.starRating
          },
          livePricingAvailable: true,
          pricing: pricingData
        });

      } catch (error) {
        console.error(`Error pricing hotel ${hotelId}:`, error);
        errors.push({ 
          hotelId, 
          error: error.message || 'Failed to get pricing' 
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        totalHotels: hotels.length,
        successCount: results.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk hotel pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bulk hotel pricing'
    });
  }
});

/**
 * Get hotel availability without pricing (faster check)
 * POST /api/hotel-pricing/availability/:hotelId
 */
router.post('/availability/:hotelId', pricingLimiter, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, rooms } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.isActive) {
      return res.json({
        success: true,
        data: {
          hotelId,
          available: false,
          reason: 'Hotel not active'
        }
      });
    }

    // If TBO-linked, check TBO availability
    if (hotel.tboIntegration.isLinked) {
      try {
        const pricingData = await hotelSyncService.getLivePricing(hotelId, {
          checkIn,
          checkOut,
          rooms
        });

        return res.json({
          success: true,
          data: {
            hotelId,
            available: pricingData.available,
            livePricing: true,
            roomsAvailable: pricingData.available ? pricingData.rooms.length : 0
          }
        });
      } catch (error) {
        console.error('TBO availability check failed:', error);
      }
    }

    // Fall back to local availability check
    const roomsNeeded = rooms.reduce((total, room) => total + (room.quantity || 1), 0);
    const availabilityCheck = hotel.checkAvailability(checkIn, checkOut, 'standard', roomsNeeded);

    res.json({
      success: true,
      data: {
        hotelId,
        available: availabilityCheck,
        livePricing: false,
        staticCheck: true
      }
    });

  } catch (error) {
    console.error('Hotel availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check hotel availability'
    });
  }
});

module.exports = router;