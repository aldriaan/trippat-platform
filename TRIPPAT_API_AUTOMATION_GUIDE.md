# Trippat Backend API - Complete Automation Guide

> **Purpose**: This guide provides detailed API specifications for automating content creation in the Trippat travel platform using Claude Desktop, Zapier, or other automation tools.

## 🔗 API Base Information

### Base URLs
- **AWS Production**: `http://3.72.21.168:5001/api`
- **Local Development**: `http://localhost:5001/api`

### Authentication
- **Method**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Required for**: All CREATE, UPDATE, DELETE operations

### Getting Authentication Token
```bash
# Login to get JWT token
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@trippat.com",
  "password": "your_admin_password"
}

# Response includes token:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

## 📦 1. PACKAGES (Travel Packages)

### Create Package
**Endpoint**: `POST /api/packages`
**Authentication**: Required (admin or expert role)

#### Complete Request Example
```json
{
  "title": "Luxury Desert Safari Dubai",
  "title_ar": "رحلة سفاري صحراوية فاخرة في دبي",
  "description": "Experience the ultimate desert adventure with luxury transportation, professional guides, camel riding, sandboarding, and traditional Emirati dinner under the stars.",
  "description_ar": "اختبر المغامرة الصحراوية المثلى مع النقل الفاخر والمرشدين المحترفين وركوب الجمال والتزلج على الرمال والعشاء الإماراتي التقليدي تحت النجوم",
  "destination": "Dubai, UAE",
  "destination_ar": "دبي، الإمارات العربية المتحدة",
  "mainDestination": "Dubai",
  "duration": 6,
  "priceAdult": 450,
  "priceChild": 350,
  "priceInfant": 0,
  "currency": "SAR",
  "discountType": "percentage",
  "discountValue": 10,
  "minPeople": 2,
  "maxPeople": 20,
  "category": ["adventure", "luxury"],
  "tourType": "guided",
  "typeTour": "day_trip",
  "difficulty": "easy",
  "packageType": "group",
  "dateType": "flexible",
  "cancellationPolicy": "moderate",
  "highlights": [
    "4x4 dune bashing adventure",
    "Professional camel riding experience", 
    "Traditional henna painting",
    "Arabic coffee and dates welcome",
    "BBQ dinner with live entertainment",
    "Star gazing in the desert"
  ],
  "highlights_ar": [
    "مغامرة قيادة الكثبان الرملية بالدفع الرباعي",
    "تجربة ركوب الجمال المهنية",
    "رسم الحناء التقليدي",
    "ترحيب بالقهوة العربية والتمر",
    "عشاء شواء مع الترفيه المباشر",
    "مراقبة النجوم في الصحراء"
  ],
  "inclusions": [
    "Hotel pickup and drop-off in Dubai",
    "4x4 vehicle transportation",
    "Professional English/Arabic speaking guide",
    "Camel riding (15 minutes)",
    "Sandboarding equipment",
    "Traditional BBQ dinner",
    "Unlimited soft drinks and water",
    "Live entertainment shows",
    "Henna painting for ladies"
  ],
  "inclusions_ar": [
    "الاستقبال والتوصيل من الفندق في دبي",
    "النقل بمركبة الدفع الرباعي",
    "مرشد محترف يتحدث الإنجليزية/العربية",
    "ركوب الجمال (15 دقيقة)",
    "معدات التزلج على الرمال",
    "عشاء الشواء التقليدي",
    "المشروبات الغازية والماء غير المحدود",
    "عروض الترفيه المباشر",
    "رسم الحناء للسيدات"
  ],
  "exclusions": [
    "Alcoholic beverages",
    "Quad biking (available for additional cost)",
    "Professional photography",
    "Personal expenses and souvenirs",
    "Travel insurance",
    "Gratuities"
  ],
  "exclusions_ar": [
    "المشروبات الكحولية",
    "ركوب الدراجات الرباعية (متاح بتكلفة إضافية)",
    "التصوير المهني",
    "النفقات الشخصية والهدايا التذكارية",
    "تأمين السفر",
    "الإكراميات"
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Desert Safari Adventure",
      "title_ar": "مغامرة رحلة السفاري الصحراوية",
      "description": "Full evening desert experience with multiple activities and dinner",
      "description_ar": "تجربة صحراوية مسائية كاملة مع أنشطة متعددة وعشاء",
      "activities": [
        "15:00 - Hotel pickup",
        "16:00 - Arrive at desert camp",
        "16:30 - Dune bashing adventure",
        "17:30 - Camel riding & sandboarding",
        "18:30 - Traditional activities & henna",
        "19:30 - BBQ dinner & entertainment",
        "21:00 - Return to hotel"
      ],
      "activities_ar": [
        "15:00 - الاستقبال من الفندق",
        "16:00 - الوصول إلى المخيم الصحراوي",
        "16:30 - مغامرة قيادة الكثبان الرملية",
        "17:30 - ركوب الجمال والتزلج على الرمال",
        "18:30 - الأنشطة التقليدية والحناء",
        "19:30 - عشاء الشواء والترفيه",
        "21:00 - العودة إلى الفندق"
      ]
    }
  ],
  "meetingPoint": "Hotel lobby pickup (Dubai hotels only)",
  "meetingPoint_ar": "الاستقبال من لوبي الفندق (فنادق دبي فقط)",
  "whatToBring": [
    "Comfortable clothing and closed shoes",
    "Sunscreen and sunglasses", 
    "Camera for memories",
    "Light jacket for evening"
  ],
  "whatToBring_ar": [
    "ملابس مريحة وأحذية مغلقة",
    "واقي الشمس والنظارات الشمسية",
    "كاميرا للذكريات",
    "سترة خفيفة للمساء"
  ],
  "importantNotes": [
    "Not suitable for pregnant women",
    "Heart conditions should consult doctor",
    "Minimum age 3 years for camel riding",
    "Dress code: Conservative clothing recommended"
  ],
  "importantNotes_ar": [
    "غير مناسب للنساء الحوامل",
    "حالات القلب يجب استشارة الطبيب",
    "العمر الأدنى 3 سنوات لركوب الجمال",
    "قواعد اللباس: يُنصح بالملابس المحافظة"
  ],
  "tags": ["desert", "safari", "dubai", "adventure", "camel", "dinner", "entertainment"],
  "seoKeywords": ["desert safari dubai", "camel riding", "dune bashing", "arabic dinner"],
  "seoKeywords_ar": ["رحلة سفاري صحراوية دبي", "ركوب الجمال", "قيادة الكثبان", "عشاء عربي"],
  "metaDescription": "Experience the ultimate Dubai desert safari with camel riding, dune bashing, and traditional dinner. Book your luxury desert adventure today!",
  "metaDescription_ar": "اختبر رحلة السفاري الصحراوية المثلى في دبي مع ركوب الجمال وقيادة الكثبان والعشاء التقليدي. احجز مغامرتك الصحراوية الفاخرة اليوم!",
  "hotelPackagesJson": [
    {
      "hotelId": "64f8a1b2c3d4e5f6789012ab",
      "name": "Desert Rose Resort",
      "name_ar": "منتجع روز الصحراء",
      "city": "Dubai",
      "starRating": 5,
      "image": "/uploads/hotels/desert-rose-resort.jpg",
      "checkInDay": 1,
      "checkOutDay": 2,
      "nights": 1,
      "roomType": "Desert Villa",
      "roomType_ar": "فيلا صحراوية",
      "pricePerNight": 800,
      "currency": "SAR",
      "mealPlan": "breakfast",
      "mealPlanPrice": 120,
      "roomPreferences": {
        "bedType": "king",
        "view": "desert",
        "smokingAllowed": false
      }
    }
  ],
  "hotelPackagesSummary": "1 night at Desert Rose Resort with breakfast included",
  "hotelPackagesSummary_ar": "ليلة واحدة في منتجع روز الصحراء مع الإفطار",
  "numberOfHotels": 1,
  "totalHotelNights": 1,
  "tourStatus": "published",
  "bookingStatus": "active",
  "isAvailable": true,
  "isFeatured": true,
  "requiresApproval": false,
  "paymentRequired": true,
  "instantBooking": true
}
```

#### Required Fields Only (Minimum viable package)
```json
{
  "title": "Package Title",
  "description": "Package description with at least 10 characters",
  "destination": "City, Country",
  "duration": 1,
  "priceAdult": 100,
  "category": ["regular"],
  "tourStatus": "published",
  "availability": true
}
```

#### Valid Categories
```javascript
["adventure", "luxury", "family", "cultural", "nature", "business", "wellness", "food", "photography", "budget", "religious", "educational", "sports", "cruise", "safari", "regular", "group"]
```

#### Valid Tour Types
```javascript
["guided", "self_guided", "private", "group"]
```

#### Valid Tour Sub-Types
```javascript
["day_trip", "multi_day", "half_day", "full_day", "overnight", "extended"]
```

### **IMPORTANT: Hotel Integration in Packages**

When creating packages, hotels must be selected from existing hotels in the database and integrated using the `hotelPackagesJson` field:

#### Hotel Package Structure
```json
"hotelPackagesJson": [
  {
    "hotelId": "existing_hotel_id_from_database",
    "name": "Hotel Name (from hotel record)",
    "name_ar": "اسم الفندق (من سجل الفندق)",
    "city": "City (from hotel record)", 
    "starRating": 5,
    "image": "/path/to/hotel/image",
    "checkInDay": 1,        // Day of package itinerary
    "checkOutDay": 3,       // Check-out day
    "nights": 2,            // Calculated nights
    "roomType": "Deluxe Room",
    "roomType_ar": "غرفة فاخرة",
    "pricePerNight": 400,
    "currency": "SAR",
    "mealPlan": "breakfast", // room_only, breakfast, half_board, full_board
    "mealPlanPrice": 80,
    "roomPreferences": {
      "bedType": "king",     // king, queen, twin, single
      "view": "sea",         // sea, city, garden, mountain
      "smokingAllowed": false,
      "accessibility": false
    },
    "specialRequests": "Late check-in required"
  }
]
```

#### Additional Hotel-Related Package Fields
```json
{
  "hotelPackagesSummary": "2 nights at Ritz Carlton with breakfast included",
  "hotelPackagesSummary_ar": "ليلتان في فندق ريتز كارلتون مع الإفطار",
  "numberOfHotels": 1,
  "totalHotelNights": 2
}
```

---

## 📋 GETTING AVAILABLE OPTIONS FOR DROPDOWNS

### **CRITICAL**: Hotels, Categories, and Destinations Must Be Selected from Existing Data

Before creating packages, you must retrieve available options for:

#### Get Available Hotels
```bash
# Get all active hotels
GET /api/hotels?status=active&limit=100

# Get hotels by city
GET /api/hotels?city=Dubai&status=active

# Get hotels by star rating
GET /api/hotels?starRating=5&status=active

# Search hotels by name
GET /api/hotels/search?q=Ritz&city=Dubai
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "_id": "64f8a1b2c3d4e5f6789012ab",
        "name": "Ritz Carlton Dubai",
        "name_ar": "فندق ريتز كارلتون دبي",
        "location": {
          "city": "Dubai",
          "city_ar": "دبي"
        },
        "starRating": 5,
        "basePrice": 800,
        "currency": "SAR",
        "roomTypes": [
          {
            "name": "Deluxe Room",
            "name_ar": "غرفة فاخرة",
            "pricePerNight": 800
          }
        ]
      }
    ]
  }
}
```

#### Get Available Categories
```bash
# Get all active categories
GET /api/categories?status=active

# Get categories with package counts
GET /api/categories?includePackageCount=true
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6789012cd",
      "name": {
        "en": "Adventure Tours",
        "ar": "جولات المغامرة"
      },
      "packageCategory": "adventure",
      "slug": "adventure-tours",
      "status": "active"
    }
  ]
}
```

#### Get Available Destinations/Cities
```bash
# Get all cities for package selection
GET /api/destinations/cities

# Get destinations by country
GET /api/destinations?country=UAE&isActive=true

# Get popular destinations
GET /api/destinations?isPopular=true
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6789012ef",
      "country": {
        "en": "United Arab Emirates",
        "ar": "الإمارات العربية المتحدة"
      },
      "cities": [
        {
          "name": {
            "en": "Dubai",
            "ar": "دبي"
          },
          "slug": "dubai",
          "isActive": true,
          "isPopular": true
        }
      ]
    }
  ]
}
```

### Hotel Assignment to Packages (Alternative Method)

You can also assign hotels to packages after creation using:

```bash
POST /api/hotels/assign-to-package
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "package": "package_id_here",
  "hotel": "hotel_id_from_available_hotels",
  "checkInDay": 1,
  "checkOutDay": 3,
  "roomType": "Deluxe Room",
  "roomsNeeded": 2,
  "guestsPerRoom": 2,
  "pricePerNight": 400,
  "currency": "SAR",
  "mealPlan": "breakfast",
  "mealPlanPrice": 80,
  "roomPreferences": {
    "bedType": "king",
    "view": "sea",
    "smokingAllowed": false
  }
}
```

---

## 🏨 2. HOTELS

### **IMPORTANT: TBO Integration for Hotels**

Hotels in Trippat can be integrated with TBO (Third-Party Booking) system for live pricing, availability, and booking capabilities. This integration provides real-time data and automated booking confirmations.

#### TBO Integration Fields for Hotels
```json
{
  "tboIntegration": {
    "isLinked": true,
    "tboHotelCode": "12345",              // TBO's unique hotel identifier
    "tboHotelName": "Ritz Carlton Dubai", // Hotel name in TBO system  
    "tboCityCode": "DXB",                 // TBO city code
    "tboCountryCode": "AE",               // TBO country code
    "lastSyncDate": "2024-01-15T10:30:00.000Z",
    "syncStatus": "synced",               // 'synced', 'pending', 'failed', 'not_linked'
    "livePricing": true,                  // Enable real-time pricing from TBO
    "autoSync": true,                     // Enable automatic data synchronization
    "syncedFields": ["description", "amenities", "images", "starRating"],
    "lastError": null
  }
}
```

#### TBO Integration Workflow

**Step 1: Search TBO Hotels**
```bash
GET /api/admin/tbo-hotels/search?city=Dubai&country=AE
Authorization: Bearer <jwt_token>
```

**Step 2: Find Matches for Existing Hotel**
```bash  
GET /api/admin/tbo-hotels/matches/64f8a1b2c3d4e5f6789012ab
Authorization: Bearer <jwt_token>
```

**Step 3: Link Hotel to TBO**
```bash
POST /api/admin/tbo-hotels/link
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hotelId": "64f8a1b2c3d4e5f6789012ab",
  "tboHotelCode": "12345",
  "tboHotelName": "Ritz Carlton Dubai",
  "tboCityCode": "DXB", 
  "tboCountryCode": "AE",
  "enableLivePricing": true,
  "autoSync": true,
  "syncFields": ["description", "amenities", "images"]
}
```

**Step 4: Sync Hotel Data from TBO**
```bash
POST /api/admin/tbo-hotels/sync/64f8a1b2c3d4e5f6789012ab
Authorization: Bearer <jwt_token>
```

#### Getting TBO Live Pricing
```bash
POST /api/admin/tbo-hotels/pricing/64f8a1b2c3d4e5f6789012ab
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "checkIn": "2024-04-15",
  "checkOut": "2024-04-17", 
  "roomConfiguration": [
    {
      "adults": 2,
      "children": 0,
      "childAges": []
    }
  ]
}
```

### Create Hotel
**Endpoint**: `POST /api/hotels`
**Authentication**: Required

#### Complete Request Example (with TBO Integration)
```json
{
  "name": "Burj Al Arab Jumeirah",
  "name_ar": "برج العرب جميرا",
  "description": "The world's most luxurious hotel, an iconic sail-shaped tower offering unparalleled luxury and service on Dubai's pristine coastline.",
  "description_ar": "أفخم فندق في العالم، برج أيقوني على شكل شراع يقدم فخامة وخدمة لا مثيل لها على ساحل دبي البكر",
  "location": {
    "address": "Jumeirah Beach Road, Dubai",
    "address_ar": "شارع شاطئ الجميرا، دبي",
    "city": "Dubai", 
    "city_ar": "دبي",
    "country": "UAE",
    "country_ar": "الإمارات العربية المتحدة",
    "coordinates": {
      "latitude": 25.1413,
      "longitude": 55.1853
    },
    "zipCode": "00000",
    "district": "Jumeirah",
    "district_ar": "الجميرا"
  },
  "starRating": 7,
  "hotelClass": "luxury",
  "hotelType": "resort",
  "totalRooms": 202,
  "checkInTime": "15:00",
  "checkOutTime": "12:00",
  "basePrice": 2000,
  "currency": "SAR",
  "roomTypes": [
    {
      "name": "Panoramic Suite", 
      "name_ar": "جناح بانورامي",
      "description": "Spacious suite with panoramic views of Dubai coastline",
      "description_ar": "جناح واسع مع إطلالات بانورامية على ساحل دبي",
      "size": 170,
      "capacity": 3,
      "bedConfiguration": "1 King + 1 Sofa Bed",
      "bedConfiguration_ar": "سرير كينغ + سرير أريكة",
      "pricePerNight": 2000,
      "currency": "SAR",
      "totalRooms": 100,
      "amenities": [
        "Butler service",
        "Sea view",
        "Private balcony", 
        "Marble bathroom",
        "24-hour room service"
      ],
      "amenities_ar": [
        "خدمة الخادم الشخصي",
        "إطلالة البحر",
        "شرفة خاصة",
        "حمام من الرخام", 
        "خدمة الغرف على مدار 24 ساعة"
      ]
    }
  ],
  "amenities": [
    "9 world-class restaurants",
    "Spa and wellness center", 
    "Private beach",
    "Swimming pools",
    "Fitness center",
    "Business center",
    "Concierge service",
    "Valet parking",
    "Airport transfers",
    "Kids club"
  ],
  "amenities_ar": [
    "9 مطاعم عالمية المستوى",
    "مركز السبا والعافية",
    "شاطئ خاص", 
    "حمامات سباحة",
    "مركز لياقة بدنية",
    "مركز الأعمال",
    "خدمة الكونسيرج",
    "خدمة صف السيارات",
    "نقل المطار",
    "نادي الأطفال"
  ],
  "services": {
    "wifi": true,
    "parking": true,
    "restaurant": true,
    "roomService": true,
    "spa": true,
    "gym": true,
    "pool": true,
    "businessCenter": true,
    "concierge": true,
    "laundry": true,
    "airportShuttle": true,
    "petFriendly": false,
    "wheelchairAccessible": true,
    "familyFriendly": true,
    "smoking": false
  },
  "contact": {
    "phone": "+971-4-301-7777",
    "email": "reservations@burjalarab.com",
    "website": "https://www.jumeirah.com/burj-al-arab",
    "fax": "+971-4-301-7000"
  },
  "policies": {
    "checkInTime": "15:00",
    "checkOutTime": "12:00", 
    "cancellationPolicy": "flexible",
    "cancellationDeadline": 24,
    "paymentPolicy": "pay_at_hotel",
    "minimumAge": 21,
    "petsAllowed": false,
    "smokingPolicy": "no_smoking",
    "extraBedPolicy": "available"
  },
  "images": [
    {
      "url": "/uploads/hotels/burj-al-arab-exterior.jpg",
      "title": "Burj Al Arab Exterior",
      "title_ar": "المظهر الخارجي لبرج العرب",
      "altText": "Iconic sail-shaped hotel tower",
      "altText_ar": "برج الفندق الأيقوني على شكل شراع",
      "type": "exterior",
      "isPrimary": true,
      "order": 1
    },
    {
      "url": "/uploads/hotels/burj-al-arab-suite.jpg", 
      "title": "Panoramic Suite",
      "title_ar": "الجناح البانورامي",
      "altText": "Luxurious suite interior",
      "altText_ar": "الجزء الداخلي للجناح الفاخر",
      "type": "room",
      "isPrimary": false,
      "order": 2
    }
  ],
  "ratings": {
    "overall": 4.8,
    "cleanliness": 4.9,
    "service": 4.9,
    "location": 4.7,
    "value": 4.2,
    "facilities": 4.8
  },
  "awards": [
    "World's Leading Luxury Hotel 2023",
    "Best Hotel in Middle East 2023"
  ],
  "nearbyAttractions": [
    {
      "name": "Wild Wadi Water Park",
      "name_ar": "مدينة وايلد وادي المائية",
      "distance": 0.2,
      "unit": "km"
    }
  ],
  "tboIntegration": {
    "isLinked": true,
    "tboHotelCode": "67890",
    "tboHotelName": "Burj Al Arab Jumeirah",
    "tboCityCode": "DXB",
    "tboCountryCode": "AE",
    "lastSyncDate": "2024-01-15T10:30:00.000Z",
    "syncStatus": "synced",
    "livePricing": true,
    "autoSync": true,
    "syncedFields": ["description", "amenities", "images", "starRating", "coordinates"],
    "lastError": null
  },
  "status": "active", 
  "isActive": true,
  "isFeatured": true,
  "verified": true,
  "priority": 1
}
```

#### Required Fields Only
```json
{
  "name": "Hotel Name",
  "description": "Hotel description",
  "location": {
    "address": "Hotel Address",
    "city": "City Name",
    "country": "Country"
  },
  "starRating": 5,
  "totalRooms": 100,
  "basePrice": 200,
  "currency": "SAR"
}
```

### **TBO Hotel Management APIs**

#### Get TBO Integration Status
```bash
GET /api/admin/tbo-hotels/status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalHotels": 50,
    "linkedHotels": 25,
    "syncedHotels": 20,
    "livePricingEnabled": 15,
    "lastSyncErrors": [
      {
        "hotelId": "64f8a1b2c3d4e5f6789012ab",
        "error": "TBO hotel not found",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### Search TBO Hotels by City
```bash
GET /api/admin/tbo-hotels/search?city=Dubai&country=AE&limit=50
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "tboHotelCode": "12345",
        "hotelName": "Atlantis The Palm",
        "starRating": 5,
        "location": {
          "address": "Crescent Road, The Palm",
          "city": "Dubai",
          "country": "United Arab Emirates"
        },
        "facilities": ["WiFi", "Pool", "Spa", "Restaurant"],
        "images": [
          "https://tbo.com/images/hotel1.jpg"
        ],
        "description": "Luxury resort on Palm Jumeirah"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50
    }
  }
}
```

#### Unlink Hotel from TBO
```bash
DELETE /api/admin/tbo-hotels/link/64f8a1b2c3d4e5f6789012ab
Authorization: Bearer <jwt_token>
```

#### Enable/Disable Live Pricing
```bash
PATCH /api/admin/tbo-hotels/live-pricing/64f8a1b2c3d4e5f6789012ab
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "livePricing": true
}
```

### **TBO Booking APIs**

#### PreBook Hotel (Validate Rates)
```bash
POST /api/tbo-booking/prebook
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hotelCode": "12345",
  "checkIn": "2024-04-15",
  "checkOut": "2024-04-17",
  "roomConfiguration": [
    {
      "adults": 2,
      "children": 1,
      "childAges": [8]
    }
  ],
  "nationality": "SA",
  "currency": "SAR"
}
```

#### Book Hotel (Confirm Reservation)
```bash
POST /api/tbo-booking/book
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "prebookingCode": "PB123456",
  "guestInfo": [
    {
      "title": "Mr",
      "firstName": "Ahmed",
      "lastName": "Al-Salem",
      "type": "Adult"
    },
    {
      "title": "Mrs", 
      "firstName": "Fatima",
      "lastName": "Al-Salem",
      "type": "Adult"
    },
    {
      "title": "Master",
      "firstName": "Omar", 
      "lastName": "Al-Salem",
      "type": "Child",
      "age": 8
    }
  ],
  "contactInfo": {
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "address": "Riyadh, Saudi Arabia"
  },
  "specialRequests": "Late check-in required"
}
```

#### Get Booking Details
```bash
GET /api/tbo/booking/TBO123456789
Authorization: Bearer <jwt_token>
```

#### Cancel TBO Booking
```bash
POST /api/tbo/cancel
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookingId": "TBO123456789",
  "cancellationReason": "Change of plans"
}
```

### **TBO Location APIs**

#### Get TBO Countries
```bash
GET /api/tbo/locations/countries
Authorization: Bearer <jwt_token>
```

#### Get TBO Cities by Country
```bash
GET /api/tbo/locations/cities/AE
Authorization: Bearer <jwt_token>
```

### **TBO Cache Management**

#### Clean Expired Cache
```bash
DELETE /api/tbo/cache/clean
Authorization: Bearer <jwt_token>
```

### **TBO Integration Best Practices**

1. **Always PreBook Before Booking**: Validate rates and availability
2. **Cache TBO Search Results**: Results are cached for 30 minutes
3. **Handle TBO Errors Gracefully**: Fallback to local pricing if TBO fails
4. **Monitor Sync Status**: Check hotel sync status regularly
5. **Use Live Pricing Carefully**: Enable only for high-demand hotels
6. **Keep TBO Data Fresh**: Sync hotel data at least weekly

### **TBO Status Codes**
- `synced`: Hotel successfully linked and synchronized
- `pending`: Sync operation in progress
- `failed`: Sync operation failed (check lastError)
- `not_linked`: Hotel not connected to TBO

### **TBO Rate Limiting**
- Booking operations: 10 requests per minute
- Search operations: 30 requests per minute  
- Admin operations: 50 requests per minute

---

## 🎯 3. ACTIVITIES

### Create Activity  
**Endpoint**: `POST /api/activities`
**Authentication**: Required

#### Complete Request Example
```json
{
  "title": "Scuba Diving in Red Sea",
  "title_ar": "الغوص في البحر الأحمر",
  "description": "Professional scuba diving experience in the crystal-clear waters of the Red Sea, exploring vibrant coral reefs and diverse marine life with certified PADI instructors.",
  "description_ar": "تجربة غوص مهنية في المياه الصافية للبحر الأحمر، واستكشاف الشعاب المرجانية النابضة بالحياة والحياة البحرية المتنوعة مع مدربين معتمدين من PADI",
  "shortDescription": "Explore underwater coral reefs and marine life",
  "shortDescription_ar": "استكشف الشعاب المرجانية والحياة البحرية تحت الماء",
  "destinations": ["Eilat", "Red Sea"],
  "destinations_ar": ["إيلات", "البحر الأحمر"],
  "cities": ["Eilat"],
  "cities_ar": ["إيلات"],
  "country": "Israel",
  "country_ar": "إسرائيل",
  "address": "Coral Beach Nature Reserve, Eilat",
  "address_ar": "محمية شاطئ كورال الطبيعية، إيلات",
  "coordinates": {
    "latitude": 29.5016,
    "longitude": 34.9229
  },
  "categories": ["water_sports"],
  "subcategory": "scuba_diving",
  "tags": ["diving", "coral reef", "marine life", "underwater", "PADI"],
  "tags_ar": ["غوص", "شعاب مرجانية", "حياة بحرية", "تحت الماء", "بادي"],
  "duration": 240,
  "durationType": "fixed",
  "difficultyLevel": "beginner",
  "physicalDemand": "moderate",
  "minAge": 10,
  "maxAge": 70,
  "minParticipants": 2,
  "maxParticipants": 6,
  "groupSizeType": "small",
  "language": ["English", "Hebrew", "Arabic"],
  "seasonality": ["year_round"],
  "bestTimeToVisit": "Year round, water temperature 21-26°C",
  "bestTimeToVisit_ar": "على مدار السنة، درجة حرارة الماء 21-26 درجة مئوية",
  "pricing": [
    {
      "type": "adult",
      "label": "Adult (18+)",
      "label_ar": "بالغ (18+)",
      "minAge": 18,
      "maxAge": 70,
      "price": 280,
      "currency": "SAR",
      "minQuantity": 1,
      "maxQuantity": 4
    },
    {
      "type": "youth", 
      "label": "Youth (10-17)",
      "label_ar": "شاب (10-17)",
      "minAge": 10,
      "maxAge": 17,
      "price": 210,
      "currency": "SAR",
      "minQuantity": 0,
      "maxQuantity": 2
    }
  ],
  "basePrice": 280,
  "currency": "SAR",
  "inclusions": [
    "All scuba diving equipment (mask, fins, wetsuit, tank)",
    "Professional PADI certified instructor",
    "Underwater safety briefing",
    "Underwater photography session",
    "Light refreshments after dive",
    "Digital photos of your dive",
    "Beginner certification upon completion"
  ],
  "inclusions_ar": [
    "جميع معدات الغوص (قناع، زعانف، بدلة، خزان)",
    "مدرب محترف معتمد من PADI",
    "إحاطة أمان تحت الماء",
    "جلسة تصوير تحت الماء",
    "مرطبات خفيفة بعد الغوص",
    "صور رقمية لغوصك",
    "شهادة مبتدئ عند الإنجاز"
  ],
  "exclusions": [
    "Transportation to dive center",
    "Lunch/meals",
    "Personal underwater camera rental",
    "Advanced diving equipment",
    "Medical certificate (if required)",
    "Gratuities",
    "Travel insurance"
  ],
  "exclusions_ar": [
    "النقل إلى مركز الغوص",
    "الغداء/الوجبات",
    "تأجير الكاميرا الشخصية تحت الماء",
    "معدات الغوص المتقدمة",
    "شهادة طبية (إذا كانت مطلوبة)",
    "الإكراميات",
    "تأمين السفر"
  ],
  "requirements": [
    "Basic swimming ability (50 meters)",
    "Medical certificate if over 45 years",
    "No serious heart or lung conditions",
    "No recent surgeries within 6 months",
    "Comfortable in water environments"
  ],
  "requirements_ar": [
    "قدرة أساسية على السباحة (50 متر)",
    "شهادة طبية إذا كان العمر أكثر من 45 سنة",
    "لا توجد حالات قلب أو رئة خطيرة",
    "لا توجد عمليات جراحية حديثة خلال 6 أشهر",
    "الراحة في البيئات المائية"
  ],
  "whatToBring": [
    "Swimwear",
    "Towel",
    "Sunscreen (reef-safe)",
    "Water bottle",
    "Change of clothes"
  ],
  "whatToBring_ar": [
    "ملابس السباحة",
    "منشفة", 
    "واقي الشمس (آمن للشعاب المرجانية)",
    "زجاجة ماء",
    "تغيير الملابس"
  ],
  "meetingPoint": {
    "name": "Red Sea Diving Center",
    "name_ar": "مركز غوص البحر الأحمر",
    "address": "Coral Beach, Eilat 88000",
    "address_ar": "شاطئ كورال، إيلات 88000",
    "coordinates": {
      "latitude": 29.5016,
      "longitude": 34.9229
    },
    "instructions": "Meet at main reception 30 minutes before start time. Look for the PADI flag.",
    "instructions_ar": "التجمع في الاستقبال الرئيسي قبل 30 دقيقة من وقت البداية. ابحث عن علم PADI",
    "parking": "Free parking available on-site",
    "parking_ar": "موقف سيارات مجاني متاح في الموقع"
  },
  "schedule": {
    "timeSlots": [
      {
        "startTime": "08:00",
        "endTime": "12:00", 
        "duration": 240,
        "maxParticipants": 6,
        "price": 280,
        "isAvailable": true,
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      },
      {
        "startTime": "13:00",
        "endTime": "17:00",
        "duration": 240, 
        "maxParticipants": 6,
        "price": 280,
        "isAvailable": true,
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      }
    ],
    "closedDates": [],
    "specialDates": []
  },
  "cancellationPolicy": {
    "type": "moderate",
    "hoursBeforeCancellation": 24,
    "refundPercentage": 80,
    "description": "Free cancellation up to 24 hours before activity start time. 80% refund for cancellations within 24 hours.",
    "description_ar": "إلغاء مجاني حتى 24 ساعة قبل وقت بداية النشاط. استرداد 80% للإلغاءات خلال 24 ساعة",
    "noShowPolicy": "No refund for no-shows",
    "noShowPolicy_ar": "لا يوجد استرداد لعدم الحضور"
  },
  "weatherDependency": {
    "dependent": true,
    "conditions": "Activity may be cancelled due to rough sea conditions or poor visibility",
    "conditions_ar": "قد يتم إلغاء النشاط بسبب ظروف البحر القاسية أو ضعف الرؤية",
    "alternativeOffered": true,
    "alternativeDescription": "Alternative date or full refund offered",
    "alternativeDescription_ar": "يتم تقديم تاريخ بديل أو استرداد كامل"
  },  
  "provider": {
    "name": "Red Sea Diving Adventures",
    "name_ar": "مغامرات غوص البحر الأحمر",
    "description": "PADI 5-Star diving center with 25+ years experience in Red Sea diving",
    "description_ar": "مركز غوص 5 نجوم من PADI مع أكثر من 25 سنة خبرة في غوص البحر الأحمر",
    "contact": {
      "email": "info@redseadiving.com",
      "phone": "+972-8-637-4404",
      "website": "https://www.redseadiving.com"
    },
    "certifications": ["PADI 5-Star", "ISO 9001", "Green Fins Certified"],
    "verified": true,
    "rating": 4.8
  },
  "images": [
    {
      "url": "/uploads/activities/red-sea-diving-1.jpg",
      "title": "Scuba diving in coral reef",
      "title_ar": "الغوص في الشعاب المرجانية", 
      "altText": "Diver exploring colorful coral reef",
      "altText_ar": "غواص يستكشف الشعاب المرجانية الملونة",
      "isPrimary": true,
      "order": 1,
      "type": "activity"
    }
  ],
  "reviews": {
    "averageRating": 4.7,
    "totalReviews": 156,
    "breakdown": {
      "5": 89,
      "4": 45, 
      "3": 18,
      "2": 3,
      "1": 1
    }
  },
  "instantBooking": true,
  "requiresApproval": false,
  "advanceBooking": {
    "required": true,
    "minimumHours": 2,
    "maximumDays": 30
  },
  "status": "active",
  "isPublished": true,
  "featured": false,
  "priority": 0,
  "visibility": "public"
}
```

#### Required Fields Only
```json
{
  "title": "Activity Title",
  "description": "Activity description",
  "category": "water_sports",
  "destination": "City Name",
  "basePrice": 150,
  "duration": 120,
  "maxParticipants": 10
}
```

#### Valid Activity Categories
```javascript
["tours", "cultural", "adventure", "food_drink", "nightlife", "water_sports", "outdoor", "museums", "attractions", "transportation", "workshops", "wellness", "entertainment", "sports", "shopping"]
```

---

## 📂 4. CATEGORIES

### Create Category
**Endpoint**: `POST /api/categories`
**Authentication**: Required (admin only)

#### Complete Request Example
```json
{
  "name": {
    "en": "Adventure Tours",
    "ar": "جولات المغامرة"
  },
  "description": {
    "en": "Exciting adventure tours and activities for thrill-seekers and outdoor enthusiasts",
    "ar": "جولات ونشاطات مغامرة مثيرة لمحبي الإثارة وعشاق الهواء الطلق"
  },
  "slug": "adventure-tours",
  "icon": "Adventure",
  "color": "#FF6B35",
  "status": "active",
  "order": 1,
  "parentId": null,
  "image": "/uploads/categories/adventure-category.jpg",
  "packageCategory": "adventure",
  "seo": {
    "metaTitle": {
      "en": "Adventure Tours & Activities - Thrilling Experiences",
      "ar": "جولات ونشاطات المغامرة - تجارب مثيرة"
    },
    "metaDescription": {
      "en": "Discover exciting adventure tours and activities. From desert safaris to mountain climbing, find your perfect thrill.",
      "ar": "اكتشف جولات ونشاطات المغامرة المثيرة. من رحلات السفاري الصحراوية إلى تسلق الجبال، جد الإثارة المثالية لك"
    },
    "keywords": ["adventure", "tours", "activities", "outdoor", "thrill", "excitement"],
    "focusKeyword": "adventure tours",
    "focusKeyword_ar": "جولات المغامرة"
  }
}
```

#### Required Fields Only
```json
{
  "name": {
    "en": "Category Name",
    "ar": "اسم الفئة"
  },
  "description": {
    "en": "Category description",
    "ar": "وصف الفئة"
  },
  "packageCategory": "adventure"
}
```

---

## 🎫 5. COUPONS

### Create Coupon
**Endpoint**: `POST /api/coupons`
**Authentication**: Required (admin only)

#### Complete Request Example
```json
{
  "code": "SUMMER2024",
  "name": "Summer Special 25% Off",
  "name_ar": "عرض الصيف الخاص خصم 25%",
  "description": "Get 25% off on all summer packages. Valid for bookings made before August 31st, 2024.",
  "description_ar": "احصل على خصم 25% على جميع باقات الصيف. صالح للحجوزات المؤكدة قبل 31 أغسطس 2024",
  "discountType": "percentage",
  "discountValue": 25,
  "minimumAmount": 500,
  "maximumDiscount": 300,
  "currency": "SAR",
  "usageLimit": 200,
  "usedCount": 0,
  "validFrom": "2024-06-01T00:00:00.000Z",
  "validUntil": "2024-08-31T23:59:59.000Z",
  "applicablePackages": [],
  "excludedPackages": [],
  "applicableCategories": ["adventure", "luxury"],
  "userRestrictions": {
    "newUsersOnly": false,
    "maxUsesPerUser": 2,
    "minimumUserRegistrationDays": 0,
    "allowedUserRoles": ["customer"]
  },
  "conditions": {
    "minimumTravelers": 1,
    "maximumTravelers": 10,
    "validDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    "blackoutDates": [],
    "advanceBookingRequired": 7
  },
  "autoApply": false,
  "stackable": false,
  "priority": 1,
  "isActive": true,
  "isPublic": true,
  "createdBy": "admin_user_id",
  "metadata": {
    "campaign": "Summer 2024 Promotion",
    "source": "email_marketing",
    "notes": "High-value promotion for summer season"
  }
}
```

#### Required Fields Only
```json
{
  "code": "DISCOUNT10",
  "name": "10% Discount",
  "discountType": "percentage",
  "discountValue": 10,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.000Z",
  "isActive": true
}
```

---

## 🌍 6. DESTINATIONS

### Create Destination
**Endpoint**: `POST /api/destinations`
**Authentication**: Required

#### Complete Request Example
```json
{
  "country": {
    "en": "United Arab Emirates",
    "ar": "الإمارات العربية المتحدة"
  },
  "countryCode": "AE",
  "continent": {
    "en": "Asia",
    "ar": "آسيا"
  },
  "timezone": "Asia/Dubai",
  "currency": {
    "code": "AED",
    "name": {
      "en": "UAE Dirham",
      "ar": "درهم إماراتي"
    },
    "symbol": "د.إ",
    "exchangeRateToSAR": 1.02
  },
  "cities": [
    {
      "name": {
        "en": "Dubai",
        "ar": "دبي"
      },
      "slug": "dubai",
      "coordinates": {
        "latitude": 25.2048,
        "longitude": 55.2708
      },
      "description": {
        "en": "A global city known for luxury shopping, ultramodern architecture and vibrant nightlife",
        "ar": "مدينة عالمية معروفة بالتسوق الفاخر والهندسة المعمارية فائقة الحداثة والحياة الليلية النابضة بالحياة"
      },
      "isCapital": false,
      "isPopular": true,
      "isActive": true,
      "image": "/uploads/destinations/dubai.jpg",
      "attractions": [
        "Burj Khalifa",
        "Dubai Mall", 
        "Palm Jumeirah",
        "Burj Al Arab"
      ],
      "attractions_ar": [
        "برج خليفة",
        "دبي مول",
        "نخلة الجميرا",
        "برج العرب"
      ]
    },
    {
      "name": {
        "en": "Abu Dhabi",
        "ar": "أبو ظبي"
      },
      "slug": "abu-dhabi",
      "coordinates": {
        "latitude": 24.4539,
        "longitude": 54.3773
      },
      "description": {
        "en": "The capital city of UAE, known for its cultural attractions and modern architecture",
        "ar": "العاصمة الإمارات، معروفة بمعالمها الثقافية والهندسة المعمارية الحديثة"
      },
      "isCapital": true,
      "isPopular": true,
      "isActive": true,
      "image": "/uploads/destinations/abu-dhabi.jpg"
    }
  ],
  "languages": [
    {
      "code": "ar",
      "name": "Arabic",
      "isOfficial": true
    },
    {
      "code": "en", 
      "name": "English",
      "isOfficial": false
    }
  ],
  "isActive": true,
  "isPopular": true,
  "priority": 1,
  "image": "/uploads/destinations/uae.jpg",
  "description": {
    "en": "A federation of seven emirates known for luxury, innovation, and desert adventures",
    "ar": "اتحاد من سبع إمارات معروف بالرفاهية والابتكار ومغامرات الصحراء"
  }
}
```

#### Required Fields Only
```json
{
  "country": {
    "en": "Country Name",
    "ar": "اسم الدولة"
  },
  "countryCode": "XX",
  "cities": [
    {
      "name": {
        "en": "City Name",
        "ar": "اسم المدينة"
      },
      "slug": "city-name",
      "isActive": true
    }
  ],
  "isActive": true
}
```

---

## 📝 7. BOOKINGS

### Create Booking
**Endpoint**: `POST /api/bookings`
**Authentication**: Required

#### Complete Request Example
```json
{
  "package": "64f8a1b2c3d4e5f6789012ab",
  "user": "64f8a1b2c3d4e5f6789012cd",
  "travelers": {
    "adults": 2,
    "children": 1,
    "infants": 0,
    "total": 3
  },
  "travelerDetails": [
    {
      "type": "adult",
      "firstName": "Ahmed",
      "lastName": "Al-Salem",
      "dateOfBirth": "1985-05-15",
      "nationality": "Saudi Arabia",
      "passportNumber": "A12345678",
      "gender": "male",
      "isMainTraveler": true
    },
    {
      "type": "adult", 
      "firstName": "Fatima",
      "lastName": "Al-Salem",
      "dateOfBirth": "1990-08-22",
      "nationality": "Saudi Arabia",
      "passportNumber": "A87654321",
      "gender": "female",
      "isMainTraveler": false
    },
    {
      "type": "child",
      "firstName": "Omar",
      "lastName": "Al-Salem", 
      "dateOfBirth": "2015-12-10",
      "nationality": "Saudi Arabia",
      "passportNumber": "A11111111",
      "gender": "male",
      "isMainTraveler": false
    }
  ],
  "travelDates": {
    "checkIn": "2024-04-15T00:00:00.000Z",
    "checkOut": "2024-04-18T00:00:00.000Z",
    "flexible": false
  },
  "contactInfo": {
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "alternatePhone": "+966501234568",
    "address": {
      "street": "King Fahd Road",
      "city": "Riyadh",
      "state": "Riyadh Region",
      "zipCode": "12345",
      "country": "Saudi Arabia"
    },
    "emergencyContact": {
      "name": "Mohammad Al-Salem",
      "phone": "+966501234569",
      "relationship": "Brother"
    }
  },
  "pricing": {
    "adultPrice": 450,
    "childPrice": 350,
    "infantPrice": 0,
    "baseAmount": 1250,
    "taxes": 125,
    "serviceFee": 25,
    "discount": 100,
    "totalAmount": 1300,
    "currency": "SAR"
  },
  "couponCode": "SUMMER2024",
  "specialRequests": "Vegetarian meals for all travelers. Need wheelchair accessibility for elderly parent who may join.",
  "dietaryRestrictions": ["vegetarian"],
  "accessibilityNeeds": ["wheelchair_accessible"],
  "roomPreferences": {
    "roomType": "twin_beds",
    "smoking": false,
    "floor": "high_floor",
    "view": "sea_view"
  },
  "additionalServices": [
    {
      "service": "airport_transfer",
      "price": 150,
      "currency": "SAR"
    }
  ],
  "paymentInfo": {
    "method": "credit_card",
    "status": "pending",
    "paymentGateway": "stripe",
    "installments": 1,
    "dueDate": "2024-04-10T00:00:00.000Z"
  },
  "bookingSource": "website",
  "referralSource": "google_ads",
  "agentId": null,
  "bookingStatus": "confirmed",
  "paymentStatus": "paid",
  "confirmationNumber": "TRP2024041500123",
  "notes": "High-value customer, provide premium service",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "sessionId": "sess_abc123"
  }
}
```

#### Required Fields Only
```json
{
  "package": "package_id_here",
  "travelers": {
    "adults": 2,
    "children": 0,
    "infants": 0
  },
  "travelDates": {
    "checkIn": "2024-04-15T00:00:00.000Z",
    "checkOut": "2024-04-18T00:00:00.000Z"
  },
  "contactInfo": {
    "email": "customer@example.com",
    "phone": "+966501234567"
  },
  "totalPrice": 900,
  "currency": "SAR"
}
```

---

## 🔧 UTILITY INFORMATION

### Response Formats

#### Success Response
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "_id": "generated_id",
    // ... created resource data
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "price", 
      "message": "Price must be a positive number"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### Common HTTP Status Codes
- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **400**: Bad Request / Validation Error
- **401**: Unauthorized (Invalid/Missing JWT)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found
- **409**: Conflict (Duplicate entry)
- **429**: Too Many Requests (Rate limit exceeded)
- **500**: Internal Server Error

### Rate Limits
- **General API**: 100 requests per 15 minutes
- **Creation Operations**: 20 requests per 15 minutes
- **Booking Creation**: 10 requests per hour per user
- **Admin Operations**: 100 requests per 15 minutes

### File Upload Guidelines
- **Supported formats**: JPG, JPEG, PNG, WebP
- **Maximum file size**: 5MB per file
- **Maximum files per request**: 10 files
- **Recommended dimensions**: 1920x1080 for packages, 800x600 for others

### Multi-language Support
The API supports both English and Arabic content:
- Use `_ar` suffix for Arabic fields (e.g., `title_ar`, `description_ar`)
- Query parameter: `lang=en` or `lang=ar` 
- Currency parameter: `currency=SAR` or `currency=USD`

### Important Notes for Claude Desktop/Zapier Integration

1. **Always include authentication header** with valid JWT token
2. **Use SAR as default currency** for all pricing
3. **Include both English and Arabic content** for better user experience
4. **Set `tourStatus: "published"` and `availability: true`** for packages to be visible
5. **Use proper category values** from the predefined lists
6. **Include required fields only** for minimal viable records, add optional fields for richer content
7. **Validate coordinates** for location-based entities (latitude: -90 to 90, longitude: -180 to 180)
8. **Use ISO date format** for all date fields (YYYY-MM-DDTHH:MM:SS.sssZ)

### **CRITICAL WORKFLOW FOR AUTOMATION:**

#### Step 1: Get Available Options FIRST
```bash
# Before creating any package, get available options:
GET /api/hotels?status=active&limit=100
GET /api/categories?status=active  
GET /api/destinations/cities
```

#### Step 2: Create Supporting Data (if needed)
```bash
# Create hotels first if they don't exist
POST /api/hotels { ... hotel data ... }

# Link hotels to TBO for live pricing (optional but recommended)
POST /api/admin/tbo-hotels/link { 
  "hotelId": "hotel_id",
  "tboHotelCode": "tbo_code",
  "enableLivePricing": true 
}

# Create categories if needed
POST /api/categories { ... category data ... }

# Create destinations if needed  
POST /api/destinations { ... destination data ... }
```

#### Step 3: Create Package with References
```bash
# Create package with references to existing data
POST /api/packages {
  "title": "Package Name",
  "category": ["existing_category_name"],
  "destination": "existing_city_name",
  "hotelPackagesJson": [
    {
      "hotelId": "existing_hotel_id",
      "name": "Hotel Name from DB",
      // ... hotel assignment data
    }
  ]
}
```

### **DATA VALIDATION REQUIREMENTS:**

- **Hotels**: `hotelId` must exist in hotels collection
- **Categories**: Category names must match `packageCategory` values from categories collection  
- **Destinations**: City names must exist in destinations collection
- **Room Types**: Must match room types defined in the selected hotel
- **Meal Plans**: `room_only`, `breakfast`, `half_board`, `full_board`
- **Bed Types**: `king`, `queen`, `twin`, `single`
- **Views**: `sea`, `city`, `garden`, `mountain`, `pool`, `desert`

### **COMMON AUTOMATION ERRORS TO AVOID:**

1. ❌ **Using non-existent hotel IDs** - Always fetch hotels first
2. ❌ **Using invalid category names** - Must match predefined categories  
3. ❌ **Creating packages without required fields** - Check minimum requirements
4. ❌ **Missing Arabic translations** - Include `_ar` fields for better UX
5. ❌ **Wrong date formats** - Use ISO 8601 format
6. ❌ **Invalid coordinates** - Validate lat/lng ranges
7. ❌ **Incorrect currency codes** - Use SAR or USD only
8. ❌ **Missing authentication** - All create operations require JWT token
9. ❌ **Invalid TBO hotel codes** - Verify TBO codes exist before linking
10. ❌ **Booking without PreBook** - Always PreBook before confirming TBO reservations
11. ❌ **Ignoring sync status** - Check hotel sync status before enabling live pricing
12. ❌ **Wrong TBO city/country codes** - Use proper TBO location codes

This comprehensive guide provides all the information needed to create automation workflows that can successfully interact with the Trippat backend API with proper data relationships and constraints.