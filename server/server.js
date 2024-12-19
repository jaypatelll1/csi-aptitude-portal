const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const {jwtAuthMiddleware} = require('./middlewares/jwtAuthMiddleware');
const {limiter} = require('./utils/rateLimitUtils');

const userRouter = require("./routes/userRoutes");
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes')


const app = express();
app.use(express.json());
// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

//utils
app.use(limiter);

//Routes
app.post('/api/', (req, res)=>{
  res.send("Hello ");
})
app.use('/api/user', userRouter);
app.use("/api/exam" ,jwtAuthMiddleware, examRoutes )
app.use('/api/questions', jwtAuthMiddleware, questionsRoutes);
app.use('/api/exam/:exam_id', jwtAuthMiddleware, responseRoutes)
app.use('/api/results', jwtAuthMiddleware, responseRoutes)

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});