import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage/session";
import questionReducer from "./questionSlice";
import userReducer from "./userSlice";
import examReducer from "./ExamSlice";
import displayExamReducer from "./displayExamSlice";
import analysisSlice from "./analysisSlice";
import teacherExamReducer from "./TeacherExamSlice";

const userPersistConfig = {
  key: "user",
  storage,
};
const analysisPersistConfig = {
  key: "analysis",
  storage,
};
const displayExamPersistConfig = {
  key: "displayExams",
  storage,
};
const QuestionPersistConfig = {
  key: "questions",
  storage,
};
const examPersistConfig = {
  key: "exam",
  storage,
};
const TeacherExamPersistConfig = {
  key: "teacherExam",
  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedExamReducer = persistReducer(examPersistConfig, examReducer);
const persistedDisplayExamReducer = persistReducer(displayExamPersistConfig, displayExamReducer);
const persistedQuestionReducer = persistReducer(QuestionPersistConfig, questionReducer);
const persistedAnalysisReducer = persistReducer(analysisPersistConfig, analysisSlice);
const persistedTeacherExamReducer = persistReducer(TeacherExamPersistConfig, teacherExamReducer);

const store = configureStore({
  reducer: {
    questions: persistedQuestionReducer, // Persisted for questions
    user: persistedUserReducer, // Persisted user reducer
    exam: persistedExamReducer,
    displayExam: persistedDisplayExamReducer,
    analysis: persistedAnalysisReducer,
    teacherExam: persistedTeacherExamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);
export default store;
