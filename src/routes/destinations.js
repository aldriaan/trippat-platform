const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getAllCities,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  addCity,
  updateCity,
  deleteCity
} = require('../controllers/destinationController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Destination routes
router.get('/', getDestinations);
router.get('/cities', getAllCities); // Get all cities for package selection
router.get('/:id', getDestinationById);
router.post('/', createDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

// City management routes
router.post('/:id/cities', addCity);
router.put('/:id/cities/:cityId', updateCity);
router.delete('/:id/cities/:cityId', deleteCity);

module.exports = router;