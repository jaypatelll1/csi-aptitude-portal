const { sockettAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
// const { submitFinalResponsesAndChangeStatus } = require('../models/responseModel');

const activeSessions = new Map(); // sessionKey => { remainingTime, interval, submitted }
const pausedSessions = new Map(); // sessionKey => remainingTime

const initSocketHandlers = (io) => {
  io.use(sockettAuthMiddleware);

  io.on('connection', (socket) => {
    const user_id = parseInt(socket.user.id);
    console.log('🔌 New client connected:', socket.id, `(User ID: ${user_id})`);

    socket.on('start_exam', ({ exam_id, duration }) => {
      const sessionKey = `${user_id}-${exam_id}`;

      // 🚫 Prevent multiple active sessions

      console.log(activeSessions)
      if (activeSessions.has(sessionKey)) {
        socket.emit('already_active', {
          message: 'You are already attempting this exam from another tab or device.',
        });
        return;
      }

      let remainingTime = duration;

      // ♻️ Resume if paused
      if (pausedSessions.has(sessionKey)) {
        remainingTime = pausedSessions.get(sessionKey);
        pausedSessions.delete(sessionKey);
        console.log(`🔁 Resuming paused session ${sessionKey} with ${remainingTime}s`);
      } else {
        console.log(`▶️ Starting new session ${sessionKey} with duration ${duration}s`);
        // Optionally clean drafts:
        // await deleteExistingResponses(exam_id, user_id);
      }

      // ✅ Immediately lock session to prevent race conditions
      activeSessions.set(sessionKey, {
        remainingTime,
        interval: null,
        submitted: false,
      });

      socket.join(user_id);

      // ⏱️ Start the countdown
      const interval = setInterval(() => {
        const session = activeSessions.get(sessionKey);
        if (!session) return;

        session.remainingTime--;

        io.to(user_id).emit('timer_update', {
          remainingTime: session.remainingTime,
        });

        if (session.remainingTime <= 0) {
          clearInterval(session.interval);
          session.submitted = true;

          io.to(user_id).emit('exam_ended', {
            message: "⏰ Time's up!!",
          });

          console.log(`✅ Auto-submitted exam ${exam_id} for user ${user_id}`);
          // await submitFinalResponsesAndChangeStatus(user_id, exam_id);
        }
      }, 1000);

      // 🛠️ Patch interval back into session map
      const session = activeSessions.get(sessionKey);
      if (session) session.interval = interval;
    });

    socket.on('submit_responses', ({ exam_id }) => {
      const sessionKey = `${user_id}-${exam_id}`;
      const session = activeSessions.get(sessionKey);

      if (session) {
        clearInterval(session.interval);
        session.submitted = true;
        activeSessions.delete(sessionKey);
        pausedSessions.delete(sessionKey); // ensure clean

        console.log(`📨 Manual submission for ${sessionKey}`);
        // await submitFinalResponsesAndChangeStatus(user_id, exam_id);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      for (const [sessionKey, session] of activeSessions.entries()) {
        if (sessionKey.startsWith(`${user_id}-`) && !session.submitted) {
          clearInterval(session.interval);
          activeSessions.delete(sessionKey);
          pausedSessions.set(sessionKey, session.remainingTime);

          console.log(`⏸️ Paused session ${sessionKey} at ${session.remainingTime}s`);

          // ⌛ Auto-expire paused session after 5 mins
          setTimeout(() => {
            if (pausedSessions.has(sessionKey)) {
              console.log(`🗑️ Expiring paused session: ${sessionKey}`);
              pausedSessions.delete(sessionKey);
            }
          }, 5 * 60 * 1000); // 5 minutes
        }
      }
    });
  });
};

module.exports = { initSocketHandlers };
