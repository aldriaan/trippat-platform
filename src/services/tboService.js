const axios = require('axios');

class TBOService {
  constructor() {
    this.baseURL = process.env.TBO_BASE_URL || 'http://api.tbotechnology.in/TBOHolidays_HotelAPI';
    this.username = process.env.TBO_USERNAME;
    this.password = process.env.TBO_PASSWORD;
    
    if (!this.username || !this.password) {
      console.warn('⚠️  TBO credentials not found in environment variables');
    }
    
    // Set up axios instance with basic auth
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.username,
        password: this.password
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`📡 TBO API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`📡 TBO Request Data:`, JSON.stringify(config.data, null, 2));
        return config;
      },
      (error) => {
        console.error('❌ TBO Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ TBO API Response: ${response.status} - ${response.config.url}`);
        console.log(`✅ TBO Response Data:`, JSON.stringify(response.data, null, 2));
        return response;
      },
      (error) => {
        console.error('❌ TBO Response Error:', error.response?.data || error.message);
        return Promise.reject(this.handleAPIError(error));
      }
    );
  }

  /**
   * Handle API errors and convert to standard format
   */
  handleAPIError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Map TBO error codes to meaningful messages
      const errorMap = {
        401: 'Invalid TBO credentials',
        400: 'Invalid request parameters',
        404: 'TBO endpoint not found',
        429: 'TBO rate limit exceeded',
        500: 'TBO server error'
      };

      return new Error(errorMap[status] || data?.Description || 'TBO API error');
    }
    
    return new Error(error.message || 'TBO connection error');
  }

  /**
   * Search for hotels
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchHotels(searchParams) {
    try {
      const {
        checkIn,
        checkOut,
        hotelCodes,
        guestNationality = 'AE',
        paxRooms,
        responseTime = 23,
        isDetailedResponse = false,
        filters = {}
      } = searchParams;

      const payload = {
        CheckIn: checkIn, // YYYY-MM-DD format
        CheckOut: checkOut, // YYYY-MM-DD format
        HotelCodes: hotelCodes, // Comma separated hotel codes
        GuestNationality: guestNationality, // ISO country code
        PaxRooms: paxRooms, // Array of room occupancy
        ResponseTime: responseTime,
        IsDetailedResponse: isDetailedResponse,
        Filters: {
          Refundable: filters.refundable || false,
          NoOfRooms: filters.noOfRooms || 0,
          MealType: filters.mealType || "All"
        }
      };

      const response = await this.api.post('/Search', payload);
      return this.formatSearchResponse(response.data);
    } catch (error) {
      console.error('🔥 TBO Search Error:', error);
      throw error;
    }
  }

  /**
   * PreBook - Validate rates and get detailed booking information
   * @param {string} bookingCode - Unique booking code from search
   * @param {string} paymentMode - Payment mode (Limit, SavedCard, NewCard)
   * @returns {Promise<Object>} PreBook results
   */
  async preBook(bookingCode, paymentMode = 'Limit') {
    try {
      const payload = {
        BookingCode: bookingCode,
        PaymentMode: paymentMode
      };

      const response = await this.api.post('/PreBook', payload);
      return this.formatPreBookResponse(response.data);
    } catch (error) {
      console.error('🔥 TBO PreBook Error:', error);
      throw error;
    }
  }

  /**
   * Book - Confirm the hotel booking
   * @param {Object} bookingParams - Booking parameters
   * @returns {Promise<Object>} Booking confirmation
   */
  async bookHotel(bookingParams) {
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
        paymentInfo = null
      } = bookingParams;

      const payload = {
        BookingCode: bookingCode,
        CustomerDetails: customerDetails,
        ClientReferenceId: clientReferenceId,
        BookingReferenceId: bookingReferenceId,
        TotalFare: totalFare,
        EmailId: emailId,
        PhoneNumber: phoneNumber,
        BookingType: bookingType,
        PaymentMode: paymentMode
      };

      // Add payment info if credit card payment
      if (paymentInfo && (paymentMode === 'NewCard' || paymentMode === 'SavedCard')) {
        payload.PaymentInfo = paymentInfo;
      }

      const response = await this.api.post('/Book', payload);
      return this.formatBookingResponse(response.data);
    } catch (error) {
      console.error('🔥 TBO Book Error:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   * @param {string} confirmationNumber - TBO confirmation number
   * @param {string} bookingReferenceId - Client booking reference (optional)
   * @param {string} paymentMode - Payment mode
   * @returns {Promise<Object>} Booking details
   */
  async getBookingDetails(confirmationNumber, bookingReferenceId = null, paymentMode = 'Limit') {
    try {
      const payload = {
        PaymentMode: paymentMode
      };

      if (confirmationNumber) {
        payload.ConfirmationNumber = confirmationNumber;
      } else if (bookingReferenceId) {
        payload.BookingReferenceId = bookingReferenceId;
      } else {
        throw new Error('Either confirmation number or booking reference ID is required');
      }

      const response = await this.api.post('/BookingDetail', payload);
      return this.formatBookingDetailsResponse(response.data);
    } catch (error) {
      console.error('🔥 TBO BookingDetail Error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   * @param {string} confirmationNumber - TBO confirmation number
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelBooking(confirmationNumber) {
    try {
      const payload = {
        ConfirmationNumber: confirmationNumber
      };

      const response = await this.api.post('/Cancel', payload);
      return this.formatCancelResponse(response.data);
    } catch (error) {
      console.error('🔥 TBO Cancel Error:', error);
      throw error;
    }
  }

  /**
   * Get list of countries
   * @returns {Promise<Array>} List of countries
   */
  async getCountryList() {
    try {
      const response = await this.api.get('/CountryList');
      return response.data.CountryList || [];
    } catch (error) {
      console.error('🔥 TBO CountryList Error:', error);
      throw error;
    }
  }

  /**
   * Get cities by country code
   * @param {string} countryCode - Country code (e.g., 'AE')
   * @returns {Promise<Array>} List of cities
   */
  async getCityList(countryCode) {
    try {
      if (!this.username || !this.password) {
        throw new Error('TBO credentials not configured');
      }

      const payload = {
        CountryCode: countryCode
      };

      const response = await this.api.post('/CityList', payload);
      return response.data.CityList || [];
    } catch (error) {
      console.error('🔥 TBO CityList Error:', error);
      throw error;
    }
  }

  /**
   * Get hotel details
   * @param {number} hotelCode - TBO hotel code
   * @param {string} language - Language code (default: 'EN')
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelCode, language = 'EN') {
    try {
      const payload = {
        Hotelcodes: hotelCode,
        Language: language
      };

      const response = await this.api.post('/HotelDetails', payload);
      return response.data.HotelDetails?.[0] || null;
    } catch (error) {
      console.error('🔥 TBO HotelDetails Error:', error);
      throw error;
    }
  }

  /**
   * Get hotels by city code
   * @param {string} cityCode - TBO city code
   * @param {boolean} isDetailedResponse - Get detailed response
   * @returns {Promise<Array>} List of hotels
   */
  async getHotelsByCity(cityCode, isDetailedResponse = false) {
    try {
      if (!this.username || !this.password) {
        throw new Error('TBO credentials not configured');
      }

      const payload = {
        CityCode: cityCode.toString(),
        IsDetailedResponse: isDetailedResponse
      };

      const response = await this.api.post('/TBOHotelCodeList', payload);
      return response.data.Hotels || [];
    } catch (error) {
      console.error('🔥 TBO HotelsByCity Error:', error);
      throw error;
    }
  }

  // Response formatting methods
  formatSearchResponse(data) {
    if (data.Status?.Code !== 200) {
      throw new Error(data.Status?.Description || 'Search failed');
    }
    
    return {
      success: true,
      hotels: data.HotelResult || [],
      status: data.Status
    };
  }

  formatPreBookResponse(data) {
    if (data.Status?.Code !== 200) {
      throw new Error(data.Status?.Description || 'PreBook failed');
    }
    
    return {
      success: true,
      hotelResult: data.HotelResult?.[0] || null,
      status: data.Status
    };
  }

  formatBookingResponse(data) {
    if (data.Status?.Code !== 200) {
      throw new Error(data.Status?.Description || 'Booking failed');
    }
    
    return {
      success: true,
      confirmationNumber: data.ConfirmationNumber,
      clientReferenceId: data.ClientReferenceId,
      status: data.Status
    };
  }

  formatBookingDetailsResponse(data) {
    if (data.Status?.Code !== 200) {
      throw new Error(data.Status?.Description || 'Failed to get booking details');
    }
    
    return {
      success: true,
      bookingDetail: data.BookingDetail,
      status: data.Status
    };
  }

  formatCancelResponse(data) {
    if (data.Status?.Code !== 200) {
      throw new Error(data.Status?.Description || 'Cancellation failed');
    }
    
    return {
      success: true,
      confirmationNumber: data.ConfirmationNumber,
      status: data.Status
    };
  }
}

module.exports = new TBOService();