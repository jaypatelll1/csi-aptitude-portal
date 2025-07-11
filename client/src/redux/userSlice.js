import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Holds user data
  
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; // Store user data
    },
    clearUser: (state) => {
      state.user = null; // Clear user data on logout
    },
    setSubmitTestUser :(state,action)=>{
      state.exam = action.payload
    },
  },
});

export const { setUser, clearUser,setSubmitTestUser } = userSlice.actions;
export default userSlice.reducer;
