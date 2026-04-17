const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/chat', require('./routes/chat'));
app.get('/health', (req, res) => res.json({ status: 'ok', model: 'mistral' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Curalink backend running on port ${PORT}`));
