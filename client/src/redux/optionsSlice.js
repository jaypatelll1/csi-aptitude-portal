import { createSlice } from '@reduxjs/toolkit';

const optionsSlice = createSlice({
  name: 'options',
  initialState: {
    selectedOptions: [],
  },
  reducers: {
    setOption: (state, action) => {
      const { questionIndex, option } = action.payload;
      state.selectedOptions[questionIndex] = option;
    },
    initializeOptions: (state, action) => {
      state.selectedOptions = Array(action.payload).fill(null); 
    },
  },
});

export const { setOption, initializeOptions } = optionsSlice.actions;
export default optionsSlice.reducer;
