import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import estimatesReducer from './slices/estimatesSlice';
import customersReducer from './slices/customersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    estimates: estimatesReducer,
    customers: customersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;