require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Import Routes
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const questionsRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const resultRoutes = require('./routes/resultRoutes');
const fileRoutes = require("./routes/fileRoutes");
const exportRoutes = require("./routes/exportRoutes");

// Initialize the app
const app = express();

// Set port to Render's PORT environment variable or default to 4000
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: 'https://csi-aptitude-portal.onrender.com', // Update this to your frontend URL deployed on Render
  credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exams/questions', questionsRoutes);
app.use('/api/exams/responses', responseRoutes);
app.use('/api/exams/results', resultRoutes);
app.use('/api/export', exportRoutes);
app.use('/', fileRoutes);

// Ensure a response for the root route
app.get('/', (req, res) => {
  res.send('Server is running!'); // Generic message for Render health checks
});

// Start server on all interfaces (0.0.0.0) for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
