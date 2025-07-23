const fetch = require('node-fetch');

const testData = new FormData();
testData.append('title', 'Debug Test Tour');
testData.append('description', 'This is a debug test');
testData.append('priceAdult', '1000');
testData.append('duration', '3');
testData.append('category', 'regular');

fetch('http://localhost:5001/api/packages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzU1NDBmMzBjZjY2YTljNGY4M2VhOSIsImVtYWlsIjoiYWRtaW5AdHJpcHBhdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI5MTA3ODgsImV4cCI6MTc1Mjk5NzE4OH0.9stAhLJujG1vDe1o612X92J1_QJtWxtev9i3f9KDl6c'
  },
  body: testData
})
.then(res => res.text())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));