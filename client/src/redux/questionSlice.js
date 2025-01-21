import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions(state, action) {
      state.questions = action.payload;
    },
    markAnswered(state, action) {
      state.questions[action.payload].answered = true;
    },
    visitQuestion(state, action) {
      const questionIndex = action.payload;
    
      state.currentQuestionIndex = questionIndex;
      state.questions[action.payload].visited = true;
      if (!state.questions[questionIndex].visited) {
        state.questions[questionIndex].visited = true;
      }
    },
    setSelectedOption(state, action) {
      const { index, option } = action.payload;
      state.questions[index].selectedOption = option;
      state.questions[index].answered = true;
    },
    clearQuestions(state,action){
      state.questions =[];
      state.currentQuestionIndex = 0
    }, 
  },
});

export const { setQuestions, markAnswered, visitQuestion, setSelectedOption } =
  questionsSlice.actions;
export default questionsSlice.reducer;
