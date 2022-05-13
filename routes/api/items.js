const express = require('express');
const uuid = require('uuid');
const router = express.Router();
const items = require('../../Items');

const idFilter = req => item => item.id === parseInt(req.params.id);

//Get All Items
router.get('/', (req, res) => res.json(items));

// Get Single Item with ID
router.get('/:id', (req, res) => {
    const found = items.some(idFilter(req));
  
    if (found) {
      res.json(items.filter(idFilter(req)));
    } else {
      res.status(400).json({ msg: `No item with the id of ${req.params.id}` });
    }
  });

// Add Item
router.post('/', (req, res) => {
    const newItem = {
        id: uuid.v4(),
        ...req.body,
    };
  
    if (!newItem.name || !newItem.location || !newItem.qty) {
      return res.status(400).json({ msg: 'Please include a name and location and qty' });
    }
  
    items.push(newItem);
    res.json(items);
  });
  
// Update Item
router.put('/:id', (req, res) => {
    const found = items.some(idFilter(req));
  
    if (found) {
      items.forEach((item, i) => {
        if (idFilter(req)(item)) {
  
          const updatedItem = {...item, ...req.body};
          items[i] = updatedItem
          res.json({ msg: 'Item updated', updatedItem });
        }
      });
    } else {
      res.status(400).json({ msg: `No item with the id of ${req.params.id}` });
    }
  });

// Delete Item
router.delete('/:id', (req, res) => {
    const found = items.some(idFilter(req));
  
    if (found) {
      res.json({
        msg: 'Item deleted',
        items: items.filter(item => !idFilter(req)(item))
      });
    } else {
      res.status(400).json({ msg: `No item with the id of ${req.params.id}` });
    }
  });

module.exports = router;