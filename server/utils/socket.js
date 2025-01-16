const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const {
  submitResponse,
  submitFinalResponsesAndChangeStatus,
  deleteExistingResponses,
  submittedUnansweredQuestions,
} = require('../models/responseModel');

const timers = {}; // Store timers per room

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);  // Assuming this middleware sets socket.user_id

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Start an exam
    socket.on('start_exam', async ({ exam_id, duration }) => {
      const user_id = socket.user.id; // Get user_id from socket (set by middleware)
console.log('user_id',user_id);

      if (!user_id) {
        console.error('No user_id found on socket');
        return;
      }

      if (timers[user_id]) {
        if (timers[user_id].paused && !timers[user_id].submitted) {
          timers[user_id].remainingTime = timers[user_id].pauseTime;
          timers[user_id].pauseTime = null;
        }
      } else {
        // If a new user's exam is starting, initialize its timer
        timers[user_id] = {
          remainingTime: duration,
          interval: null,
          paused: false,
          pauseTime: null,
          submitted: false,
        };
        await deleteExistingResponses(exam_id, user_id);
        await submittedUnansweredQuestions(exam_id, user_id);
      }

      console.log(`Exam started for user ${user_id} with duration ${timers[user_id].remainingTime}`);

      socket.join(user_id, () => {
        console.log(`Student ${user_id} joined room`);
      });

      // Sets timer if not already set
      if (!timers[user_id].interval) {
        timers[user_id].interval = setInterval(() => {
          timers[user_id].remainingTime--;

          io.to(user_id).emit('timer_update', {
            remainingTime: timers[user_id].remainingTime,
          });

          if (timers[user_id].remainingTime <= 0) {
            clearInterval(timers[user_id].interval);
            delete timers[user_id];

            // Notify room that exam ended
            io.to(user_id).emit('exam_ended', { message: "Time's up!!" });
          }
        }, 1000);
      }
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
      const user_id = socket.user.id; // Get user_id from socket (set by middleware)

      if (!user_id) {
        console.error('No user_id found on socket during disconnect');
        return;
      }

      if (timers[user_id]) {
        if (!timers[user_id].submitted) {
          timers[user_id].paused = true;
          timers[user_id].pauseTime = timers[user_id].remainingTime;
          console.log(`Paused timer for user ${user_id} at time: ${timers[user_id].pauseTime}`);
        } else {
          delete timers[user_id];
        }
      }

      console.log('Client disconnected:', socket.user.id);
    });
  });
};

module.exports = { initSocketHandlers };
