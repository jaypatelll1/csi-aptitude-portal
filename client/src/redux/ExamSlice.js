import { createSlice } from "@reduxjs/toolkit";

// Create a slice to manage exam-related state
const examSlice = createSlice({
  name: "exam",
  initialState: {
    examId: null, // Initial state for examId
    exam: null,
    submittedExamIds: null,
    tabSwitchCount: 0, // Add tab switch count to exam state
  },
  reducers: {
    setExamId: (state, action) => {
      state.examId = action.payload; // Set examId in the Redux state
    },
    setExam: (state, action) => {
      state.exam = action.payload; // Set exam in the Redux state
    },
    setDuration: (state, action) => {
      state.time = action.payload; // Set exam in the Redux state
    },

    markVisited(state, action) {
      state.question_count = action.payload;
    },
    
    // Tab switch management reducers
    incrementTabSwitchCount: (state) => {
      state.tabSwitchCount += 1;
    },
    resetTabSwitchCount: (state) => {
      state.tabSwitchCount = 0;
    },
    setTabSwitchCount: (state, action) => {
      state.tabSwitchCount = action.payload;
    },
    
    clearExamId: (state) => {
      state.examId = null; // Clear examId from Redux state
      state.time = null;
      state.exam = null;
      state.tabSwitchCount = 0; // Reset tab switch count when clearing exam
    },
  },
});

export const { 
  setExamId, 
  clearExamId, 
  setExam, 
  setDuration,
  incrementTabSwitchCount,
  resetTabSwitchCount,
  setTabSwitchCount 
} = examSlice.actions; // Export actions

export default examSlice.reducer;