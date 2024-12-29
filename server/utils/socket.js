const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const {
  submitResponse,
  submitFinalResponsesAndChangeStatus,
} = require('../models/responseModel');

const timers = {}; // Store timers per room

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Start an exam
    socket.on('start_exam', ({ exam_id, duration }) => {
      const user_id = parseInt(socket.user.id);
      console.log(`Exam started in room ${user_id} with duration ${duration}`);

      // If a new exam is starting, initialize its timer
      if (!timers[user_id]) {
        timers[user_id] = { remainingTime: duration, interval: null };
      }

      socket.join(user_id, () => {
        console.log(`Student joined room ${user_id}`);
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
            io.to(user_id).emit('exam_ended', {message: "Time's up!!"}, async () => {
              const res = await submitFinalResponsesAndChangeStatus(user_id, exam_id);
            });
          }
        }, 1000);
      }
    });

    // Handle individual response submissions
    socket.on(
      'submit_temp_response',
      async ({ exam_id, question_id, selected_option }) => {
        const user_id = parseInt(socket.user.id);

        const r = await submitResponse(
          user_id,
          exam_id,
          question_id,
          selected_option,
          'draft'
        );
        console.log(`Response saved for user ${user_id}`);
      }
    );

    socket.on('submit_responses', {message: "Submitted!!"}, async ({ exam_id }) => {
      const user_id = parseInt(socket.user.id);
      const res = await submitFinalResponsesAndChangeStatus(user_id, exam_id);

      clearInterval(timers[user_id].interval);
      delete timers[user_id];
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { initSocketHandlers };

// TO DO
// 1. Whenever next button is clicked, response is stored in db as 'draft'.
// 2. Whenever Student clicks on 'Submit', response_status is changed to 'submitted'.
// 3. Whenever Timer runs out, student's responses' response_status is changed to 'submitted'.
