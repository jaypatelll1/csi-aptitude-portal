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

      // Mark the specific question as visited if it's not visited yet
      const currentQuestion = state.questions[questionIndex];
      if (!currentQuestion.visited) {
        state.questions[questionIndex].visited = true;
      }
    },
    setSelectedOption(state, action) {
      const { index, option } = action.payload;
      state.questions[index].selectedOption = option;
      state.questions[index].answered = true;
      state.questions[index].visited = true;
    },
    setMultipleSelectedOption(state, action) {
      const { index, options } = action.payload;
      state.questions[index].selectedOptions = options;
      state.questions[index].answered = true;
      state.questions[index].visited = true;
    },
    setTextAnswer(state, action) {
      const { index, text } = action.payload;
      state.questions[index].textAnswer = text;
      state.questions[index].answered = true;
      state.questions[index].visited = true;
    },
    clearAnswer(state, action) {
      const index = action.payload;
      const question = state.questions[index];
      
      // Clear the selected option(s)
      if (question.selectedOption !== undefined) {
        delete question.selectedOption;
      }
      if (question.selectedOptions !== undefined) {
        delete question.selectedOptions;
      }
      if (question.textAnswer !== undefined) {
        delete question.textAnswer;
      }

      // Mark as not answered, but keep as visited
      question.answered = false;
      question.visited = true;
      question.markedForReview = false;
    },
    toggleMarkForReview: (state, action) => {
      const index = action.payload;
      if (state.questions[index]) {
        state.questions[index].markedForReview = !state.questions[index].markedForReview;
      }
    },
    clearQuestions(state) {
      state.questions = [];
      state.currentQuestionIndex = 0;
    },
  },
});

export const {
  setQuestions,
  markAnswered,
  visitQuestion,
  setSelectedOption,
  setMultipleSelectedOption,
  setTextAnswer,
  clearQuestions,
  toggleMarkForReview,
  clearAnswer,
} = questionsSlice.actions;

export default questionsSlice.reducer;