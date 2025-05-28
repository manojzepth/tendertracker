import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    createItem, 
    getUserItems, 
    getItemById, 
    updateItem, 
    deleteItem 
} from '../controllers/itemController.js';

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// Define CRUD routes for items
router.post('/', createItem);         // Create a new item
router.get('/', getUserItems);        // Get all items for the logged-in user
router.get('/:itemId', getItemById);  // Get a specific item by its ID
router.put('/:itemId', updateItem);   // Update a specific item
router.delete('/:itemId', deleteItem); // Delete a specific item

export default router;
