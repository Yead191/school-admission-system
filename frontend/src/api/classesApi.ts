import { baseApi } from './baseApi';
import type { ClassItem, CreateClassPayload, CreateClassResponse } from '../types/admission';

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<ClassItem[], void>({
      query: () => '/classes',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Class' as const, id })),
              { type: 'Class', id: 'LIST' },
            ]
          : [{ type: 'Class', id: 'LIST' }],
    }),

    getClassById: builder.query<ClassItem, string>({
      query: (classId) => `/classes/${classId}`,
      providesTags: (_result, _error, id) => [{ type: 'Class', id }],
    }),

    createClass: builder.mutation<CreateClassResponse, CreateClassPayload>({
      query: (body) => ({
        url: '/classes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Class', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClassesQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
} = classesApi;
