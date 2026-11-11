import { baseApi } from './baseApi';
import type {
  HoldResponse,
  HoldStatusResponse,
  ConfirmHoldResponse,
  StudentHoldItem,
} from '../types/admission';

export const holdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createHold: builder.mutation<HoldResponse, string>({
      query: (classId) => ({
        url: `/classes/${classId}/holds`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Class', id: 'LIST' },
        { type: 'MyHolds', id: 'LIST' },
      ],
    }),

    getHoldById: builder.query<HoldStatusResponse, string>({
      query: (holdId) => `/holds/${holdId}`,
      providesTags: (_result, _error, id) => [{ type: 'Hold', id }],
    }),

    confirmHold: builder.mutation<ConfirmHoldResponse, string>({
      query: (holdId) => ({
        url: `/holds/${holdId}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, holdId) => [
        { type: 'Hold', id: holdId },
        { type: 'Class', id: 'LIST' },
        { type: 'MyHolds', id: 'LIST' },
      ],
    }),

    cancelHold: builder.mutation<void, string>({
      query: (holdId) => ({
        url: `/holds/${holdId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, holdId) => [
        { type: 'Hold', id: holdId },
        { type: 'Class', id: 'LIST' },
        { type: 'MyHolds', id: 'LIST' },
      ],
    }),

    getMyHolds: builder.query<StudentHoldItem[], void>({
      query: () => '/me/holds',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ holdId }) => ({ type: 'MyHolds' as const, id: holdId })),
              { type: 'MyHolds', id: 'LIST' },
            ]
          : [{ type: 'MyHolds', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateHoldMutation,
  useGetHoldByIdQuery,
  useConfirmHoldMutation,
  useCancelHoldMutation,
  useGetMyHoldsQuery,
} = holdsApi;
