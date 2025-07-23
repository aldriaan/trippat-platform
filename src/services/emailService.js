const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const localizationService = require('./localizationService');
const currencyService = require('./currencyService');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      const templateDir = path.join(__dirname, '../templates/email');
      const templateFiles = await fs.readdir(templateDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.html')) {
          const templateName = file.replace('.html', '');
          const templatePath = path.join(templateDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          this.templates.set(templateName, handlebars.compile(templateContent));
        }
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  async sendBookingConfirmation(bookingData, userLanguage = 'en') {
    try {
      const templateName = `booking-confirmation-${userLanguage}`;
      const template = this.templates.get(templateName);
      
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      // Localize booking data
      const localizedData = await this.localizeBookingData(bookingData, userLanguage);
      
      // Prepare email data
      const emailData = {
        brandName: 'Trippat',
        currentYear: new Date().getFullYear(),
        ...localizedData
      };

      const htmlContent = template(emailData);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@trippat.com',
        to: bookingData.customerEmail,
        subject: this.getSubject('booking-confirmation', userLanguage, bookingData),
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      throw error;
    }
  }

  async sendBookingCancellation(bookingData, userLanguage = 'en') {
    try {
      const templateName = `booking-cancellation-${userLanguage}`;
      const template = this.templates.get(templateName);
      
      if (!template) {
        // Fallback to English if template not found
        const fallbackTemplate = this.templates.get('booking-cancellation-en');
        if (!fallbackTemplate) {
          throw new Error('No booking cancellation template found');
        }
        return this.sendBookingCancellation(bookingData, 'en');
      }

      const localizedData = await this.localizeBookingData(bookingData, userLanguage);
      
      const emailData = {
        brandName: 'Trippat',
        currentYear: new Date().getFullYear(),
        ...localizedData
      };

      const htmlContent = template(emailData);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@trippat.com',
        to: bookingData.customerEmail,
        subject: this.getSubject('booking-cancellation', userLanguage, bookingData),
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking cancellation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending booking cancellation email:', error);
      throw error;
    }
  }

  async sendPasswordReset(userData, resetToken, userLanguage = 'en') {
    try {
      const templateName = `password-reset-${userLanguage}`;
      const template = this.templates.get(templateName);
      
      if (!template) {
        return this.sendPasswordReset(userData, resetToken, 'en');
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const emailData = {
        brandName: 'Trippat',
        currentYear: new Date().getFullYear(),
        customerName: userData.name,
        resetUrl: resetUrl,
        expiryTime: userLanguage === 'ar' ? '24 ساعة' : '24 hours'
      };

      const htmlContent = template(emailData);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@trippat.com',
        to: userData.email,
        subject: this.getSubject('password-reset', userLanguage, userData),
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async localizeBookingData(bookingData, language) {
    const localized = { ...bookingData };
    
    // Localize dates
    if (bookingData.bookingDate) {
      localized.bookingDate = localizationService.formatDate(bookingData.bookingDate, language, 'long');
    }
    
    if (bookingData.startDate) {
      localized.startDate = localizationService.formatDate(bookingData.startDate, language, 'long');
    }
    
    if (bookingData.endDate) {
      localized.endDate = localizationService.formatDate(bookingData.endDate, language, 'long');
    }
    
    // Localize duration
    if (bookingData.duration) {
      localized.duration = localizationService.formatDuration(bookingData.duration, language);
    }
    
    // Localize package details
    if (bookingData.package) {
      localized.packageTitle = localizationService.getLocalizedText({
        en: bookingData.package.title,
        ar: bookingData.package.title_ar
      }, language);
      
      localized.destination = localizationService.getLocalizedText({
        en: bookingData.package.destination,
        ar: bookingData.package.destination_ar
      }, language);
      
      // Localize itinerary
      if (bookingData.package.itinerary) {
        localized.itinerary = bookingData.package.itinerary.map(day => ({
          day: day.day,
          title: localizationService.getLocalizedText({
            en: day.title,
            ar: day.title_ar
          }, language),
          description: localizationService.getLocalizedText({
            en: day.description,
            ar: day.description_ar
          }, language)
        }));
      }
    }
    
    // Localize prices
    if (bookingData.totalPrice) {
      localized.totalPrice = currencyService.formatPrice(
        bookingData.totalPrice, 
        bookingData.currency || 'USD', 
        language
      );
    }
    
    if (bookingData.packagePrice) {
      localized.packagePrice = currencyService.formatPrice(
        bookingData.packagePrice, 
        bookingData.currency || 'USD', 
        language
      );
    }
    
    if (bookingData.taxes) {
      localized.taxes = currencyService.formatPrice(
        bookingData.taxes, 
        bookingData.currency || 'USD', 
        language
      );
    }
    
    if (bookingData.discount) {
      localized.discount = currencyService.formatPrice(
        bookingData.discount, 
        bookingData.currency || 'USD', 
        language
      );
    }
    
    // Localize booking status
    if (bookingData.status) {
      localized.bookingStatus = this.getLocalizedStatus(bookingData.status, language);
    }
    
    // Add support information
    localized.supportPhone = process.env.SUPPORT_PHONE || '+966 12 345 6789';
    localized.supportEmail = process.env.SUPPORT_EMAIL || 'support@trippat.com';
    localized.emergencyPhone = process.env.EMERGENCY_PHONE || '+966 12 345 6789';
    localized.supportHours = language === 'ar' ? 
      'الأحد - الخميس: 9:00 ص - 6:00 م' : 
      'Sunday - Thursday: 9:00 AM - 6:00 PM';
    
    // Add booking URL
    localized.bookingUrl = `${process.env.FRONTEND_URL}/bookings/${bookingData.bookingId}`;
    
    return localized;
  }

  getSubject(type, language, data) {
    const subjects = {
      'booking-confirmation': {
        en: `Booking Confirmation #${data.bookingId} - ${data.packageTitle || 'Your Trip'}`,
        ar: `تأكيد الحجز رقم ${data.bookingId} - ${data.packageTitle || 'رحلتك'}`
      },
      'booking-cancellation': {
        en: `Booking Cancellation #${data.bookingId} - ${data.packageTitle || 'Your Trip'}`,
        ar: `إلغاء الحجز رقم ${data.bookingId} - ${data.packageTitle || 'رحلتك'}`
      },
      'password-reset': {
        en: 'Password Reset Request - Trippat',
        ar: 'طلب إعادة تعيين كلمة المرور - تريبات'
      }
    };
    
    return subjects[type]?.[language] || subjects[type]?.en || 'Notification from Trippat';
  }

  getLocalizedStatus(status, language) {
    const statuses = {
      'pending': {
        en: 'Pending',
        ar: 'قيد الانتظار'
      },
      'confirmed': {
        en: 'Confirmed',
        ar: 'مؤكد'
      },
      'cancelled': {
        en: 'Cancelled',
        ar: 'ملغي'
      },
      'completed': {
        en: 'Completed',
        ar: 'مكتمل'
      }
    };
    
    return statuses[status]?.[language] || statuses[status]?.en || status;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();