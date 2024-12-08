const express = require('express');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes'); 

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.use('/api', userRoutes);

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});