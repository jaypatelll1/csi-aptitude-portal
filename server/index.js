require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const {calculateAndStoreTotalScore} = require('./utils/scoreUtils');  
const {createResult} = require("./models/resultModel")


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));



app.get('/', async(req, res) => {
const responses = await createResult();
console.log('response of created', responses);

res.json({responses})

})
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});