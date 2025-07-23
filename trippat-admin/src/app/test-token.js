// Temporary script to set auth token for testing
// Run this in the browser console on the admin dashboard

// Set the admin token in cookies
document.cookie = "admin_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzU1NDBmMzBjZjY2YTljNGY4M2VhOSIsImVtYWlsIjoiYWRtaW5AdHJpcHBhdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2OTc2NDgsImV4cCI6MTc1Mjc4NDA0OH0.trg3BB59LIzw8poXHEYGd1JfdY9IkHydwifRy3Wyvx0; path=/; secure=false; samesite=strict";

// Reload the page
window.location.reload();

console.log("Admin token set! The page should now work correctly.");