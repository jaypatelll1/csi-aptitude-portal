import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import questionReducer from "./questionSlice";
import userReducer from "./userSlice";
import examReducer from './ExamSlice';
// import submitReducer from './SubmitSlice'

const userPersistConfig = {
  key: "user",
  storage,
};
const examPersistConfig = {
  key: "exam",

  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

const persistedExamReducer = persistReducer(examPersistConfig, examReducer);

const store = configureStore({
  reducer: {
    questions: questionReducer, // Existing reducer for questions
    user: persistedUserReducer, // Persisted user reducer
    exam: persistedExamReducer, 
    // Submit : submitReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);
export default store;
