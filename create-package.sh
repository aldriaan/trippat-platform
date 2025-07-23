#!/bin/bash

# Create package with form-data (no file upload)
curl -X POST http://localhost:5001/api/packages \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzU1NDBmMzBjZjY2YTljNGY4M2VhOSIsImVtYWlsIjoiYWRtaW5AdHJpcHBhdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI5MzQzNzUsImV4cCI6MTc1MzAyMDc3NX0.7JGqs7LkaRKbs04k0qorfd0IB3KuQklY126bnBJAsXc" \
  -F "title=Amazing Riyadh Heritage Tour" \
  -F "title_ar=جولة تراثية رائعة في الرياض" \
  -F "description=Explore the rich heritage and culture of Saudi Arabia's capital city" \
  -F "description_ar=اكتشف التراث الغني والثقافة لعاصمة المملكة العربية السعودية" \
  -F "destination=Riyadh, Saudi Arabia" \
  -F "destination_ar=الرياض، المملكة العربية السعودية" \
  -F "duration=3" \
  -F "price=1500" \
  -F "priceAdult=1500" \
  -F "priceChild=750" \
  -F "category=regular" \
  -F "maxTravelers=15" \
  -F "availability=true" \
  -F "tags[]=heritage" \
  -F "tags[]=culture" \
  -F "tags[]=history" \
  -F "tags[]=saudi" \
  -F "inclusions[]=Professional tour guide" \
  -F "inclusions[]=Hotel pickup and drop-off" \
  -F "inclusions[]=Entrance fees to all attractions" \
  -F "inclusions[]=Traditional Saudi lunch" \
  -F "difficulty=easy"