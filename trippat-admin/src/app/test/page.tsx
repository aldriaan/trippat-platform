'use client';

import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p>This is a simple test page to verify the app is working.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
};

export default TestPage;