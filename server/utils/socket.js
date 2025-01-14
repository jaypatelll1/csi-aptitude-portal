const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
// const {
//   submitResponse,
//   submitFinalResponsesAndChangeStatus,
//   deleteExistingResponses,
//   submittedUnansweredQuestions,
// } = require('../models/responseModel');

const timers = {}; // Store timers per room

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    const user_id = parseInt(socket.user.id);

    // Start an exam
    socket.on('start_exam', async ({ duration }) => {
      if (timers[user_id]) {
        if (timers[user_id].paused && !timers[user_id].submitted) {
          timers[user_id].remainingTime = timers[user_id].pauseTime;
          timers[user_id].pauseTime = null;
        }
      }

      // If a new user's exam is starting, initialize its timer
      else if (!timers[user_id] || timers[user_id].submitted) {
        timers[user_id] = {
          remainingTime: duration,
          interval: null,
          paused: false,
          pauseTime: null,
          submitted: false,
        };
        // await deleteExistingResponses(exam_id, user_id);
        // await submittedUnansweredQuestions(exam_id, user_id);
      }
      
      console.log(`Exam started in room ${user_id} with duration ${timers[user_id].remainingTime}`);

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

            // Notify room that exam ended
            io.to(user_id).emit(
              'exam_ended',
              { message: "Time's up!!" },  () => {
                // const res = await submitFinalResponsesAndChangeStatus(
                //   user_id,
                //   exam_id
                // );
                timers[user_id].submitted = true;
              }
            );
          }
        }, 1000);
      }
    });

    // Handle individual response submissions
    // socket.on(
    //   'submit_temp_response',
    //   async ({ exam_id, question_id, selected_option }) => {
    //     const user_id = parseInt(socket.user.id);

    //     // const r = await submitResponse(
    //     //   user_id,
    //     //   exam_id,
    //     //   question_id,
    //     //   selected_option,
    //     //   'draft'
    //     // );
    //     console.log(`Response saved for user ${user_id}`);
    //   }
    // );

    socket.on('submit_responses', () => {
      const user_id = parseInt(socket.user.id);
      // const res = await submitFinalResponsesAndChangeStatus(user_id, exam_id);

      clearInterval(timers[user_id].interval);
      timers[user_id].submitted = true;
    });

    socket.on('disconnect', () => {
      // console.log(timers[user_id])
      if (!timers[user_id].submitted) {
        timers[user_id].paused = true;
        timers[user_id].pauseTime = timers[user_id].remainingTime;
        console.log('Paused at:', timers[user_id].pauseTime); //
      } else {
        delete timers[user_id];
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { initSocketHandlers };
