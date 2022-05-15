const express = require('express');
const logger = require('./middleware/logger');
require('dotenv').config();

const app = express();
app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('Storage Manager');
});

app.use('/api/items', require('./routes/api/items.js'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));