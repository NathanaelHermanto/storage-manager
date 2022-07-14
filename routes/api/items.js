const express = require('express');
const mongoose = require('mongoose');
const itemSchema = require('../../models/ItemSchema');

const router = express.Router();
var DBItem;

async function connect(username, password) {
  return mongoose.connect(`mongodb+srv://${username}:${password}@storage-manager-db.ednke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    { useNewUrlParser: true });
}

router.post('/login', async (req, res) => {
  await connect(req.body.username, req.body.password)
    .then(mg => {
      const dbConnection = mg.connection;
      console.log('connected')
      DBItem = dbConnection.model('items', itemSchema, 'items');
      res.status(200).json({"token": "0"})
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({"token": "1"})
    })
});

//Get All Items
router.get('/', (req, res) => {
  DBItem.find({}, (err, data) => { 
    console.log({err, data})
    res.status(200).json(data); 
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

// Get Single Item with id
router.get('/id/:id', (req, res, next) => {
  DBItem.find({
    '_id': req.params.id
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

// Update Item by id
router.put('/id/:id', (req, res) => {
  if (!(req.body.location || req.body.qty || req.body.price || req.body.description)) {
    return res.status(400).json({ msg: 'Please include location or qty' });
  }

  DBItem.findOneAndUpdate({'_id': req.params.id}, req.body, {
      new: true, 
      upsert: true
    }, (err, doc) => {
      if (err) return res.send(500, {error: err});
      return res.status(200).json(doc);
  });

});

// Delete Item by name
router.delete('/:name', (req, res) => {
    DBItem.deleteOne({ 'name': req.params.name }, (err, doc) => {
      if(err) return res.status(400)
      res.status(200).json(doc);
    });
  });

  // Delete Item by id
router.delete('/id/:id', (req, res) => {
  DBItem.deleteOne({ '_id': req.params.id }, (err, doc) => {
    if(err) return res.status(400)
    res.status(200).json(doc);
  });
});

module.exports = router;