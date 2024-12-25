require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const {jwtAuthMiddleware} = require('./middlewares/jwtAuthMiddleware');
const {limiter} = require('./utils/rateLimitUtils');
require('./utils/autoUpdateExamStatus'); // For auto-updating exam status

// Routes Import
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const resultRoutes = require('./routes/resultRoutes');
const fileRoutes = require("./routes/fileRoutes");
const exportRoutes = require("./routes/exportRoutes")
const cookieParser = require('cookie-parser');

const app = express();
// Middlewares
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Your client URL
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
// app.use("/uploads", express.static(path.resolve("./uploads")));


// utils
app.use(limiter);

// Routes
app.use('/api/users', userRoutes);
app.use("/api/exams" ,jwtAuthMiddleware, examRoutes )
app.use('/api/exams/questions', jwtAuthMiddleware, questionsRoutes);
app.use('/api/exams/responses', jwtAuthMiddleware, responseRoutes);
app.use('/api/exams/results', jwtAuthMiddleware, resultRoutes);
app.use("/api/export/", exportRoutes);
app.use("/", fileRoutes); 
app.use("/api/exams/",fileRoutes)

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
