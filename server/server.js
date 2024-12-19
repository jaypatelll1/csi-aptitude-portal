const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const {jwtAuthMiddleware} = require('./middlewares/jwtAuthMiddleware')

const userRouter = require("./routes/userRoutes");
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes')
const resultRoutes = require('./routes/resultRoutes');

const app = express();
app.use(express.json());
// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

//Routes
app.use('/api/users', userRouter);
app.use("/api/exams" ,jwtAuthMiddleware, examRoutes )
app.use('/api/exams/:exam_id/questions', jwtAuthMiddleware, questionsRoutes);
app.use('/api/exams/:exam_id/questions/:question_id/responses', jwtAuthMiddleware, responseRoutes)
app.use('/api/exams/:exam_id/results', jwtAuthMiddleware, resultRoutes)

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});