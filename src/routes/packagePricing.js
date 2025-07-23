const express = require('express');
const router = express.Router();
const PackagePricingService = require('../services/packagePricingService');
const rateLimit = require('express-rate-limit');

const packagePricingService = new PackagePricingService();

// Rate limiting for pricing requests
const pricingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    success: false,
    message: 'Too many pricing requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Get detailed package pricing with live hotel rates
 * POST /api/package-pricing/:packageId/detailed
 */
router.post('/:packageId/detailed', pricingLimiter, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { 
      travelers = { adults: 2, children: 0, infants: 0 },
      dateRange = {},
      currency = 'SAR'
    } = req.body;
    
    console.log('🎯 API call received - packageId:', packageId);
    console.log('🎯 Request body:', { travelers, dateRange, currency });

    // Validate travelers
    if (travelers.adults < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least 1 adult traveler is required'
      });
    }

    // Validate date range for hotel pricing
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      if (startDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be in the past'
        });
      }
    }

    const pricingBreakdown = await packagePricingService.calculatePackagePricing(
      packageId,
      { travelers, dateRange, currency }
    );

    res.json({
      success: true,
      data: pricingBreakdown
    });

  } catch (error) {
    console.error('🚨 Package detailed pricing error:', error);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Error stack:', error.stack);
    
    if (error.message === 'Package not found') {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to calculate package pricing'
    });
  }
});

/**
 * Get quick package pricing estimate
 * POST /api/package-pricing/:packageId/estimate
 */
router.post('/:packageId/estimate', pricingLimiter, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { 
      travelers = { adults: 2, children: 0, infants: 0 },
      currency = 'SAR'
    } = req.body;

    // Validate travelers
    if (travelers.adults < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least 1 adult traveler is required'
      });
    }

    const estimate = await packagePricingService.getQuickPricingEstimate(
      packageId,
      travelers
    );

    res.json({
      success: true,
      data: estimate
    });

  } catch (error) {
    console.error('Package pricing estimate error:', error);
    
    if (error.message === 'Package not found') {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get pricing estimate'
    });
  }
});

/**
 * Update package pricing when travelers change
 * POST /api/package-pricing/:packageId/update-travelers
 */
router.post('/:packageId/update-travelers', pricingLimiter, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { 
      travelers = { adults: 2, children: 0, infants: 0 },
      includeHotels = false,
      dateRange = {},
      currency = 'SAR'
    } = req.body;

    // For quick updates, use estimate unless hotels are explicitly requested
    if (!includeHotels) {
      const estimate = await packagePricingService.getQuickPricingEstimate(
        packageId,
        travelers
      );
      
      return res.json({
        success: true,
        data: {
          ...estimate,
          updateType: 'estimate'
        }
      });
    }

    // Full calculation with hotels
    const pricingBreakdown = await packagePricingService.calculatePackagePricing(
      packageId,
      { travelers, dateRange, currency }
    );

    res.json({
      success: true,
      data: {
        ...pricingBreakdown,
        updateType: 'detailed'
      }
    });

  } catch (error) {
    console.error('Package travelers update error:', error);
    
    if (error.message === 'Package not found') {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update pricing'
    });
  }
});

/**
 * Update package pricing when dates change
 * POST /api/package-pricing/:packageId/update-dates
 */
router.post('/:packageId/update-dates', pricingLimiter, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { 
      dateRange,
      travelers = { adults: 2, children: 0, infants: 0 },
      currency = 'SAR'
    } = req.body;

    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Always get detailed pricing for date changes since hotels are affected
    const pricingBreakdown = await packagePricingService.calculatePackagePricing(
      packageId,
      { travelers, dateRange, currency }
    );

    res.json({
      success: true,
      data: {
        ...pricingBreakdown,
        updateType: 'date_change'
      }
    });

  } catch (error) {
    console.error('Package dates update error:', error);
    
    if (error.message === 'Package not found') {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update pricing for new dates'
    });
  }
});

/**
 * Get hotel pricing breakdown for a specific package
 * POST /api/package-pricing/:packageId/hotels
 */
router.post('/:packageId/hotels', pricingLimiter, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { 
      dateRange,
      travelers = { adults: 2, children: 0, infants: 0 }
    } = req.body;

    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Date range is required for hotel pricing'
      });
    }

    // Get only hotel pricing
    const pricingBreakdown = await packagePricingService.calculatePackagePricing(
      packageId,
      { travelers, dateRange }
    );

    res.json({
      success: true,
      data: {
        packageId,
        hotelPricing: pricingBreakdown.pricing.hotelPricing,
        hotels: pricingBreakdown.hotels,
        errors: pricingBreakdown.errors
      }
    });

  } catch (error) {
    console.error('Package hotel pricing error:', error);
    
    if (error.message === 'Package not found') {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get hotel pricing'
    });
  }
});

/**
 * Compare pricing between different traveler configurations
 * POST /api/package-pricing/:packageId/compare
 */
router.post('/:packageId/compare', pricingLimiter, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { 
      configurations = [],
      dateRange = {},
      currency = 'SAR'
    } = req.body;

    if (!Array.isArray(configurations) || configurations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one traveler configuration is required'
      });
    }

    if (configurations.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 configurations can be compared at once'
      });
    }

    const comparisons = [];

    for (const [index, config] of configurations.entries()) {
      try {
        const travelers = config.travelers || { adults: 2, children: 0, infants: 0 };
        
        // Use estimate for comparison unless dates provided
        let pricing;
        if (dateRange.startDate && dateRange.endDate) {
          pricing = await packagePricingService.calculatePackagePricing(
            packageId,
            { travelers, dateRange, currency }
          );
        } else {
          pricing = await packagePricingService.getQuickPricingEstimate(
            packageId,
            travelers
          );
        }

        comparisons.push({
          configIndex: index,
          travelers,
          pricing: {
            total: pricing.grandTotal || pricing.total,
            perPerson: pricing.pricePerPerson,
            currency: pricing.currency || currency
          }
        });

      } catch (configError) {
        console.error(`Error processing configuration ${index}:`, configError);
        comparisons.push({
          configIndex: index,
          error: configError.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        packageId,
        comparisons,
        recommendedConfig: comparisons.reduce((best, current) => {
          if (current.error || !best) return current.error ? best : current;
          if (best.error) return current;
          return current.pricing.perPerson < best.pricing.perPerson ? current : best;
        }, null)
      }
    });

  } catch (error) {
    console.error('Package pricing comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare package pricing'
    });
  }
});

module.exports = router;