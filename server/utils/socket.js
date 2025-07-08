const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
// const {
//   submitResponse,
//   submitFinalResponsesAndChangeStatus,
//   deleteExistingResponses,
//   submittedUnansweredQuestions,
// } = require('../models/responseModel');

const timers = {}; // Store timers per user-exam session (key = `${user_id}-${exam_id}`)

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware); // Enable JWT auth middleware if available

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    const user_id = parseInt(socket.user.id);

    socket.on('start_exam', async ({ exam_id, duration }) => {
      const sessionKey = `${user_id}-${exam_id}`;
      const existingTimer = timers[sessionKey];

      // Check if exam already started from another tab/device
      if (existingTimer && !existingTimer.submitted && !existingTimer.paused) {
        console.log(`🚫 Duplicate session detected for ${sessionKey}`);
        socket.emit('already_active', {
          message:
            'You are already attempting this exam from another tab or device.',
        });
        return;
      }

      // Resume or restart session
      if (existingTimer) {
        if (existingTimer.submitted) {
          timers[sessionKey] = {
            remainingTime: duration,
            interval: null,
            paused: false,
            pauseTime: null,
            submitted: false,
          };
        } else if (existingTimer.paused) {
          existingTimer.remainingTime = existingTimer.pauseTime;
          existingTimer.pauseTime = null;
          existingTimer.paused = false;
        }
      } else {
        // Start new session
        timers[sessionKey] = {
          remainingTime: duration,
          interval: null,
          paused: false,
          pauseTime: null,
          submitted: false,
        };

        // Optional: clear any existing draft responses
        // await deleteExistingResponses(exam_id, user_id);
        // await submittedUnansweredQuestions(exam_id, user_id);
      }

      socket.join(user_id); // Join room to receive events

      // Timer setup
      if (!timers[sessionKey].interval) {
        timers[sessionKey].interval = setInterval(() => {
          timers[sessionKey].remainingTime--;

          io.to(user_id).emit('timer_update', {
            exam_id,
            remainingTime: timers[sessionKey].remainingTime,
          });

          if (timers[sessionKey].remainingTime <= 0) {
            clearInterval(timers[sessionKey].interval);

            io.to(user_id).emit(
              'exam_ended',
              { message: "⏰ Time's up!!" },
              () => {
                timers[sessionKey].submitted = true;
                console.log(`✅ Auto-submitted exam ${exam_id} for user ${user_id}`);
                // await submitFinalResponsesAndChangeStatus(user_id, exam_id);
              }
            );
          }
        }, 1000);
      }

      console.log(
        `▶️ Exam ${exam_id} started for user ${user_id} (duration ${duration}s)`
      );
    });

    // Manual submission
    socket.on('submit_responses', ({ exam_id }) => {
      const sessionKey = `${user_id}-${exam_id}`;
      if (timers[sessionKey]) {
        clearInterval(timers[sessionKey].interval);
        timers[sessionKey].submitted = true;
        console.log(`📨 Manual submission for exam ${exam_id}, user ${user_id}`);
        // await submitFinalResponsesAndChangeStatus(user_id, exam_id);
      }
    });

    // Handle disconnect — pause active exams
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      for (const sessionKey in timers) {
        if (sessionKey.startsWith(`${user_id}-`)) {
          if (!timers[sessionKey].submitted) {
            timers[sessionKey].paused = true;
            timers[sessionKey].pauseTime = timers[sessionKey].remainingTime;
            clearInterval(timers[sessionKey].interval);
            timers[sessionKey].interval = null;
            console.log(`⏸️ Paused session ${sessionKey} at ${timers[sessionKey].pauseTime}s`);
          }
        }
      }
    });
  });
};

module.exports = { initSocketHandlers };
