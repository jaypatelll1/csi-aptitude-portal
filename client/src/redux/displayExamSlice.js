import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  draftExams: [],
  scheduledExams: [],
  liveExams: [],
  pastExams: [],
};

const displayExamSlice = createSlice({
  name: "displayExams",
  initialState,
  reducers: {
    setDraftExams: (state, action) => {
      state.draftExams = action.payload;
    },
    clearDraftExams: (state) => {
      state.draftExams = [];
    },
    setScheduledExams: (state, action) => {
      state.scheduledExams = action.payload;
    },
    clearScheduledExams: (state) => {
      state.scheduledExams = [];
    },
    setLiveExams: (state, action) => {
      state.liveExams = action.payload;
    },
    clearLiveExams: (state) => {
      state.liveExams = [];
    },
    setPastExams: (state, action) => {
      state.pastExams = action.payload;
    },
    clearPastExams: (state) => {
      state.pastExams = [];
    },
  },
});

export const {
  setDraftExams,
  clearDraftExams,
  setLiveExams,
  clearLiveExams,
  setPastExams,
  clearPastExams,
  setScheduledExams,
  clearScheduledExams,
} = displayExamSlice.actions;

export default displayExamSlice.reducer;
