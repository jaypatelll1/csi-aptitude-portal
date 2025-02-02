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
    
      // Debugging log to track when a question is visited
      // console.log(`Visiting question: ${questionIndex}`);
    
      // Mark the specific question as visited if it's not visited yet
      const currentQuestion = state.questions[questionIndex];
      if (!currentQuestion.visited) {
        // console.log(`Marking question ${questionIndex} as visited`);
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

export const { setQuestions, markAnswered, visitQuestion, setSelectedOption ,clearQuestions} =
  questionsSlice.actions;
export default questionsSlice.reducer;
