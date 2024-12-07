const express = require('express');
require('dotenv').config();
const {query} = require('./config/db');
const {registerUser, loginUser} = require('./controllers/userController')

const PORT = 3000;

const app = express();
app.use(express.json());

app.post('/api/register', registerUser);
app.post('/api/login', loginUser);

app.listen(PORT, 'localhost', ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});