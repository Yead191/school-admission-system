import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get studentId from Redux store or fallback to localStorage
      const state = getState() as RootState;
      const studentId = state.auth?.studentId || localStorage.getItem('school_admission_student_id');

      if (studentId) {
        headers.set('X-Student-Id', studentId);
      }

      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Class', 'Hold', 'MyHolds'],
  endpoints: () => ({}),
});

