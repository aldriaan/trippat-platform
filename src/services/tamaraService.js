const axios = require('axios');

class TamaraService {
  constructor() {
    this.apiToken = process.env.TAMARA_API_TOKEN;
    this.notificationToken = process.env.TAMARA_NOTIFICATION_TOKEN;
    this.publicKey = process.env.TAMARA_PUBLIC_KEY;
    this.baseURL = process.env.TAMARA_SANDBOX === 'true' 
      ? 'https://api-sandbox.tamara.co' 
      : 'https://api.tamara.co';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a Tamara order for payment
   */
  async createOrder(orderData) {
    try {
      console.log('=== TAMARA ORDER CREATION DEBUG ===');
      console.log('Base URL:', this.baseURL);
      console.log('API Token (first 50 chars):', this.apiToken?.substring(0, 50) + '...');
      console.log('Input orderData:', JSON.stringify(orderData, null, 2));
      
      const tamaraOrder = {
        order_reference_id: orderData.orderReferenceId,
        order_number: orderData.orderNumber,
        total_amount: {
          amount: parseFloat(orderData.totalAmount).toFixed(2),
          currency: orderData.currency || 'SAR'
        },
        description: orderData.description,
        country_code: 'SA',
        payment_type: 'PAY_BY_INSTALMENTS',
        instalments: 3,
        locale: orderData.locale || 'en_US',
        items: orderData.items.map(item => ({
          reference_id: item.referenceId.substring(0, 50), // Limit length
          type: item.type || 'Physical',
          name: item.name.substring(0, 255), // Limit name length
          sku: item.sku.substring(0, 50), // Limit SKU length  
          quantity: parseInt(item.quantity),
          unit_price: {
            amount: parseFloat(item.unitPrice).toFixed(2),
            currency: orderData.currency || 'SAR'
          },
          total_amount: {
            amount: parseFloat(item.totalAmount).toFixed(2),
            currency: orderData.currency || 'SAR'
          }
        })),
        consumer: {
          first_name: orderData.consumer.firstName,
          last_name: orderData.consumer.lastName,
          phone_number: orderData.consumer.phoneNumber,
          email: orderData.consumer.email,
          date_of_birth: orderData.consumer.dateOfBirth, // YYYY-MM-DD format
          national_id: orderData.consumer.nationalId || null
        },
        shipping_address: {
          first_name: orderData.consumer.firstName,
          last_name: orderData.consumer.lastName,
          line1: orderData.shippingAddress?.line1 || 'Travel Package',
          city: orderData.shippingAddress?.city || 'Riyadh',
          country_code: 'SA'
        },
        billing_address: {
          first_name: orderData.consumer.firstName,
          last_name: orderData.consumer.lastName,
          line1: orderData.billingAddress?.line1 || 'Travel Package',
          city: orderData.billingAddress?.city || 'Riyadh',
          country_code: 'SA'
        },
        merchant_url: {
          success: orderData.merchantUrls.success,
          failure: orderData.merchantUrls.failure,
          cancel: orderData.merchantUrls.cancel,
          notification: orderData.merchantUrls.notification
        },
        platform: 'web',
        is_mobile: false
      };

      console.log('Tamara order payload:', JSON.stringify(tamaraOrder, null, 2));
      console.log('Request headers:', this.client.defaults.headers);
      
      const response = await this.client.post('/checkout/sessions', tamaraOrder);
      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('=== TAMARA API ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Full Error:', error.message);
      console.error('========================');
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        }
      };
    }
  }

  /**
   * Get order details by order ID
   */
  async getOrder(orderId) {
    try {
      const response = await this.client.get(`/checkout/sessions/${orderId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tamara get order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Authorize payment for an order
   */
  async authorizeOrder(orderId) {
    try {
      const response = await this.client.post(`/orders/${orderId}/authorise`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tamara authorize order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Capture payment for an order
   */
  async captureOrder(orderId, captureAmount = null) {
    try {
      const captureData = captureAmount ? {
        total_amount: {
          amount: captureAmount.amount,
          currency: captureAmount.currency || 'SAR'
        }
      } : {};

      const response = await this.client.post(`/orders/${orderId}/capture`, captureData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tamara capture order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId, cancellationData) {
    try {
      const response = await this.client.post(`/orders/${orderId}/cancel`, {
        total_amount: {
          amount: cancellationData.amount,
          currency: cancellationData.currency || 'SAR'
        },
        comment: cancellationData.comment || 'Order cancelled by merchant'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tamara cancel order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Process refund for an order
   */
  async refundOrder(orderId, refundData) {
    try {
      const response = await this.client.post(`/orders/${orderId}/refund`, {
        total_amount: {
          amount: refundData.amount,
          currency: refundData.currency || 'SAR'
        },
        comment: refundData.comment || 'Refund processed by merchant'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tamara refund order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload, signature) {
    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', this.notificationToken);
      hmac.update(JSON.stringify(payload));
      const calculatedSignature = hmac.digest('hex');
      
      return signature === calculatedSignature;
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Get available installment plans for amount
   */
  async getInstallmentPlans(amount, currency = 'SAR') {
    try {
      const response = await this.client.get(`/checkout/payment-options?amount=${amount}&currency=${currency}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tamara get installment plans error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new TamaraService();