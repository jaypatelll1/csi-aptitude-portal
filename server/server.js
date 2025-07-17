require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const morgan = require('morgan');
const { jwtAuthMiddleware } = require('./middlewares/jwtAuthMiddleware');
const cookieParser = require('cookie-parser');
const { initSocketHandlers } = require('./utils/socket');
require('./utils/autoUpdateExamStatus'); // For auto-updating past exams status
require('./utils/autoliveExamStatus'); // For auto-updating live status

// Import Routes
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const resultRoutes = require('./routes/resultRoutes');
const fileRoutes = require('./routes/fileRoutes');
const exportRoutes = require('./routes/exportRoutes');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const statsRoutes = require('./routes/statsRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const deptRoutes = require('./routes/deptAnalysisRoutes');
const tpoRoutes = require('./routes/tpoAnalysisRoutes');
const rankRoutes = require('./routes/rankRoutes');
const teacherResponseRoutes = require('./routes/teacherResponseRoutes');
const teacherResultRoutes = require('./routes/teacherResultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Initialize the app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Function to get origins from environment variables
const getOriginsFromEnv = (envVar) =>
  process.env[envVar]?.split(',').map(origin => origin.trim()) || [];

const FRONTEND_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? getOriginsFromEnv('FRONTEND_ORIGIN_PROD')
    : getOriginsFromEnv('FRONTEND_ORIGIN_DEV');


const io = new Server(server, {
  cookie: true,
  cors: {
    origin: FRONTEND_ORIGIN, // Allow frontend origin
    methods: ['GET', 'POST'], // Specify HTTP methods
    credentials: true, // Allow credentials (cookies)
  },
});

// Middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_ORIGIN, // Update this to your frontend URL deployed on Render
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); // Handle form-data requests properly

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
// app.use("/uploads", express.static(path.resolve("./uploads")));

// Routes
app.use('/api/users', userRoutes, fileRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/exams', jwtAuthMiddleware, examRoutes, fileRoutes);
app.use('/api/exams/questions', jwtAuthMiddleware, questionsRoutes);
app.use('/api/exams/responses', jwtAuthMiddleware, responseRoutes);
app.use('/api/exams/results', jwtAuthMiddleware, resultRoutes);
app.use('/api/export', exportRoutes);
// app.use('/api/users', fileRoutes);
// app.use('/api/exams', fileRoutes);
app.use('/api/stats', jwtAuthMiddleware, statsRoutes);
app.use('/api/analysis', jwtAuthMiddleware, analysisRoutes);
app.use('/api/department-analysis', jwtAuthMiddleware, deptRoutes);
app.use('/api/tpo-analysis', jwtAuthMiddleware, tpoRoutes);
app.use('/api/rank', jwtAuthMiddleware, rankRoutes);
app.use('/api/exams/teacher-responses', jwtAuthMiddleware, teacherResponseRoutes);
app.use('/api/exams/teacher-results', jwtAuthMiddleware, teacherResultRoutes);
app.use('/api', jwtAuthMiddleware, uploadRoutes);
app.use('/generate-pdf', jwtAuthMiddleware, pdfRoutes);

const start_exam = io.of('/exams/start-exam');

// Initialize Socket.IO handlers
initSocketHandlers(start_exam);

// Ensure a response for the root route
app.get('/', (req, res) => {
  res.send('Server is running!'); // Generic message for Render health checks
});

// 404 Handler for undefined routes
// app.use((req, res, next) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);
//   error.status = 404;
//   next(error);
// });

// Centralized error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// FOR SOCKET.IO TESTING
// server.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);

// });
// EXPORT APP FOR TESTING
module.exports = app;
