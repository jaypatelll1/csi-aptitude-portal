// const express = require('express');
// const { query, initializeDB } = require('./db');

// const app = express();
// app.use(express.json()); // Middleware for parsing JSON requests

// // Initialize the database when the server starts
// initializeDB();

// // Test route to insert and fetch data
// app.post('/api/users', async (req, res) => {
//   const { name, email } = req.body;

//   try {
//     // Insert data
//     await query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
    
//     // Retrieve all users
//     const result = await query('SELECT * FROM users');
//     res.status(200).json({ success: true, users: result.rows });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ success: false, message: 'Database error' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
