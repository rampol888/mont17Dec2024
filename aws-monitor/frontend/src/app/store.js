import { configureStore } from '@reduxjs/toolkit';
import awsServicesReducer from '../features/awsServices/awsServicesSlice';

export const store = configureStore({
  reducer: {
    awsServices: awsServicesReducer,
  },
});