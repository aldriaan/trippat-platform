const express = require('express');
const router = express.Router();
const {
  createHotel,
  createHotelJSON,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  searchHotels,
  checkAvailability,
  updateAvailability
} = require('../controllers/hotelController');

const {
  assignHotelToPackage,
  getPackageHotels,
  updatePackageHotel,
  removeHotelFromPackage,
  generatePackageHotelSummary,
  getHotelPackages
} = require('../controllers/packageHotelController');

const { authenticate } = require('../middleware/auth');

// Hotel CRUD operations
router.post('/', authenticate, createHotel);
router.post('/json', authenticate, createHotelJSON);
router.get('/', getAllHotels);
router.get('/search', searchHotels);
router.get('/:id', getHotelById);
router.put('/:id', authenticate, updateHotel);
router.delete('/:id', authenticate, deleteHotel);

// Hotel availability management
router.get('/:id/availability', checkAvailability);
router.put('/:id/availability', authenticate, updateAvailability);

// Hotel-Package relationship management
router.post('/assign-to-package', authenticate, assignHotelToPackage);
router.get('/package/:packageId', getPackageHotels);
router.put('/assignment/:id', authenticate, updatePackageHotel);
router.delete('/assignment/:id', authenticate, removeHotelFromPackage);
router.get('/package/:packageId/summary', generatePackageHotelSummary);

// Hotel packages (packages using a specific hotel)
router.get('/:hotelId/packages', getHotelPackages);

module.exports = router;