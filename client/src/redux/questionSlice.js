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
    setSelectedOption: (state, action) => {
      const { index, option, answered = false, cleared = false } = action.payload;
      if (state.questions[index]) {
        state.questions[index].selectedOption = option;
        state.questions[index].answered = answered;
        state.questions[index].cleared = cleared;
        state.questions[index].visited = true;
        // Reset cleared flag when new option is selected
        if (option !== null && option !== undefined) {
          state.questions[index].cleared = false;
        }
      }
    },
    setMultipleSelectedOption: (state, action) => {
      const { index, options, answered = false, cleared = false } = action.payload;
      if (state.questions[index]) {
        state.questions[index].selectedOptions = options;
        state.questions[index].answered = answered;
        state.questions[index].cleared = cleared;
        state.questions[index].visited = true;
        // Reset cleared flag when new options are selected
        if (options && options.length > 0) {
          state.questions[index].cleared = false;
        }
      }
    },
    setTextAnswer: (state, action) => {
      const { index, text, answered = false, cleared = false } = action.payload;
      if (state.questions[index]) {
        state.questions[index].textAnswer = text;
        state.questions[index].answered = answered;
        state.questions[index].cleared = cleared;
        state.questions[index].visited = true;
        // Reset cleared flag when text is entered
        if (text && text.trim() !== "") {
          state.questions[index].cleared = false;
        }
      }
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
    clearResponse: (state, action) => {
      const { index } = action.payload;
      if (state.questions[index]) {
        state.questions[index].selectedOption = null;
        state.questions[index].selectedOptions = [];
        state.questions[index].textAnswer = "";
        state.questions[index].answered = false;
        state.questions[index].cleared = true;
      }
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
  clearAnswer,
  clearResponse,
  clearQuestions,
  toggleMarkForReview,
} = questionsSlice.actions;

export default questionsSlice.reducer;