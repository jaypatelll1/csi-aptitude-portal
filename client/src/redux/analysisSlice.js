import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overallAnalysis: null, // Stores overall analysis
  departmentAnalysis: {}, // Stores analysis for each department separately
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setOverallAnalysis: (state, action) => {
      state.overallAnalysis = action.payload; // Store overall analysis
    },
    clearOverallAnalysis: (state) => {
      state.overallAnalysis = null; // Clear overall analysis on logout
    },
    setDepartmentAnalysis: (state, action) => {
      const { department, data } = action.payload;
      state.departmentAnalysis[department] = data; // Store data for specific department
    },
    clearDepartmentAnalysis: (state, action) => {
      const { department } = action.payload;
      if (department) {
        delete state.departmentAnalysis[department]; // Clear specific department data
      } else {
        state.departmentAnalysis = {}; // Clear all department analysis
      }
    },
  },
});

export const { 
  setOverallAnalysis, 
  clearOverallAnalysis, 
  setDepartmentAnalysis, 
  clearDepartmentAnalysis 
} = analysisSlice.actions;

export default analysisSlice.reducer;
