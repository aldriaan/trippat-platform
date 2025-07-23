const axios = require('axios');

class CurrencyService {
  constructor() {
    this.exchangeRates = {};
    this.lastUpdated = null;
    this.updateInterval = 3600000; // 1 hour in milliseconds
  }

  async getExchangeRates() {
    try {
      // Using a free API service (you can replace with your preferred service)
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      this.exchangeRates = response.data.rates;
      this.lastUpdated = new Date();
      return this.exchangeRates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback to cached rates or default
      if (!this.exchangeRates.SAR) {
        this.exchangeRates.SAR = 3.75; // Default USD to SAR rate
      }
      return this.exchangeRates;
    }
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Update rates if they're stale
    if (!this.lastUpdated || Date.now() - this.lastUpdated > this.updateInterval) {
      await this.getExchangeRates();
    }

    if (fromCurrency === 'USD') {
      return amount * (this.exchangeRates[toCurrency] || 1);
    } else if (toCurrency === 'USD') {
      return amount / (this.exchangeRates[fromCurrency] || 1);
    } else {
      // Convert through USD
      const usdAmount = amount / (this.exchangeRates[fromCurrency] || 1);
      return usdAmount * (this.exchangeRates[toCurrency] || 1);
    }
  }

  async convertPriceToUserCurrency(price, originalCurrency, userCurrency) {
    if (!userCurrency || originalCurrency === userCurrency) {
      return {
        price: price,
        currency: originalCurrency,
        originalPrice: price,
        originalCurrency: originalCurrency
      };
    }

    const convertedPrice = await this.convertCurrency(price, originalCurrency, userCurrency);
    
    return {
      price: Math.round(convertedPrice * 100) / 100, // Round to 2 decimal places
      currency: userCurrency,
      originalPrice: price,
      originalCurrency: originalCurrency
    };
  }

  formatPrice(price, currency, locale = 'en') {
    // Use custom formatting for SAR to show proper symbol
    if (currency === 'SAR') {
      const formattedNumber = price.toLocaleString('en-US');
      return `ر.س ${formattedNumber}`;
    }
    
    const formatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    };

    // Use appropriate locale for formatting
    const localeMap = {
      'en': 'en-US',
      'ar': 'ar-SA'
    };

    try {
      return new Intl.NumberFormat(localeMap[locale] || 'en-US', formatOptions).format(price);
    } catch (error) {
      // Fallback formatting
      const symbol = currency === 'SAR' ? 'ر.س' : '$';
      return `${symbol} ${price.toLocaleString()}`;
    }
  }

  getSupportedCurrencies() {
    return ['USD', 'SAR'];
  }

  getCurrencySymbol(currency) {
    const symbols = {
      USD: '$',
      SAR: 'ر.س'
    };
    return symbols[currency] || currency;
  }
}

module.exports = new CurrencyService();