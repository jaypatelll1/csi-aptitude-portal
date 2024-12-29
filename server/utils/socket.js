const { submitAllResponses } = require('../controllers/responseController');
const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const timers = {}; // Store timers per room
const responses = {}; // Store responses per room

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Start an exam
    socket.on('start_exam', ({ exam_id, duration }) => {
      const user_id = socket.user.id;
      console.log(`Exam started in room ${user_id} with duration ${duration}`);

      // If a new exam is starting, initialize its timer
      if (!timers[user_id]) {
        timers[user_id] = { remainingTime: duration, interval: null };
      }

      // Initialize the responses of a new exam
      if (!responses[user_id]) {
        responses[user_id] = [];
      }

      socket.join(user_id, () => {
        console.log(`Student joined room ${exam_id}`);
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
            io.to(user_id).emit('exam_ended', { message: "Time's up!" });

            // Save responses to the database
            // submitAllResponses(exam_id, responses[exam_id]);
            delete responses[user_id];
          }
        }, 1000);
      }
    });

    // Handle individual response submissions
    socket.on(
      'submit_response',
      ({ exam_id, question_id, selected_option }) => {
        const user_id = socket.user.id;
        if (responses[user_id]) {
          responses[user_id].push({
            exam_id,
            question_id,
            selected_option,
            submitted_at: new Date().toISOString(),
          });
          console.log(`Response saved for room ${user_id}`);
        }
      }
    );

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

// Save responses to the database (mock function)
// const saveResponsesToDatabase = (exam_id, roomResponses) => {
//   console.log(`Saving responses for room ${exam_id} to database...`);
//   console.log(roomResponses);
// };

module.exports = { initSocketHandlers };

// CLIENT SIDE TO_DO

// When Start Exam button is clicked, socket.emit('start_exam', { roomId: exam_id, duration: exam_duration, student_id: user_id });
// Listen to timer updates and update the timer on the client side socket.on('timer_update', (data) => { console.log(data.remainingTime); });
// listen to even 'exam_ended' and show a message to the student socket.on('exam_ended', (data) => { console.log(data.message); }); Now pass the responses as JSON to the server and call responseContoller.submitAllResponses() to save the responses to the database.
// In the responses[exam_id], save responses by passing student_id, question_id, selected_option and answered_at. So, perform     socket.emit('submit_response', { roomId: exam_id, studentId: user_id, questionId: question_id, selectedOption: selecte_option });
