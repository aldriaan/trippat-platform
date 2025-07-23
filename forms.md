# Trippat Admin Forms Documentation

This document provides a comprehensive overview of all forms in the Trippat admin system. Each form is detailed with its structure, fields, validation rules, and special features.

## Table of Contents

1. [Package Forms (Add/Edit)](#package-forms-addedit)
2. [Hotel Forms (Add/Edit)](#hotel-forms-addedit)
3. [Destination Forms (Add/Edit)](#destination-forms-addedit)
4. [Activity Forms (Add/Edit)](#activity-forms-addedit)
5. [Common Patterns](#common-patterns-across-all-forms)
6. [Technical Implementation](#technical-implementation-details)

---

## Package Forms (Add/Edit)

**File Locations:**
- Add: `/trippat-admin/src/app/dashboard/packages/add/page.tsx`
- Edit: `/trippat-admin/src/app/dashboard/packages/edit/page.tsx`

**Purpose:** Create and manage travel packages with comprehensive details including itinerary, pricing, hotels, and media.

### Form Structure (12 Sections)

#### 1. Tour Overview
**Fields:**
- `tourNameEn` (string, required) - Tour name in English
- `tourNameAr` (string, required) - Tour name in Arabic
- `shortDescriptionEn` (string, required) - Brief description in English
- `shortDescriptionAr` (string, required) - Brief description in Arabic
- `categories` (string[], required) - Multi-select categories with search functionality
- `tourType` (string, required) - Options: Private, Group, Fixed Date, Flexible
- `tourStartDate` (string, conditional) - Required for Group/Fixed Date tours
- `tourEndDate` (string, conditional) - Required for Group/Fixed Date tours
- `languagesAvailable` (string[]) - Dynamic list of available languages
- `difficultyLevel` (string) - Options: easy, moderate, challenging, expert
- `allowChildren` (boolean) - Whether children are allowed
- `allowInfants` (boolean) - Whether infants are allowed
- `featuredTour` (boolean) - Mark as featured package

**Special Features:**
- Category field uses searchable multi-select with green tags
- Date fields conditionally shown based on tour type
- Dynamic language list with add/remove functionality

#### 2. Destinations & Coverage
**Fields:**
- `citiesCovered` (string[], required) - Cities included in the tour

**Features:**
- Searchable city dropdown with autocomplete
- Popular cities quick-select buttons
- Selected cities display as removable tags
- Real-time search filtering
- Validation: At least one city required

#### 3. Duration & Schedule
**Fields:**
- `numberOfDays` (number, required) - Tour duration in days
- `numberOfNights` (number, required) - Number of nights
- `checkInTime` (string) - Default check-in time
- `checkOutTime` (string) - Default check-out time
- `bookingPeriod` (number) - Days before tour for booking
- `allowCancellation` (boolean) - Whether cancellation is allowed
- `cancellationPolicy` (string) - Cancellation policy details

#### 4. Pricing
**Fields:**
- `adultPrice` (number, required) - Price per adult in SAR
- `childPrice` (number, required) - Price per child in SAR
- `discountType` (string) - Options: None, Percentage, Fixed Amount
- `discountAmount` (number) - Discount value
- `salePrice` (number, calculated) - Final price after discount
- `saleFromDate` (string) - Sale start date
- `saleToDate` (string) - Sale end date
- `allowDeposit` (boolean) - Whether deposit payment is allowed
- `depositAmount` (number, conditional) - Deposit amount if allowed

**Features:**
- Automatic price calculations
- Currency display in SAR
- Conditional deposit fields

#### 5. Group Information
**Fields:**
- `minimumPeople` (number) - Minimum group size
- `maximumPeople` (number) - Maximum group size
- `groupSizeType` (string) - Type of group sizing

**Visibility:** Only shown for Group tour types

#### 6. What's Included
**Fields:**
- `highlights` (string[]) - Key highlights of the tour
- `whatsIncluded` (string[]) - What's included in the package
- `whatsExcluded` (string[]) - What's excluded from the package

**Features:**
- Dynamic add/remove functionality for all lists
- Drag-and-drop reordering
- Real-time preview

#### 7. Itinerary
**Fields:**
- `tourProgramEn` (object[]) - Daily itinerary in English
- `tourProgramAr` (object[]) - Daily itinerary in Arabic

**Structure per day:**
```typescript
{
  day: number,
  title: string,
  description: string
}
```

**Features:**
- Dynamic generation based on `numberOfDays`
- Separate English and Arabic versions
- Rich text editing capabilities

#### 8. Hotels
**Fields:**
- `selectedHotels` (object[]) - Selected hotels for the package

**Hotel object structure:**
```typescript
{
  hotelId: string,
  name: string,
  name_ar: string,
  city: string,
  starRating: number,
  image: string,
  nights: number,
  roomType: string,
  pricePerNight: number
}
```

**Features:**
- Hotel search with autocomplete
- Real-time pricing calculations
- Hotel details display
- Remove/edit functionality

#### 9. Activities
**Status:** Placeholder section (Coming Soon)

#### 10. SEO & Search Visibility
**Fields:**
- `urlSlug` (string) - Auto-generated URL slug
- `metaDescriptionEn` (string) - Meta description in English (160 chars max)
- `metaDescriptionAr` (string) - Meta description in Arabic (160 chars max)
- `focusKeywordEn` (string) - Primary SEO keyword in English
- `focusKeywordAr` (string) - Primary SEO keyword in Arabic
- `seoKeywords` (string[]) - Additional SEO keywords

**Features:**
- Character count display for meta descriptions
- Auto-slug generation from tour name
- Dynamic keyword management

#### 11. Availability & Status
**Fields:**
- `currentlyAvailable` (boolean) - Whether package is currently available
- `tourStatus` (string) - Options: Draft, Published, Archived, Under Review

#### 12. Media Upload
**Fields:**
- `mainTourImage` (File) - Primary package image
- `galleryImages` (File[]) - Additional package images
- `tourVideos` (string[]) - Video URLs
- `imageMetadata` (object[]) - Metadata for each image

**Image metadata structure:**
```typescript
{
  file: File,
  title: string,
  titleAr: string,
  altText: string,
  altTextAr: string,
  description: string,
  descriptionAr: string,
  featured: boolean
}
```

**Features:**
- Drag-and-drop file upload
- Image preview with metadata editing
- Featured image selection
- Multiple format support

### Validation Rules
- Required fields marked with asterisk (*)
- At least one category required
- At least one city required
- Adult and child prices must be positive numbers
- Meta descriptions limited to 160 characters
- Image files must be valid formats (jpg, png, webp)

---

## Hotel Forms (Add/Edit)

**File Locations:**
- Add: `/trippat-admin/src/app/dashboard/hotels/add/page.tsx`
- Edit: `/trippat-admin/src/app/dashboard/hotels/edit/page.tsx`

**Purpose:** Manage hotel information for package bookings with comprehensive details and TBO integration.

### Form Structure (10 Sections)

#### 1. Basic Information
**Fields:**
- `nameEn` (string, required) - Hotel name in English
- `nameAr` (string, required) - Hotel name in Arabic
- `descriptionEn` (string, required) - Hotel description in English
- `descriptionAr` (string, required) - Hotel description in Arabic

#### 2. Location Information
**Fields:**
- `address` (string, required) - Full hotel address
- `city` (string, required) - City selection with search
- `country` (string, auto-populated) - Country based on city

**Features:**
- Searchable city dropdown
- Popular cities quick-select
- Auto-population of country based on city selection
- Real-time city search filtering

#### 3. Hotel Classification
**Fields:**
- `starRating` (number, required) - Star rating (1-5)
- `hotelClass` (string, required) - Options: budget, mid_range, luxury, resort, boutique
- `totalRooms` (number, required) - Total number of rooms

#### 4. Pricing
**Fields:**
- `basePrice` (number, required) - Base price per night in SAR

**Features:**
- Currency display in SAR
- Note about future TBO API price integration

#### 5. Contact Information
**Fields:**
- `phone` (string) - Hotel phone number
- `email` (string) - Hotel email address
- `website` (string) - Hotel website URL

**Validation:**
- Email format validation
- URL format validation for website
- Phone number format validation

#### 6. Amenities
**Fields:**
- `amenities` (string[]) - Selected amenities

**Available amenities:**
- WiFi, Pool, Spa, Gym, Restaurant, Bar
- Room Service, Laundry, Business Center
- Pet Friendly, Wheelchair Accessible, Parking

**Features:**
- Checkbox grid layout
- Dynamic add/remove functionality
- Custom amenity addition

#### 7. Services
**Fields:**
- `services` (string[]) - Available services

**Service categories:**
- Guest Services: Restaurant, Spa, Gym, Pool
- Connectivity: WiFi
- Transportation: Airport Shuttle, Parking
- Business: Business Center, Room Service
- Accessibility: Wheelchair, Pet Friendly

#### 8. Hotel Images
**Fields:**
- `images` (File[]) - Hotel image gallery
- `primaryImage` (string) - Primary image identifier

**Features:**
- Multiple file upload
- Image preview grid
- Primary image selection
- Existing images management (edit mode)

#### 9. TBO Integration
**Fields:**
- `tboHotelId` (string) - TBO system hotel ID
- `tboData` (object) - TBO integration data

**Features:**
- TBOHotelAutoFill component
- Auto-fill hotel data from TBO API
- Integration status display
- Unlink functionality

**TBOHotelAutoFill Component Features:**
- Search TBO hotels by name
- Auto-populate hotel details
- Link/unlink TBO hotel
- Sync hotel information

#### 10. Policies
**Fields:**
- `checkInTime` (string) - Check-in time
- `checkOutTime` (string) - Check-out time
- `cancellationPolicy` (string) - Cancellation policy
- `status` (string) - Options: active, inactive, pending
- `isActive` (boolean) - Active status
- `featured` (boolean) - Featured hotel flag

### Validation Rules
- All basic information fields required
- Star rating must be 1-5
- Base price must be positive
- Email must be valid format
- Website must be valid URL

---

## Destination Forms (Add/Edit)

**File Locations:**
- Add: `/trippat-admin/src/app/dashboard/destinations/add/page.tsx`
- Edit: `/trippat-admin/src/app/dashboard/destinations/edit/page.tsx`

**Purpose:** Manage countries and their cities for location selection across the system.

### Form Structure (2 Sections)

#### 1. Country Information
**Fields:**
- `countryNameEn` (string, required) - Country name in English
- `countryNameAr` (string, required) - Country name in Arabic
- `countryCode` (string, required) - ISO country code (2-3 characters, uppercase)
- `continent` (string, required) - Continent selection

**Continent options:**
- Asia
- Europe
- North America
- South America
- Africa
- Australia/Oceania
- Antarctica

#### 2. Cities Section
**Fields:**
- `cities` (object[]) - List of cities in the country

**City object structure:**
```typescript
{
  nameEn: string,    // City name in English
  nameAr: string,    // City name in Arabic
  isActive: boolean  // City active status
}
```

**Features:**
- Dynamic city addition/removal
- Individual city active status
- Empty state with helpful instructions
- Clean removal interface

### Special Features
- Simple, focused design
- Globe and MapPin icons for visual clarity
- Bilingual support throughout
- Real-time city management
- Clean empty states

### Validation Rules
- Country name required in both languages
- Country code must be 2-3 uppercase characters
- Continent selection required
- At least one city with names in both languages

---

## Activity Forms (Add/Edit)

**File Locations:**
- Add: `/trippat-admin/src/app/activities/add/page.tsx`
- Edit: `/trippat-admin/src/app/activities/edit/[id]/page.tsx`

**Purpose:** Create and manage individual activities with detailed information, pricing, and media.

### Form Structure (8 Sections)

#### 1. Basic Information
**Fields:**
- `titleEn` (string, required) - Activity title in English
- `titleAr` (string, required) - Activity title in Arabic
- `categories` (string[], required) - Activity categories with search
- `descriptionEn` (string, required) - Activity description in English
- `descriptionAr` (string, required) - Activity description in Arabic

**Features:**
- Category search functionality identical to packages
- Rich text editing for descriptions
- Real-time character count

#### 2. Location Information
**Fields:**
- `destinations` (string[]) - Selected destinations
- `cities` (string[]) - Selected cities
- `address` (string) - Specific activity address
- `latitude` (number) - GPS latitude coordinate
- `longitude` (number) - GPS longitude coordinate

**Features:**
- Combined destination/city search
- Auto-population of destinations based on cities
- GPS coordinate input
- Location validation

#### 3. Pricing Information
**Fields:**
- `priceAdult` (number, required) - Adult price in SAR
- `priceChild` (number, required) - Child price in SAR
- `discountType` (string) - Discount type (None, Percentage, Fixed)
- `discountAmount` (number) - Discount value
- `saleFromDate` (string) - Sale start date
- `saleToDate` (string) - Sale end date
- `allowDeposit` (boolean) - Allow deposit payments
- `depositAmount` (number) - Deposit amount

**Features:**
- Package-style pricing structure
- Automatic discount calculations
- SAR currency display
- Conditional deposit fields

#### 4. Duration & Capacity
**Fields:**
- `duration` (number, required) - Activity duration
- `durationUnit` (string) - Unit: hours or days
- `difficultyLevel` (string) - Difficulty rating with descriptions
- `maxParticipants` (number, required) - Maximum participants
- `minParticipants` (number, required) - Minimum participants

**Difficulty levels:**
- Easy: Suitable for all fitness levels
- Moderate: Moderate physical activity required
- Challenging: Good fitness level recommended
- Expert: Excellent fitness required

#### 5. Activity Images
**Fields:**
- `mainImage` (File, required) - Primary activity image
- `galleryImages` (File[]) - Additional images
- `imageMetadata` (object[]) - Metadata for each image

**Image metadata structure:**
```typescript
{
  file: File,
  titleEn: string,
  titleAr: string,
  altTextEn: string,
  altTextAr: string,
  descriptionEn: string,
  descriptionAr: string,
  featured: boolean
}
```

**Features:**
- Drag-and-drop upload
- Image preview with metadata editing
- Featured image selection
- Multiple format support

#### 6. Activity Details
**Fields:**
- `highlights` (string[]) - Key activity highlights
- `included` (string[]) - What's included
- `notIncluded` (string[]) - What's not included
- `requirements` (string[]) - Participant requirements

**Features:**
- Dynamic list management for all fields
- Add/remove functionality
- Drag-and-drop reordering
- Bilingual content support

#### 7. Activity Settings
**Fields:**
- `cancellationPolicy` (string, required) - Cancellation policy
- `publishImmediately` (boolean) - Publish upon creation
- `featured` (boolean) - Mark as featured activity
- `instantConfirmation` (boolean) - Enable instant booking confirmation

**Cancellation policy options:**
- Free cancellation up to 24 hours
- Free cancellation up to 48 hours
- Free cancellation up to 7 days
- No cancellation allowed
- Custom policy

#### 8. SEO (Optional)
**Fields:**
- `metaTitleEn` (string) - Meta title in English
- `metaTitleAr` (string) - Meta title in Arabic
- `metaDescriptionEn` (string) - Meta description in English
- `metaDescriptionAr` (string) - Meta description in Arabic
- `tags` (string[]) - SEO tags

### Special Features
- Complex location management with city-destination relationships
- Package-style pricing identical to packages
- Comprehensive image metadata system
- Duration flexibility (hours or days)
- Advanced difficulty level descriptions

### Validation Rules
- Title and description required in both languages
- At least one category required
- Adult and child prices must be positive
- Duration must be positive
- Min participants ≤ Max participants
- Valid GPS coordinates if provided

---

## Common Patterns Across All Forms

### 1. Bilingual Support
- All user-facing content has English (`En`) and Arabic (`Ar`) versions
- RTL (Right-to-Left) support for Arabic fields
- Consistent naming convention: `fieldNameEn`, `fieldNameAr`

### 2. Dynamic Lists
- Add/remove functionality for array fields
- Drag-and-drop reordering where applicable
- Empty state messages with helpful instructions
- Visual feedback for additions/removals

### 3. Image Management
- Consistent upload, preview, and metadata handling
- Support for multiple image formats (jpg, png, webp)
- Image metadata with bilingual titles, alt text, and descriptions
- Featured/primary image selection
- Drag-and-drop upload interface

### 4. Validation
- Required fields marked with red asterisk (*)
- Real-time validation feedback
- Consistent error message styling
- Form submission validation
- Field-specific validation rules

### 5. Search Components
- Autocomplete functionality with dropdown results
- Real-time filtering as user types
- Selected items displayed as removable tags
- Empty state handling
- Popular items quick-select (where applicable)

### 6. Status Management
- Active/inactive status toggles
- Featured item flags
- Publication status (Draft, Published, etc.)
- Conditional field display based on status

### 7. Responsive Design
- Grid layouts that adapt to screen size
- Mobile-optimized form controls
- Consistent spacing and typography
- Touch-friendly interface elements

### 8. Visual Design
- Lucide React icons for visual clarity
- Consistent color scheme (primary blue: #4391a3)
- Tailwind CSS for styling
- Card-based section layout
- Clear section dividers

### 9. Error Handling
- Loading states with spinners
- Error message display
- Network error handling
- Form validation error display
- Success message confirmation

### 10. Loading States
- Skeleton loading for form sections
- Spinner animations during async operations
- Disabled states during submission
- Progress indicators for multi-step processes

---

## Technical Implementation Details

### State Management
- **React Hooks**: useState for form data, useEffect for data fetching
- **Form Data Structure**: TypeScript interfaces for type safety
- **State Updates**: Immutable updates using spread operator
- **Conditional State**: Dynamic field visibility based on form values

### API Integration
- **Authentication**: Cookie-based token management
- **HTTP Methods**: GET for fetching, POST for creating, PUT for updating
- **Headers**: Proper Content-Type and Authorization headers
- **Error Handling**: Consistent error response handling

### File Handling
- **Upload Method**: FormData for multipart file uploads
- **File Validation**: Size and format validation
- **Preview Generation**: URL.createObjectURL for image previews
- **Metadata**: Comprehensive file metadata management

### Form Architecture
```typescript
// Common form data structure pattern
interface FormData {
  // Basic fields
  nameEn: string;
  nameAr: string;
  
  // Dynamic arrays
  categories: string[];
  images: File[];
  
  // Nested objects
  metadata: {
    title: string;
    description: string;
  }[];
  
  // Status flags
  isActive: boolean;
  featured: boolean;
}
```

### Styling Architecture
- **Framework**: Tailwind CSS with custom configuration
- **Color Scheme**: Primary blue (#4391a3), green accents, consistent grays
- **Component Classes**: Reusable utility classes for common patterns
- **Responsive**: Mobile-first responsive design principles

### Navigation & Routing
- **Next.js Router**: useRouter for navigation
- **Route Structure**: RESTful route patterns (/dashboard/entity/action)
- **Success Redirects**: Automatic navigation after successful operations
- **Back Navigation**: Breadcrumb navigation patterns

### Performance Considerations
- **Debounced Search**: Search inputs use debouncing to reduce API calls
- **Lazy Loading**: Images and large content loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Bundle Optimization**: Code splitting for form components

This documentation serves as a comprehensive reference for understanding, maintaining, and extending the Trippat admin form system.