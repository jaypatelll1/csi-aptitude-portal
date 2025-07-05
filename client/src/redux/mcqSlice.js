import { createSlice } from '@reduxjs/toolkit';

const mcqSlice = createSlice({
  name: 'mcq',
  initialState: {
    mcqSets: [], // Array of MCQ sets
    isGenerating: false,
    error: null,
  },
  reducers: {
    setGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addMcqSet: (state, action) => {
      const newSet = {
        id: Date.now() + Math.random(), // Unique ID
        timestamp: new Date().toISOString(),
        topic: action.payload.topic,
        difficulty: action.payload.difficulty,
        questionType: action.payload.questionType,
        mcqs: action.payload.mcqs,
        fileName: action.payload.fileName || null,
      };
      state.mcqSets.unshift(newSet); // Add to beginning
    },
    deleteMcqSet: (state, action) => {
      state.mcqSets = state.mcqSets.filter(set => set.id !== action.payload);
    },
    clearAllMcqSets: (state) => {
      state.mcqSets = [];
    },
    updateMcqSet: (state, action) => {
      const { id, updates } = action.payload;
      const setIndex = state.mcqSets.findIndex(set => set.id === id);
      if (setIndex !== -1) {
        state.mcqSets[setIndex] = { ...state.mcqSets[setIndex], ...updates };
      }
    },
  },
});

export const {
  setGenerating,
  setError,
  addMcqSet,
  deleteMcqSet,
  clearAllMcqSets,
  updateMcqSet,
} = mcqSlice.actions;

export default mcqSlice.reducer;