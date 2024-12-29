import { createSlice } from '@reduxjs/toolkit';

// Create a slice to manage exam-related state
const examSlice = createSlice({
  name: 'exam',
  initialState: {
    examId: null,  // Initial state for examId
  },
  reducers: {
    setExamId: (state, action) => {
      state.examId = action.payload;  // Set examId in the Redux state
    },
    clearExamId: (state) => {
      state.examId = null;  // Clear examId from Redux state
    },
  },
});

export const { setExamId, clearExamId } = examSlice.actions;  // Export actions

export default examSlice.reducer;
