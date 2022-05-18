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

//DBItem.insertMany(items, (error) => console.log(error))

const idFilter = req => item => item.id === parseInt(req.params.id);

//Get All Items
router.get('/', (req, res) => {
  DBItem.find({}, function(err, data){ 
    res.json(data); 
  });
});

// Get Single Item with name
router.get('/:name', (req, res, next) => {
    DBItem.find({
      'name': req.params.name
    }, function(error, data){
      if(error) return next(error);
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
    
    newItem.save((error, post) => {
      if (error) return next(error);
      res.status(201).json(post);
    })
  });
  

// Update Item
router.put('/:name', (req, res) => {
  DBItem.findOneAndUpdate({'name': req.params.name}, req.body, {new: true}, function(err, doc) {
    if (err) return res.send(500, {error: err});
    return res.status(200).json(doc);
  });

});

// // Delete Item
// router.delete('/:id', (req, res) => {
//     const found = items.some(idFilter(req));
  
//     if (found) {
//       res.json({
//         msg: 'Item deleted',
//         items: items.filter(item => !idFilter(req)(item))
//       });
//     } else {
//       res.status(400).json({ msg: `No item with the id of ${req.params.id}` });
//     }
//   });

module.exports = router;