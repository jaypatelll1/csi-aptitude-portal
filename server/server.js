const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const {jwtAuthMiddleware} = require('./middlewares/jwtAuthMiddleware')

const userRouter = require("./routes/userRoutes");
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
// const validateQuestion = require('./middlewares/question');

const app = express();
app.use(express.json());
// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

//Routes
app.use('/api/user', userRouter);
app.use("/api/exam" ,jwtAuthMiddleware, examRoutes )
app.use('/api/questions', questionsRoutes);


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});