import { configureStore } from "@reduxjs/toolkit";
import questionReducer from "./questionSlice";

const store = configureStore({
  reducer: {
    questions: questionReducer,
  },
});

export default store;
