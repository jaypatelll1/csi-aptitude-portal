import { createSlice } from '@reduxjs/toolkit';

const optionsSlice = createSlice({
  name: 'options',
  initialState: {
    selectedOptions: [],
  },
  reducers: {
    setOption: (state, action) => {
      const { questionIndex, option } = action.payload;
      state.selectedOptions[questionIndex] = { option, status: 'answered' };
    },
    markVisited: (state, action) => {
      const questionIndex = action.payload;
      if (!state.selectedOptions[questionIndex]) {
        state.selectedOptions[questionIndex] = { status: 'visited' };
      }
    },
    initializeOptions: (state, action) => {
      state.selectedOptions = Array(action.payload).fill(null); 
    },
  },
});

export const { setOption, markVisited, initializeOptions } = optionsSlice.actions;
export default optionsSlice.reducer;
