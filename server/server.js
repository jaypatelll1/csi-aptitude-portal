require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const morgan = require('morgan');
const { jwtAuthMiddleware } = require('./middlewares/jwtAuthMiddleware');
const { limiter } = require('./utils/rateLimitUtils');
const cookieParser = require('cookie-parser');
const { initSocketHandlers } = require('./utils/socket');
const helmet = require('helmet');
require('./utils/autoUpdateExamStatus'); // For auto-updating exam status


// Import Routes
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const resultRoutes = require('./routes/resultRoutes');
const fileRoutes = require('./routes/fileRoutes');
const exportRoutes = require('./routes/exportRoutes');


// Initialize the app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const PORT = process.env.PORT || 4000;


// Middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://csi-aptitude-portal.onrender.com', // Update this to your frontend URL deployed on Render
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
// app.use("/uploads", express.static(path.resolve("./uploads")));

// utils
app.use(limiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/exams', jwtAuthMiddleware, examRoutes);
app.use('/api/exams/questions', jwtAuthMiddleware, questionsRoutes);
app.use('/api/exams/responses', jwtAuthMiddleware, responseRoutes);
app.use('/api/exams/results', jwtAuthMiddleware, resultRoutes);
app.use('/api/export/', exportRoutes);
app.use('/api', fileRoutes);
app.use('/api/exams/', fileRoutes);

// Initialize Socket.IO handlers
initSocketHandlers(io);

// Ensure a response for the root route
app.get('/', (req, res) => {
  res.send('Server is running!'); // Generic message for Render health checks
});

server.listen(PORT, '0.0.0.0' ,() => {
  console.log(`Server is running at port ${PORT}`);
});
