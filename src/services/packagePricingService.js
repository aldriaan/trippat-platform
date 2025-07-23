const HotelSyncService = require('./hotelSyncService');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');
const currencyService = require('./currencyService');

class PackagePricingService {
  constructor() {
    this.hotelSyncService = new HotelSyncService();
  }

  /**
   * Convert price from USD to target currency
   * @param {number} price - Price in USD
   * @param {string} targetCurrency - Target currency code
   * @returns {Promise<number>} Converted price
   */
  async convertFromUSD(price, targetCurrency) {
    if (targetCurrency === 'USD') {
      return price;
    }
    
    try {
      const converted = await currencyService.convertCurrency(price, 'USD', targetCurrency);
      console.log(`💱 Currency conversion: $${price} USD = ${targetCurrency} ${converted}`);
      return converted;
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Fallback to default rate for SAR
      if (targetCurrency === 'SAR') {
        return price * 3.75;
      }
      return price;
    }
  }

  /**
   * Calculate complete package pricing including live hotel rates
   * @param {string} packageId - Package ID
   * @param {Object} pricingParams - Pricing parameters
   * @returns {Promise<Object>} Complete pricing breakdown
   */
  async calculatePackagePricing(packageId, pricingParams) {
    const {
      travelers = { adults: 2, children: 0, infants: 0 },
      dateRange = {},
      currency = 'SAR'
    } = pricingParams;

    try {
      // Get package details
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new Error('Package not found');
      }

      const pricingBreakdown = {
        packageId,
        packageName: packageData.title,
        currency,
        dateRange,
        travelers,
        pricing: {
          basePricing: {},
          hotelPricing: {},
          totalPricing: {}
        },
        hotels: [],
        errors: []
      };

      // Calculate base package pricing
      const basePricing = await this.calculateBasePackagePricing(packageData, travelers);
      pricingBreakdown.pricing.basePricing = basePricing;

      // Calculate hotel pricing if package includes hotels
      let totalHotelCost = 0;
      let packageHotels = null;
      
      // Check for hotels in different formats
      if (packageData.hotels && packageData.hotels.length > 0) {
        console.log('📦 Using hotels field format:', packageData.hotels.length, 'hotels');
        packageHotels = packageData.hotels;
      } else if (packageData.hotelPackagesJson && packageData.hotelPackagesJson.length > 0) {
        console.log('📦 Using hotelPackagesJson format:', packageData.hotelPackagesJson.length, 'hotels');
        console.log('📦 hotelPackagesJson data:', JSON.stringify(packageData.hotelPackagesJson, null, 2));
        // Convert hotelPackagesJson format to expected format
        packageHotels = packageData.hotelPackagesJson.map(hotelData => ({
          hotel: hotelData.hotelId,
          nights: hotelData.nights || 1,
          pricePerNight: hotelData.pricePerNight || 0,
          checkInDay: 1 // Default to day 1
        }));
        console.log('📦 Converted packageHotels:', JSON.stringify(packageHotels, null, 2));
      } else {
        console.log('📦 No hotels found in package data');
      }
      
      if (packageHotels && packageHotels.length > 0) {
        const hotelPricing = await this.calculateHotelPricing(
          packageHotels,
          dateRange,
          travelers,
          currency
        );
        
        pricingBreakdown.pricing.hotelPricing = hotelPricing.summary;
        pricingBreakdown.hotels = hotelPricing.details;
        totalHotelCost = hotelPricing.totalCost;
        
        // Add any hotel pricing errors
        if (hotelPricing.errors.length > 0) {
          pricingBreakdown.errors.push(...hotelPricing.errors);
        }
      }

      // Calculate total pricing
      let finalTotal;
      let useHotelPricing = false;
      
      // Check if we have live hotel pricing that should replace base pricing
      const hasLivePricing = pricingBreakdown.hotels.some(hotel => hotel.livePricing);
      
      if (hasLivePricing && totalHotelCost > 0) {
        // Replace package base price with live hotel price
        finalTotal = totalHotelCost;
        useHotelPricing = true;
        console.log('🎯 Using live hotel pricing as final price:', finalTotal);
      } else {
        // Use traditional pricing: base + hotel costs
        const totalPackageCost = basePricing.total;
        finalTotal = totalPackageCost + totalHotelCost;
        console.log('🎯 Using traditional pricing: base + hotel =', finalTotal);
      }

      pricingBreakdown.pricing.totalPricing = {
        packageCost: useHotelPricing ? 0 : basePricing.total,
        hotelCost: totalHotelCost,
        grandTotal: finalTotal,
        currency,
        pricePerPerson: Math.ceil(finalTotal / (travelers.adults + travelers.children + travelers.infants)),
        pricingMode: useHotelPricing ? 'live_hotel' : 'traditional',
        breakdown: {
          adults: useHotelPricing ? { count: basePricing.adults.count, pricePerPerson: 0, total: 0 } : basePricing.adults,
          children: useHotelPricing ? { count: basePricing.children.count, pricePerPerson: 0, total: 0 } : basePricing.children,
          infants: useHotelPricing ? { count: basePricing.infants.count, pricePerPerson: 0, total: 0 } : basePricing.infants,
          hotels: totalHotelCost
        }
      };

      // Apply package-level discounts
      if (packageData.discountType && packageData.discountValue) {
        const discount = this.calculatePackageDiscount(
          pricingBreakdown.pricing.totalPricing,
          packageData.discountType,
          packageData.discountValue
        );
        pricingBreakdown.pricing.totalPricing.discount = discount;
        pricingBreakdown.pricing.totalPricing.finalTotal = finalTotal - discount.amount;
      } else {
        pricingBreakdown.pricing.totalPricing.finalTotal = finalTotal;
      }

      return pricingBreakdown;
    } catch (error) {
      console.error('Error calculating package pricing:', error);
      throw error;
    }
  }

  /**
   * Calculate base package pricing (excluding hotels)
   * @param {Object} packageData - Package data
   * @param {Object} travelers - Traveler counts
   * @returns {Object} Base pricing breakdown
   */
  async calculateBasePackagePricing(packageData, travelers) {
    const { adults, children, infants } = travelers;
    
    // Get pricing per person type
    const adultPrice = packageData.priceAdult || packageData.price || 0;
    const childPrice = packageData.priceChild || (adultPrice * 0.7); // 70% of adult price
    const infantPrice = packageData.priceInfant || (adultPrice * 0.1); // 10% of adult price

    const adultsTotal = adults * adultPrice;
    const childrenTotal = children * childPrice;
    const infantsTotal = infants * infantPrice;
    const total = adultsTotal + childrenTotal + infantsTotal;

    return {
      adults: { count: adults, pricePerPerson: adultPrice, total: adultsTotal },
      children: { count: children, pricePerPerson: childPrice, total: childrenTotal },
      infants: { count: infants, pricePerPerson: infantPrice, total: infantsTotal },
      total,
      currency: packageData.currency || 'SAR'
    };
  }

  /**
   * Calculate hotel pricing for package hotels
   * @param {Array} packageHotels - Hotels linked to package
   * @param {Object} dateRange - Check-in/out dates
   * @param {Object} travelers - Traveler configuration
   * @returns {Promise<Object>} Hotel pricing summary
   */
  async calculateHotelPricing(packageHotels, dateRange, travelers, targetCurrency = 'SAR') {
    const { startDate, endDate } = dateRange;
    const { adults, children } = travelers;
    
    if (!startDate || !endDate) {
      return {
        summary: { message: 'Dates required for hotel pricing' },
        details: [],
        totalCost: 0,
        errors: ['Check-in and check-out dates are required for hotel pricing']
      };
    }

    const hotelResults = [];
    const errors = [];
    let totalCost = 0;

    // Calculate room requirements based on travelers
    const roomsNeeded = this.calculateRoomsNeeded(adults, children);

    for (const packageHotel of packageHotels) {
      try {
        const hotelId = packageHotel.hotel._id || packageHotel.hotel;
        const nights = packageHotel.nights || this.calculateNights(startDate, endDate);
        
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
          errors.push(`Hotel not found: ${hotelId}`);
          continue;
        }

        let hotelPricing;

        // Try to get live pricing if TBO-linked
        if (hotel.tboIntegration?.isLinked && hotel.tboIntegration?.livePricing) {
          console.log('🎯 Attempting live pricing for hotel:', {
            hotelName: hotel.name,
            hotelId,
            tboHotelCode: hotel.tboIntegration.tboHotelCode,
            isLinked: hotel.tboIntegration.isLinked,
            livePricing: hotel.tboIntegration.livePricing
          });
          
          try {
            const liveCheckIn = this.adjustDateForHotel(startDate, packageHotel.checkInDay || 1);
            const liveCheckOut = this.adjustDateForHotel(liveCheckIn, nights);

            console.log('🎯 Live pricing dates:', {
              liveCheckIn,
              liveCheckOut,
              nights,
              roomsNeeded
            });

            const livePricing = await this.hotelSyncService.getLivePricing(hotelId, {
              checkIn: liveCheckIn,
              checkOut: liveCheckOut,
              rooms: roomsNeeded
            });

            if (livePricing.available) {
              // TBO returns TotalFare which is already the total price for the entire stay
              const roomTotalPriceUSD = livePricing.rooms[0]?.price || 0;
              const totalPriceUSD = roomTotalPriceUSD * roomsNeeded.length;
              
              // Convert from USD to target currency if needed
              let finalPrice = totalPriceUSD;
              let displayCurrency = livePricing.currency || 'USD';
              
              if (targetCurrency !== 'USD' && livePricing.currency === 'USD') {
                finalPrice = await this.convertFromUSD(totalPriceUSD, targetCurrency);
                displayCurrency = targetCurrency;
                console.log(`💱 Hotel price converted: $${totalPriceUSD} USD = ${targetCurrency} ${finalPrice}`);
              }
              
              const pricePerNight = finalPrice / nights / roomsNeeded.length;
              
              hotelPricing = {
                hotelId,
                hotelName: hotel.name,
                nights,
                livePricing: true,
                available: true,
                pricePerNight: pricePerNight,
                totalPrice: finalPrice,
                currency: displayCurrency,
                originalCurrency: livePricing.currency,
                originalPrice: totalPriceUSD,
                roomDetails: {
                  ...livePricing.rooms[0],
                  price: finalPrice / roomsNeeded.length // Convert room price too
                },
                dates: { checkIn: liveCheckIn, checkOut: liveCheckOut }
              };
              totalCost += finalPrice;
            } else {
              throw new Error('No availability from live pricing');
            }
          } catch (liveError) {
            console.warn(`Live pricing failed for hotel ${hotelId}, falling back to static pricing:`, liveError.message);
            // Fall through to static pricing
          }
        }

        // Use static pricing if live pricing failed or not available
        if (!hotelPricing) {
          const staticPrice = packageHotel.pricePerNight || hotel.basePrice || 0;
          const totalRooms = roomsNeeded.length;
          const roomTotal = staticPrice * nights * totalRooms;

          hotelPricing = {
            hotelId,
            hotelName: hotel.name,
            nights,
            livePricing: false,
            available: true,
            pricePerNight: staticPrice,
            totalPrice: roomTotal,
            currency: hotel.currency || 'SAR',
            roomsCount: totalRooms,
            dates: { 
              checkIn: this.adjustDateForHotel(startDate, packageHotel.checkInDay || 1),
              checkOut: this.adjustDateForHotel(startDate, (packageHotel.checkInDay || 1) + nights - 1)
            }
          };
          totalCost += roomTotal;
        }

        hotelResults.push(hotelPricing);

      } catch (error) {
        console.error(`Error pricing hotel ${packageHotel.hotel}:`, error);
        errors.push(`Failed to price hotel: ${error.message}`);
      }
    }

    const summary = {
      totalHotels: packageHotels.length,
      pricedHotels: hotelResults.length,
      totalCost,
      averagePricePerNight: hotelResults.length > 0 
        ? Math.round(totalCost / hotelResults.reduce((sum, h) => sum + h.nights, 0))
        : 0,
      livePricingCount: hotelResults.filter(h => h.livePricing).length,
      staticPricingCount: hotelResults.filter(h => !h.livePricing).length
    };

    return {
      summary,
      details: hotelResults,
      totalCost,
      errors
    };
  }

  /**
   * Calculate package discount
   * @param {Object} totalPricing - Total pricing object
   * @param {string} discountType - 'percentage' or 'fixed'
   * @param {number} discountValue - Discount value
   * @returns {Object} Discount information
   */
  calculatePackageDiscount(totalPricing, discountType, discountValue) {
    const { grandTotal } = totalPricing;
    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = Math.round(grandTotal * (discountValue / 100));
    } else if (discountType === 'fixed') {
      discountAmount = Math.min(discountValue, grandTotal); // Don't exceed total
    }

    return {
      type: discountType,
      value: discountValue,
      amount: discountAmount,
      percentage: Math.round((discountAmount / grandTotal) * 100)
    };
  }

  /**
   * Get quick pricing estimate without detailed hotel calculations
   * @param {string} packageId - Package ID
   * @param {Object} travelers - Traveler counts
   * @returns {Promise<Object>} Quick pricing estimate
   */
  async getQuickPricingEstimate(packageId, travelers) {
    try {
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new Error('Package not found');
      }

      const basePricing = await this.calculateBasePackagePricing(packageData, travelers);
      
      // Estimate hotel costs based on package data
      let estimatedHotelCost = 0;
      if (packageData.hotels && packageData.hotels.length > 0) {
        // Use average hotel price from package or default estimate
        const avgHotelPrice = packageData.averageHotelPrice || 200; // Default SAR 200 per night
        const totalNights = packageData.totalHotelNights || packageData.duration;
        const roomsNeeded = this.calculateRoomsNeeded(travelers.adults, travelers.children);
        estimatedHotelCost = avgHotelPrice * totalNights * roomsNeeded.length;
      }

      const grandTotal = basePricing.total + estimatedHotelCost;

      return {
        packageId,
        estimate: true,
        baseCost: basePricing.total,
        estimatedHotelCost,
        grandTotal,
        currency: packageData.currency || 'SAR'
      };
    } catch (error) {
      console.error('Error getting quick pricing estimate:', error);
      throw error;
    }
  }

  // Helper methods
  calculateNights(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateRoomsNeeded(adults, children) {
    const totalGuests = adults + children;
    const roomsNeeded = [];
    
    // Assume maximum 2 adults per room, distribute guests optimally
    let remainingAdults = adults;
    let remainingChildren = children;
    
    while (remainingAdults > 0 || remainingChildren > 0) {
      const room = {
        adults: Math.min(2, remainingAdults),
        children: Math.min(2, remainingChildren) // Max 2 children per room
      };
      
      roomsNeeded.push(room);
      remainingAdults -= room.adults;
      remainingChildren -= room.children;
    }
    
    return roomsNeeded;
  }

  adjustDateForHotel(packageStartDate, dayOffset) {
    const date = new Date(packageStartDate);
    date.setDate(date.getDate() + dayOffset - 1); // dayOffset is 1-based
    return date.toISOString().split('T')[0];
  }
}

module.exports = PackagePricingService;