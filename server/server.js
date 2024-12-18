const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const {jwtAuthMiddleware} = require('./middlewares/jwtAuthMiddleware')

const userRoutes = require("./routes/userRoutes");
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
app.use('/api/users', userRoutes);
app.use("/api/exams" ,jwtAuthMiddleware, examRoutes )
app.use('/api/questions', questionsRoutes);
app.use('/api/exams/:exam_id', jwtAuthMiddleware, responseRoutes)
app.use('/api/results', responseRoutes)

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});