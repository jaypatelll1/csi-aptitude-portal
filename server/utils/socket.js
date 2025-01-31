const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const timers = {}; // Store timers per room

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);  // Assuming this middleware sets socket.user_id

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Start an exam
    socket.on('start_exam', async ({ exam_id, duration }) => {
      const user_id = socket.user.id; // Get user_id from socket (set by middleware)
      console.log('user_id', user_id);

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

    // Pause timer
    socket.on('pause_timer', () => {
      const user_id = socket.user.id;

      if (!user_id) {
        console.error('No user_id found on socket during pause');
        return;
      }

      if (timers[user_id] && !timers[user_id].submitted) {
        // Clear the existing interval
        if (timers[user_id].interval) {
          clearInterval(timers[user_id].interval);
          timers[user_id].interval = null;
        }

        // Store the current time and mark as paused
        timers[user_id].paused = true;
        timers[user_id].pauseTime = timers[user_id].remainingTime;

        console.log(`Timer paused for user ${user_id} at time: ${timers[user_id].pauseTime}`);

        // Notify client that timer is paused
        io.to(user_id).emit('timer_paused', {
          remainingTime: timers[user_id].pauseTime
        });
      }
    });

    // Resume timer
    socket.on('resume_timer', () => {
      const user_id = socket.user.id;

      if (!user_id) {
        console.error('No user_id found on socket during resume');
        return;
      }

      if (timers[user_id] && timers[user_id].paused && !timers[user_id].submitted) {
        // Restore time from pauseTime if it exists
        if (timers[user_id].pauseTime !== null) {
          timers[user_id].remainingTime = timers[user_id].pauseTime;
          timers[user_id].pauseTime = null;
        }

        // Clear paused state
        timers[user_id].paused = false;

        // Start a new interval
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

        console.log(`Timer resumed for user ${user_id}`);
        
        // Notify client that timer is resumed
        io.to(user_id).emit('timer_resumed', {
          remainingTime: timers[user_id].remainingTime
        });
      }
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
      const user_id = socket.user.id;

      if (!user_id) {
        console.error('No user_id found on socket during disconnect');
        return;
      }

      if (timers[user_id]) {
        if (!timers[user_id].submitted) {
          // Clear the interval if it exists
          if (timers[user_id].interval) {
            clearInterval(timers[user_id].interval);
            timers[user_id].interval = null;
          }
          
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