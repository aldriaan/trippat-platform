const express = require('express');
const router = express.Router();
const tboService = require('../services/tboService');
const { TBOHotel, TBOSearchResult, TBOBooking, TBOLocation } = require('../models/TBOHotel');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/tbo/search
 * @desc    Search for hotels using TBO API
 * @access  Public
 */
router.post('/search', async (req, res) => {
  try {
    const {
      checkIn,
      checkOut,
      cityCode,
      hotelCodes,
      guestNationality = 'AE',
      paxRooms,
      responseTime = 23,
      isDetailedResponse = false,
      filters = {}
    } = req.body;

    // Validate required fields
    if (!checkIn || !checkOut || (!cityCode && !hotelCodes)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: checkIn, checkOut, and either cityCode or hotelCodes'
      });
    }

    // Validate date format and logic
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Generate cache key for search
    const searchParams = {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      hotelCodes: hotelCodes || '',
      guestNationality,
      paxRooms: paxRooms || [{ adults: 2, children: 0, childAges: [] }]
    };

    const searchKey = TBOSearchResult.generateSearchKey(searchParams);

    // Check cache first
    let cachedResult = await TBOSearchResult.findOne({ searchKey });
    
    if (cachedResult && !cachedResult.isExpired()) {
      console.log('📋 Returning cached TBO search results');
      await cachedResult.incrementSearchCount();
      
      return res.json({
        success: true,
        data: cachedResult.hotelResults,
        meta: {
          cached: true,
          searchCount: cachedResult.searchCount,
          traceId: cachedResult.traceId
        }
      });
    }

    // If searching by city, get hotel codes first
    let finalHotelCodes = hotelCodes;
    if (cityCode && !hotelCodes) {
      try {
        const cityHotels = await tboService.getHotelsByCity(cityCode, false);
        if (cityHotels && cityHotels.length > 0) {
          finalHotelCodes = cityHotels.map(hotel => hotel.HotelCode).join(',');
        } else {
          return res.status(404).json({
            success: false,
            message: 'No hotels found for the specified city'
          });
        }
      } catch (error) {
        console.error('Error fetching hotels by city:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch hotels for city'
        });
      }
    }

    // Search using TBO API
    const searchResult = await tboService.searchHotels({
      checkIn,
      checkOut,
      hotelCodes: finalHotelCodes,
      guestNationality,
      paxRooms: paxRooms || [{ adults: 2, children: 0, childAges: [] }],
      responseTime,
      isDetailedResponse,
      filters
    });

    if (!searchResult.success) {
      return res.status(500).json({
        success: false,
        message: 'TBO search failed',
        error: searchResult.error
      });
    }

    // Cache the results
    const newCacheEntry = new TBOSearchResult({
      searchKey,
      searchParams,
      traceId: searchResult.traceId,
      hotelResults: searchResult.hotels
    });

    await newCacheEntry.save();

    // Update hotel cache if detailed response
    if (isDetailedResponse && searchResult.hotels) {
      const hotelUpdates = searchResult.hotels.map(async (hotel) => {
        const existingHotel = await TBOHotel.findOne({ tboHotelCode: hotel.hotelCode });
        
        if (existingHotel) {
          if (existingHotel.isExpired()) {
            return existingHotel.updateCache({
              hotelName: hotel.hotelName,
              starRating: hotel.starRating,
              location: hotel.location,
              facilities: hotel.facilities,
              images: hotel.images
            });
          }
        } else {
          const newHotel = new TBOHotel({
            tboHotelCode: hotel.hotelCode,
            hotelName: hotel.hotelName,
            starRating: hotel.starRating,
            location: hotel.location,
            facilities: hotel.facilities,
            images: hotel.images
          });
          return newHotel.save();
        }
      });

      await Promise.allSettled(hotelUpdates);
    }

    res.json({
      success: true,
      data: searchResult.hotels,
      meta: {
        cached: false,
        traceId: searchResult.traceId,
        totalResults: searchResult.hotels?.length || 0
      }
    });

  } catch (error) {
    console.error('🔥 TBO Search Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during hotel search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/tbo/prebook
 * @desc    PreBook hotel rates (validate availability and get final prices)
 * @access  Private
 */
router.post('/prebook', authenticate, async (req, res) => {
  try {
    const { bookingCode, paymentMode = 'Limit' } = req.body;

    if (!bookingCode) {
      return res.status(400).json({
        success: false,
        message: 'Booking code is required'
      });
    }

    const preBookResult = await tboService.preBook(bookingCode, paymentMode);

    res.json({
      success: true,
      data: preBookResult.hotelResult,
      meta: {
        status: preBookResult.status
      }
    });

  } catch (error) {
    console.error('🔥 TBO PreBook Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pre-book hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/tbo/book
 * @desc    Confirm hotel booking
 * @access  Private
 */
router.post('/book', authenticate, async (req, res) => {
  try {
    const {
      bookingCode,
      customerDetails,
      clientReferenceId,
      bookingReferenceId,
      totalFare,
      emailId,
      phoneNumber,
      bookingType = 'Voucher',
      paymentMode = 'Limit',
      paymentInfo = null,
      trippatBookingId
    } = req.body;

    // Validate required fields
    if (!bookingCode || !customerDetails || !clientReferenceId || !totalFare || !emailId || !trippatBookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields'
      });
    }

    const bookingResult = await tboService.bookHotel({
      bookingCode,
      customerDetails,
      clientReferenceId,
      bookingReferenceId,
      totalFare,
      emailId,
      phoneNumber,
      bookingType,
      paymentMode,
      paymentInfo
    });

    // Save TBO booking record
    const tboBooking = new TBOBooking({
      trippatBookingId,
      tboConfirmationNumber: bookingResult.confirmationNumber,
      tboBookingId: bookingResult.clientReferenceId,
      guests: customerDetails.guests || [],
      bookingDetails: {
        totalAmount: totalFare,
        paymentMode
      },
      status: 'Confirmed',
      tboStatus: bookingResult.status,
      payment: {
        paymentMode,
        paymentStatus: 'Completed',
        paymentDate: new Date()
      }
    });

    await tboBooking.save();

    res.json({
      success: true,
      data: {
        confirmationNumber: bookingResult.confirmationNumber,
        tboBookingId: tboBooking._id
      },
      meta: {
        status: bookingResult.status
      }
    });

  } catch (error) {
    console.error('🔥 TBO Book Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm hotel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/tbo/booking/:confirmationNumber
 * @desc    Get booking details by confirmation number
 * @access  Private
 */
router.get('/booking/:confirmationNumber', authenticate, async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    
    const bookingDetails = await tboService.getBookingDetails(confirmationNumber);
    
    res.json({
      success: true,
      data: bookingDetails.bookingDetail,
      meta: {
        status: bookingDetails.status
      }
    });

  } catch (error) {
    console.error('🔥 TBO Booking Details Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/tbo/cancel
 * @desc    Cancel hotel booking
 * @access  Private
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { confirmationNumber } = req.body;

    if (!confirmationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Confirmation number is required'
      });
    }

    const cancelResult = await tboService.cancelBooking(confirmationNumber);

    // Update TBO booking record
    await TBOBooking.findOneAndUpdate(
      { tboConfirmationNumber: confirmationNumber },
      {
        status: 'Cancelled',
        'cancellation.cancellationNumber': cancelResult.confirmationNumber,
        'cancellation.cancellationDate': new Date()
      }
    );

    res.json({
      success: true,
      data: {
        confirmationNumber: cancelResult.confirmationNumber
      },
      meta: {
        status: cancelResult.status
      }
    });

  } catch (error) {
    console.error('🔥 TBO Cancel Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/tbo/locations/countries
 * @desc    Get list of countries from TBO
 * @access  Public
 */
router.get('/locations/countries', async (req, res) => {
  try {
    const countries = await tboService.getCountryList();
    
    res.json({
      success: true,
      data: countries
    });

  } catch (error) {
    console.error('🔥 TBO Countries Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/tbo/locations/cities/:countryCode
 * @desc    Get cities by country code from TBO
 * @access  Public
 */
router.get('/locations/cities/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    const cities = await tboService.getCityList(countryCode);
    
    res.json({
      success: true,
      data: cities
    });

  } catch (error) {
    console.error('🔥 TBO Cities Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/tbo/hotels/:hotelCode
 * @desc    Get hotel details by hotel code
 * @access  Public
 */
router.get('/hotels/:hotelCode', async (req, res) => {
  try {
    const { hotelCode } = req.params;
    const { language = 'EN' } = req.query;
    
    // Check cache first
    let hotel = await TBOHotel.findOne({ tboHotelCode: hotelCode });
    
    if (hotel && !hotel.isExpired()) {
      return res.json({
        success: true,
        data: hotel,
        meta: { cached: true }
      });
    }

    // Fetch from TBO API
    const hotelDetails = await tboService.getHotelDetails(hotelCode, language);
    
    if (!hotelDetails) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Update cache
    if (hotel) {
      await hotel.updateCache(hotelDetails);
    } else {
      hotel = new TBOHotel({
        tboHotelCode: hotelCode,
        ...hotelDetails
      });
      await hotel.save();
    }
    
    res.json({
      success: true,
      data: hotelDetails,
      meta: { cached: false }
    });

  } catch (error) {
    console.error('🔥 TBO Hotel Details Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/tbo/hotels/city/:cityCode
 * @desc    Get hotels by city code
 * @access  Public
 */
router.get('/hotels/city/:cityCode', async (req, res) => {
  try {
    const { cityCode } = req.params;
    const { detailed = false } = req.query;
    
    const hotels = await tboService.getHotelsByCity(cityCode, detailed === 'true');
    
    res.json({
      success: true,
      data: hotels
    });

  } catch (error) {
    console.error('🔥 TBO Hotels by City Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels by city',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/tbo/cache/clean
 * @desc    Clean expired cache entries (Admin only)
 * @access  Private/Admin
 */
router.delete('/cache/clean', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const [searchResults, hotelResults] = await Promise.all([
      TBOSearchResult.cleanExpiredCache(),
      TBOHotel.cleanExpiredCache()
    ]);

    res.json({
      success: true,
      data: {
        deletedSearchResults: searchResults.deletedCount,
        deletedHotels: hotelResults.deletedCount
      }
    });

  } catch (error) {
    console.error('🔥 Cache Clean Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean cache',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;