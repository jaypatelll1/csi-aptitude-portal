const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
require('dotenv').config();

const questionsRoutes = require('./routes/questionRoutes');
// const validateQuestion = require('./middlewares/question');
const { createQuestionsTable } = require('./models/questionModel');
const userRouter = require("./routes/userRoutes");


const app = express();
app.use(express.json());
// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));




// app.use("/api" , require("./routes/exam"))
app.use('/api/questions', questionsRoutes);
app.use('/api/user', userRouter);


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});