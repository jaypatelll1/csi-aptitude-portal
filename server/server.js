const express = require('express');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes'); 

const port = process.env.PORT || 4000;

const app = express();
app.use(express.json());

// Mount user routes
app.use('/api/users', userRoutes);

// Define a route for the root
app.get('/', (req, res) => {
  res.send('Hello World!'); // Ensure a response is sent
});

// Listen on all network interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
