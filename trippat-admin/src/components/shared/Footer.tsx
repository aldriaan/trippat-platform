'use client';

import React from 'react';
import { Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trippat Admin</h3>
                <p className="text-sm text-gray-600">Travel Platform Management</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Comprehensive admin dashboard for managing your travel platform. 
              Monitor users, packages, bookings, and analytics all in one place.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>admin@trippat.com</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/dashboard/users" className="text-gray-600 hover:text-primary transition-colors">
                  User Management
                </a>
              </li>
              <li>
                <a href="/dashboard/packages" className="text-gray-600 hover:text-primary transition-colors">
                  Package Management
                </a>
              </li>
              <li>
                <a href="/dashboard/bookings" className="text-gray-600 hover:text-primary transition-colors">
                  Booking Management
                </a>
              </li>
              <li>
                <a href="/dashboard/analytics" className="text-gray-600 hover:text-primary transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard/help" className="text-gray-600 hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/dashboard/documentation" className="text-gray-600 hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/dashboard/settings" className="text-gray-600 hover:text-primary transition-colors">
                  Settings
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/trippat/admin" 
                  className="text-gray-600 hover:text-primary transition-colors flex items-center space-x-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="/dashboard/contact" className="text-gray-600 hover:text-primary transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>© {currentYear} Trippat Admin Dashboard. Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for travel management.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="/security" className="hover:text-primary transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;