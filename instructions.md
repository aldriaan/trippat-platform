# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🧠 Claude Code Protocol

To ensure quality, traceability, and team collaboration, Claude must follow these rules:

### ✅ 1. Log All Code Changes to `change-log.md`

- Every code change (creation, modification, or deletion) must be **recorded in `change-log.md`**.
- Use the following format:
  ```markdown
  ## [YYYY-MM-DD] <Brief summary of the task>
  - [Created|Modified|Removed] <filename>: <Short description>
  ```
- Always add new entries **at the top** of the file.

**Example:**
```markdown
## [2025-07-18] Implemented booking cancellation endpoint
- Created src/routes/bookings/cancel.js: Added route handler for booking cancellation
- Modified src/controllers/bookingController.js: Added cancellation logic
```

---

### ✅ 2. Divide All Tasks into Subtasks with Checklists

- When you start a new task, **create a clear checklist** of subtasks and present it before starting.
- Notify the user after each subtask is completed and **ask for approval before proceeding** to the next.
- Use this format when you begin a new task:
  ```markdown
  ### Task: [Task Title]
  - [ ] Subtask 1
  - [ ] Subtask 2
  - [ ] Subtask 3
  ```
- After finishing each subtask, mark it with `[x]` and notify the user:
  ```markdown
  ✅ Subtask 1 complete. Proceed with next?
  ```

---

### ✅ 3. Register All Forms in `forms.md`

- For every form you create (in frontend or backend), **register the full form details in `forms.md`**.
- Include:
  - Form name
  - Location (path/component)
  - Fields and their types
  - Validation rules
  - API endpoints involved
- If you need to modify a form, **reference `forms.md` before making changes**.

**Example Entry in `forms.md`:**
```markdown
## BookingForm

- Location: trippat-customer/components/forms/BookingForm.tsx
- Fields:
  - fullName: string (required)
  - email: string (required, must be valid email)
  - travelDates: Date range (required)
  - travelers: number (min: 1)
- Validations: yup schema in formSchema.ts
- API: POST /api/bookings
```

---

## Project Structure

This is a multi-component travel booking system called "Trippat" with three main applications:

1. **Backend API** (`src/`) - Node.js/Express API server with MongoDB  
2. **Admin Dashboard** (`trippat-admin/`) - Next.js TypeScript admin interface  
3. **Customer App** (`trippat-customer/`) - Next.js TypeScript customer-facing application

---

## Development Commands

### Backend API
```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Test (not configured)
npm test
```

### Admin Dashboard
```bash
cd trippat-admin
npm run dev          # Development with Turbopack
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
```

### Customer App
```bash
cd trippat-customer
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
```

---

## Architecture Overview

### Backend API Structure
- **Entry Point**: `src/server.js` - Express server with middleware, routes, and error handling  
- **Database**: MongoDB with Mongoose ODM (`src/config/database.js`)  
- **Models**: `src/models/` - User, Package, Booking, Category, Translation schemas  
- **Routes**: `src/routes/` - API endpoints organized by feature  
- **Controllers**: `src/controllers/` - Business logic handlers  
- **Services**: `src/services/` - Currency, email, localization, recommendation engines  
- **Middleware**: `src/middleware/` - Authentication and other middleware  

### Key Features
- **Multilingual Support**: Full Arabic/English localization with RTL support  
- **Currency Conversion**: Real-time USD/SAR conversion  
- **Role-Based Access**: Customer, Expert, Admin roles  
- **File Uploads**: Package images stored in `uploads/` directory  
- **Security**: Helmet, CORS, rate limiting, JWT authentication  

---

### Frontend Applications

- **Admin Dashboard**: React with Zustand state management, Tailwind CSS, TypeScript  
- **Customer App**: Next.js with next-intl for internationalization, OpenAI integration for AI chat  

---

## Database Models

### Core Models
- **User**: Authentication, roles, language/currency preferences  
- **Package**: Travel packages with multilingual content (title, description, inclusions, etc.)  
- **Booking**: Travel bookings with contact info, dates, travelers  
- **Category**: Travel categories for package organization  
- **Translation**: Translation management system  

### Multilingual Fields
Most content models include both English and Arabic versions:
- `title` / `title_ar`  
- `description` / `description_ar`  
- `destination` / `destination_ar`  
- Arrays: `inclusions` / `inclusions_ar`  

---

## API Endpoints

### Authentication (`/api/auth`)
- User registration, login, profile management  
- Password reset functionality  
- JWT-based authentication  

### Packages (`/api/packages`)
- CRUD operations for travel packages  
- Language/currency query parameters  
- Translation management endpoints  
- Expert-specific package listings  

### Bookings (`/api/bookings`)
- Booking creation and management  
- Admin booking reports and analytics  
- Booking status management  

### Admin (`/api/admin`)
- Dashboard analytics and statistics  
- User management and role updates  
- System health monitoring  
- Data export functionality  

---

## Environment Variables

Required environment variables:
- `MONGODB_URI` - MongoDB connection string  
- `JWT_SECRET` - JWT signing secret  
- `PORT` - Server port (default: 5000)  
- `NODE_ENV` - Environment (development/production)  
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` - Email service configuration  
- `FRONTEND_URL` - Frontend URL for CORS  

---

## Common Development Tasks

### Adding New API Endpoints
1. Create route handler in appropriate `src/routes/` file  
2. Add controller function in `src/controllers/`  
3. Update model schemas in `src/models/` if needed  
4. Add middleware for authentication/authorization as needed  

### Multilingual Content
- Always add both English and Arabic fields for user-facing content  
- Use the localization service (`src/services/localizationService.js`) for formatting  
- Currency conversion is handled by `src/services/currencyService.js`  

### Database Operations
- Use Mongoose for all database operations  
- Models are in `src/models/` with validation and schema definitions  
- Database connection is managed in `src/config/database.js`  

### Frontend Development
- Admin dashboard uses Zustand for state management  
- Customer app uses next-intl for internationalization  
- Both apps use Tailwind CSS for styling  
- API calls are made through axios or fetch  

---

## Testing

Currently no test framework is configured. To add testing:
1. Install testing framework (Jest, Mocha, etc.)  
2. Update package.json scripts  
3. Create test files in appropriate directories  
4. Configure test database connection  

---

## Security Considerations

- JWT tokens for authentication  
- Password hashing with bcryptjs  
- Rate limiting on API endpoints  
- Input validation and sanitization  
- CORS configuration for frontend origins  
- Helmet for security headers  

Trippat identity colors:


## 🔌 Local Development Ports

To avoid conflicts and ensure each server runs correctly, always use the following ports:

| Application        | Directory          | Port | Status |
|--------------------|--------------------|------|--------|
| Backend API        | `trippat-backend`  | 5001 | ✅ Updated (5000 was taken by macOS) |
| Customer Frontend  | `trippat-customer` | 3000 | ✅ Updated |
| Admin Dashboard    | `trippat-admin`    | 3001 | ✅ Updated |

> ⚠️ All servers must run simultaneously. Make sure these ports are free before starting.
> ⚠️ Port 5000 is used by macOS Control Center, so backend uses 5001 instead.

All `.env` files have been updated to reflect these ports and API URLs.

Example for `trippat-customer/.env.local`: