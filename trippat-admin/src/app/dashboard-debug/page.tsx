'use client';

import React from 'react';

const DebugDashboard: React.FC = () => {
  console.log('Dashboard component rendering...');
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Dashboard</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Component Status</h2>
          <div className="space-y-2">
            <p className="text-green-600">✓ React component loaded</p>
            <p className="text-green-600">✓ Tailwind CSS working</p>
            <p className="text-green-600">✓ Client-side rendering active</p>
            <p className="text-blue-600">Time: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">User Agent</h3>
              <p className="text-sm text-gray-600 break-all">
                {typeof window !== 'undefined' ? navigator.userAgent : 'Server Side'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Current URL</h3>
              <p className="text-sm text-gray-600">
                {typeof window !== 'undefined' ? window.location.href : 'Server Side'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugDashboard;