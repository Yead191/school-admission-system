import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'school_admission_student_id';

interface AuthState {
  studentId: string;
  isValidStudentId: boolean;
}

const initialId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || '' : '';

const initialState: AuthState = {
  studentId: initialId,
  isValidStudentId: /^\d{17}$/.test(initialId),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setStudentId: (state, action: PayloadAction<string>) => {
      const cleanId = action.payload.trim();
      state.studentId = cleanId;
      state.isValidStudentId = /^\d{17}$/.test(cleanId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, cleanId);
      }
    },
    clearStudentId: (state) => {
      state.studentId = '';
      state.isValidStudentId = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});

export const { setStudentId, clearStudentId } = authSlice.actions;
export default authSlice.reducer;
