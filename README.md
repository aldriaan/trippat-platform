# Trippat - Travel Booking Platform

A comprehensive travel booking platform built with Node.js, Express, MongoDB, and Next.js, supporting both Arabic and English languages with full RTL support.

## 🌟 Features

### Core Functionality
- **Multi-language Support**: Full Arabic/English localization with RTL support
- **Travel Packages**: Comprehensive package management with itineraries, hotels, and activities
- **Hotel Management**: Integration with TBO (The Booking Office) API for real-time hotel data
- **Activity Booking**: Individual activity bookings with detailed information
- **User Management**: Role-based access control (Customer, Expert, Admin)
- **Payment Integration**: Ready for payment gateway integration
- **Responsive Design**: Mobile-first responsive design

### Admin Dashboard
- **Package Management**: Create, edit, and manage travel packages
- **Hotel Management**: Add hotels with TBO integration
- **Activity Management**: Manage individual activities and experiences
- **Booking Management**: View and manage all bookings
- **User Management**: Manage users and their roles
- **Analytics Dashboard**: Comprehensive booking and revenue analytics
- **Content Management**: Multilingual content management system

### Customer Features
- **Package Browsing**: Browse and filter travel packages
- **Activity Discovery**: Discover and book individual activities
- **Booking System**: Complete booking flow with date selection
- **User Profiles**: Manage personal information and booking history
- **AI Chat Integration**: OpenAI-powered travel assistance
- **Currency Support**: USD/SAR currency conversion

## 🏗️ Architecture

### Backend API (`src/`)
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Local file storage with metadata management
- **API Structure**: RESTful API design

### Admin Dashboard (`trippat-admin/`)
- **Framework**: Next.js 14 with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **File Upload**: Drag-and-drop image management

### Customer App (`trippat-customer/`)
- **Framework**: Next.js 14 with TypeScript
- **Internationalization**: next-intl for i18n
- **Styling**: Tailwind CSS with RTL support
- **AI Integration**: OpenAI integration for chat features

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Helmet (Security)
- CORS
- Rate Limiting

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- next-intl (Internationalization)
- Lucide React (Icons)

### Development Tools
- ESLint
- Prettier
- Git
- VS Code

## 📁 Project Structure

```
trippat-backend/
├── src/                     # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   └── server.js          # Express server entry point
├── trippat-admin/         # Admin Dashboard
│   └── src/
│       ├── app/           # Next.js 14 app directory
│       ├── components/    # React components
│       ├── lib/          # Utility functions
│       └── types/        # TypeScript definitions
├── trippat-customer/      # Customer App
│   └── src/
│       ├── app/           # Next.js 14 app directory
│       ├── components/    # React components
│       ├── lib/          # Utility functions
│       └── types/        # TypeScript definitions
├── uploads/               # File storage
├── forms.md              # Form documentation
├── CLAUDE.md             # Development guidelines
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trippat-backend.git
   cd trippat-backend
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Admin Dashboard Dependencies**
   ```bash
   cd trippat-admin
   npm install
   cd ..
   ```

4. **Install Customer App Dependencies**
   ```bash
   cd trippat-customer
   npm install
   cd ..
   ```

5. **Environment Setup**
   Create `.env` files in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/trippat
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Frontend URLs
   FRONTEND_URL=http://localhost:3000
   ADMIN_URL=http://localhost:3001
   
   # Email Configuration
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   EMAIL_FROM=noreply@trippat.com
   
   # OpenAI (for customer app)
   OPENAI_API_KEY=your-openai-api-key
   
   # Payment Gateway (to be configured)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend API**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

3. **Start Admin Dashboard**
   ```bash
   cd trippat-admin
   npm run dev
   ```
   Admin dashboard will run on `http://localhost:3001`

4. **Start Customer App**
   ```bash
   cd trippat-customer
   npm run dev
   ```
   Customer app will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Package Endpoints
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package (Admin only)
- `GET /api/packages/:id` - Get package by ID
- `PUT /api/packages/:id` - Update package (Admin only)
- `DELETE /api/packages/:id` - Delete package (Admin only)

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/admin/bookings` - Get all bookings (Admin only)

### Activity Endpoints
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity (Admin only)
- `GET /api/activities/:id` - Get activity by ID

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `FRONTEND_URL` | Customer app URL | Yes |
| `ADMIN_URL` | Admin dashboard URL | Yes |
| `EMAIL_USER` | SMTP email username | Yes |
| `EMAIL_PASS` | SMTP email password | Yes |
| `EMAIL_FROM` | From email address | Yes |
| `OPENAI_API_KEY` | OpenAI API key for chat | No |

## 🚀 Deployment

### AWS Deployment (Recommended)

1. **EC2 Instance Setup**
   - Launch EC2 instance (Ubuntu 20.04 LTS)
   - Install Node.js, MongoDB, and Nginx
   - Configure security groups

2. **Database Setup**
   - Use MongoDB Atlas (recommended) or self-hosted MongoDB
   - Update `MONGODB_URI` in production environment

3. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/trippat-backend.git
   
   # Install dependencies and build
   npm install
   cd trippat-admin && npm install && npm run build
   cd ../trippat-customer && npm install && npm run build
   
   # Start with PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Customer App
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Admin Dashboard
       location /admin {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Payment Gateway Integration

The application is prepared for payment gateway integration. Currently supports:

- **Stripe**: Ready for integration
- **PayPal**: Can be easily added
- **Local Payment Gateways**: Configurable

To test payment integration:
1. Add payment gateway credentials to environment variables
2. Implement payment routes in `/src/routes/payments.js`
3. Update frontend booking flow to handle payments

## 🧪 Testing

### Backend Testing
```bash
npm test
```

### Frontend Testing
```bash
# Admin Dashboard
cd trippat-admin
npm run test

# Customer App
cd trippat-customer
npm run test
```

## 📖 Documentation

- [Form Documentation](./forms.md) - Detailed documentation of all admin forms
- [Development Guidelines](./CLAUDE.md) - Development best practices and guidelines
- [API Documentation](./docs/api.md) - Complete API reference (to be created)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@trippat.com

## 🔮 Roadmap

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-vendor support
- [ ] Advanced search and filtering
- [ ] Review and rating system
- [ ] Social media integration
- [ ] Progressive Web App (PWA) features

---

Made with ❤️ by the Trippat Team