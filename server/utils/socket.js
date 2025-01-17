const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const {
  submitResponse,
  submitFinalResponsesAndChangeStatus,
  deleteExistingResponses,
  submittedUnansweredQuestions,
} = require('../models/responseModel');

const timers = {}; // Store timers per room

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Start an exam
    socket.on('start_exam', async ({ exam_id, duration }) => {
      const user_id = parseInt(socket.user.id);
      console.log(`Exam started in room ${user_id} with duration ${duration}`);

      // If a new user's exam is starting, initialize its timer
      if (!timers[user_id]) {
        timers[user_id] = { remainingTime: duration, interval: null };
        await deleteExistingResponses(exam_id, user_id)
        await submittedUnansweredQuestions(exam_id, user_id)
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

    socket.on('submit_responses', async ({ exam_id }) => {
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

// SERVER_TO-DO
// 1. Whenever next button is clicked, response is stored in db as 'draft'.
// 2. Whenever Student clicks on 'Submit', response_status is changed to 'submitted'.
// 3. Whenever Timer runs out, student's responses' response_status is changed to 'submitted'.


// CLIENT TO-DO
// io.emit('connection') -> To request socket.io connection upgrade
// io.emit('start_exam') -> To start the exam timer when clicked on 'Start Exam' button
// io.on('timer_update') -> To update timer every second (updated time will be sent back every second)
// io.on('exam_ended') -> To submit all responses automatically when time's up
// io.emit('submit_temp_response') -> To store the student responses as 'draft' in the database
// io.emit('submit_responses') -> To save the responses as 'submitted' if the student clicks the 'Submit' button before exam ends
// io.emit('disconnect') -> To disconnect the socket.io connection

// For req body, refer POSTMAN