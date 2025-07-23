// Fresh token script - Updated token
// Run this in the browser console on the admin dashboard

// Clear any existing tokens
document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Set the fresh admin token
document.cookie = "admin_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzU1NDBmMzBjZjY2YTljNGY4M2VhOSIsImVtYWlsIjoiYWRtaW5AdHJpcHBhdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2OTg4MTksImV4cCI6MTc1Mjc4NTIxOX0.B5bRbbCRgo_spiq3RbybDbyqNT8Wq1a8dNKJdDPTsvg; path=/; secure=false; samesite=strict";

// Reload the page
window.location.reload();

console.log("Fresh admin token set! The pages should now work correctly.");