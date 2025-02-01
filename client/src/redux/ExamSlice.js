import { createSlice } from '@reduxjs/toolkit';

// Create a slice to manage exam-related state
const examSlice = createSlice({
  name: 'exam',
  initialState: {
    examId: null,  // Initial state for examId
    exam : null,
    submittedExamIds: null,
 
  
 
  },
  reducers: {
    setExamId: (state, action) => {
      state.examId = action.payload;  // Set examId in the Redux state
    },
    setExam :(state,action)=>{
state.exam = action.payload ;  // Set exam in the Redux state
    },
    setDuration :(state,action)=>{
state.time = action.payload ;  // Set exam in the Redux state
    },

    markVisited (state,action){
      

      state.question_count = action.payload ;
    },
    clearExamId: (state) => {
      state.examId = null;  // Clear examId from Redux state
    state.time = null ;
     state.exam = null ;
 
    },
  },
});

export const { setExamId, clearExamId ,setExam , setDuration } = examSlice.actions;  // Export actions

export default examSlice.reducer;
