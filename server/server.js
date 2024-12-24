const express = require('express');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes'); 

const port = process.env.PORT || 4000;

const app = express();
app.use(express.json());

app.use('/api', userRoutes);

app.get('/' , ()=> {
    
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});