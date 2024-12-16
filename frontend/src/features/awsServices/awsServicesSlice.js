import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  data: {
    ec2: [],
    rds: [],
    apm: null,
    rum: null,
    cloudMetrics: null,
    cpuMetrics: null,
    status: null
  },
  status: 'idle',
  error: null
};

// Fetch AWS Status and Instances
export const fetchAWSStatus = createAsyncThunk(
  'awsServices/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const responses = await Promise.all([
        fetch('http://localhost:5001/api/status'),
        fetch('http://localhost:5001/api/instances'),
        fetch('http://localhost:5001/api/rds-instances')
      ]);

      // Check if any response failed
      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
      }

      const [status, instances, rds] = await Promise.all(
        responses.map(res => res.json())
      );

      return {
        status,
        ec2: instances,
        rds
      };
    } catch (error) {
      console.error('Fetch AWS Status error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Monitoring Metrics
export const fetchAllMetrics = createAsyncThunk(
  'awsServices/fetchAllMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const responses = await Promise.all([
        fetch('http://localhost:5001/api/apm-metrics'),
        fetch('http://localhost:5001/api/rum-metrics')
      ]);

      // Check if any response failed
      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
      }

      const [apm, rum] = await Promise.all(
        responses.map(res => res.json())
      );

      return {
        apm,
        rum
      };
    } catch (error) {
      console.error('Fetch Metrics error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const awsServicesSlice = createSlice({
  name: 'awsServices',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAWSStatus
      .addCase(fetchAWSStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAWSStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = {
          ...state.data,
          ...action.payload
        };
        state.error = null;
      })
      .addCase(fetchAWSStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch AWS data';
      })
      // Handle fetchAllMetrics
      .addCase(fetchAllMetrics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllMetrics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = {
          ...state.data,
          ...action.payload
        };
        state.error = null;
      })
      .addCase(fetchAllMetrics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch metrics';
      });
  },
});

// Actions
export const { clearErrors } = awsServicesSlice.actions;

// Selectors
export const selectEC2Instances = state => state.awsServices.data.ec2 || [];
export const selectRDSInstances = state => state.awsServices.data.rds || [];
export const selectAPMMetrics = state => state.awsServices.data.apm;
export const selectRUMMetrics = state => state.awsServices.data.rum;
export const selectStatus = state => state.awsServices.status;
export const selectError = state => state.awsServices.error;
export const selectAWSStatus = state => state.awsServices.data.status;

export default awsServicesSlice.reducer;