import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  AllExams: [],
  errors: null,
  loading: false,
  comments: [],
};

const FetchTeacherExam = createAsyncThunk(
  "fetch/teacherExams",
  async (data, { rejectWithValue }) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(
        `${API_BASE_URL}/api/exams/teacher-results/correct-incorrect/${data.exam_id}/${data.teacher_id}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher exam results:", error);
      return rejectWithValue(error.response.data);
    }
  }
);

const TeacherExamSlice = createSlice({
  initialState,
  name: "teacherExam",
  reducers: {
    storeComments: (state, action) => {
      const existingIndex = state.comments.findIndex(
        (comment) => comment.questionId === action.payload.questionId
      );
      if (existingIndex !== -1) {
        state.comments[existingIndex] = action.payload;
      } else {
        state.comments.push(action.payload);
      }
    },
  },
  extraReducers: (reducer) => {
    reducer.addCase(FetchTeacherExam.fulfilled, (state, action) => {
      state.AllExams = action.payload;
      state.loading = false;
      state.errors = null;
    });
    reducer.addCase(FetchTeacherExam.pending, (state) => {
      state.loading = true;
    });
    reducer.addCase(FetchTeacherExam.rejected, (state, action) => {
      state.loading = false;
      state.errors = action.payload;
    });
  },
});

export { FetchTeacherExam };
export const { storeComments } = TeacherExamSlice.actions;
export default TeacherExamSlice.reducer;
