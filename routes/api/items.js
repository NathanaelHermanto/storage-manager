const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const itemSchema = require('../../models/ItemSchema');

if(!process.env.DB_CONNECTION) console.log('error DB_CONNECTION is not set');
mongoose.set("debug", true);

async function connect() {
  await mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true },
    () => {
      console.log('connected to mongodb');
    });
}

connect().catch(err => console.log(err));

const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const DBItem = dbConnection.model('items', itemSchema, 'items');

//Get All Items
router.get('/', (req, res) => {
  DBItem.find({}, (err, data) => { 
    res.json(data); 
  });
});

// Get Single Item with name
router.get('/:name', (req, res, next) => {
    DBItem.find({
      'name': req.params.name
    }, (err, data) => {
      if(err) return next(err);
      // check data is not null
      if (!(Object.keys(data).length === 0)) res.json(data)
      else return res.status(400).json({msg: 'item not found'})
    });
  });

// Add Item
router.post('/', (req, res, next) => {
    const newItem = new DBItem({
      ...req.body
    });
    
    if (!newItem.name || !newItem.location || !newItem.qty) {
      return res.status(400).json({ msg: 'Please include name and location and qty' });
    }
    
    newItem.save((err, post) => {
      if (err) return next(err);
      res.status(201).json(post);
    })
  });
  

// Update Item
router.put('/:name', (req, res) => {
  if (!(req.body.location || req.body.qty)) {
    return res.status(400).json({ msg: 'Please include location or qty' });
  }

  DBItem.findOneAndUpdate({'name': req.params.name}, req.body, {
      new: true, 
      upsert: true
    }, (err, doc) => {
      if (err) return res.send(500, {error: err});
      return res.status(200).json(doc);
  });

});

// Delete Item
router.delete('/:name', (req, res) => {
    DBItem.deleteOne({ 'name': req.params.name }, (err, doc) => {
      if(err) return res.status(400)
      res.status(200).json(doc);
    });
  });

module.exports = router;