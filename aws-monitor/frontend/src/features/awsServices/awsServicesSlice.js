import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:5001';

export const fetchAWSStatus = createAsyncThunk(
  'awsServices/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching AWS status...');
      const response = await fetch(`${API_BASE_URL}/api/status`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error:', errorData);
        return rejectWithValue(errorData?.error || 'API request failed');
      }

      const data = await response.json();
      console.log('AWS status data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  data: null,
  status: 'idle',
  error: null
};

const awsServicesSlice = createSlice({
  name: 'awsServices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAWSStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAWSStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchAWSStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { clearError } = awsServicesSlice.actions;
export default awsServicesSlice.reducer;