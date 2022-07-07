const express = require('express');
const mongoose = require('mongoose');
const itemSchema = require('../../models/ItemSchema');

const router = express.Router();
var DBItem;

async function connect(username, password) {
  return mongoose.connect(`mongodb+srv://${username}:${password}@storage-manager-db.ednke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    { useNewUrlParser: true },
    () => {
      //console.log('connected to mongodb');
    });
}

router.post('/login', (req, res) => {
  //var connected = false
  connect(req.body.username, req.body.password)
    .catch(err => {console.log(err)})
    
  const dbConnection = mongoose.connection;

  const checkNotConnected = async () => {
    dbConnection.on('error', (err) => {
      console.error(err)
      //connected = false
      return res.status(400).json({"message": "login failed"})
    });
  }

  const checkConnected = async () => {
    await checkNotConnected();
    dbConnection.on('connected', () => {
      //connected = true
      console.log('connected')
      return res.status(200).json({"message": "login success"})
    });
  }

  checkConnected();

  DBItem = dbConnection.model('items', itemSchema, 'items');
  // if (connected) return res.status(200).json({"message": "login success"})
  // else res.status(400).json({"message": "login failed"})

});

//Get All Items
router.get('/', (req, res) => {
  DBItem.find({}, (err, data) => { 
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