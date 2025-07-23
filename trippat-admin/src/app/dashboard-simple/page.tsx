'use client';

import React from 'react';

const SimpleDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Dashboard Test</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Server Status</h2>
          <p className="text-green-600">✓ Server is running correctly</p>
          <p className="text-green-600">✓ Page is rendering</p>
          <p className="text-blue-600">Current time: {new Date().toISOString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Card 1</h3>
            <p className="text-gray-600">This is a simple test card</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Card 2</h3>
            <p className="text-gray-600">Another test card</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Card 3</h3>
            <p className="text-gray-600">Third test card</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;