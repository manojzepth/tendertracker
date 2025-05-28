// src/controllers/itemController.js
import pool from '../config/dbConfig.js';

// Create a new item
export const createItem = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // From 'protect' middleware

    if (!name) {
      return res.status(400).json({ message: 'Item name is required.' });
    }

    const newItemResult = await pool.query(
      'INSERT INTO items (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, userId]
    );

    res.status(201).json(newItemResult.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error while creating item.' });
  }
};

// Get all items for the logged-in user
export const getUserItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const itemsResult = await pool.query(
      'SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json(itemsResult.rows);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
};

// Get a specific item by its ID
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const itemResult = await pool.query(
      'SELECT * FROM items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or you are not authorized to view it.' });
    }

    res.status(200).json(itemResult.rows[0]);
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ message: 'Server error while fetching item.' });
  }
};

// Update a specific item
export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required for update.' });
    }

    const updatedItemResult = await pool.query(
      'UPDATE items SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, description || null, itemId, userId]
    );

    if (updatedItemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or you are not authorized to update it.' });
    }

    res.status(200).json(updatedItemResult.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error while updating item.' });
  }
};

// Delete a specific item
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const deleteResult = await pool.query(
      'DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING *',
      [itemId, userId]
    );

    if (deleteResult.rowCount === 0) { // rowCount is more appropriate for DELETE
      return res.status(404).json({ message: 'Item not found or you are not authorized to delete it.' });
    }

    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error while deleting item.' });
  }
};
