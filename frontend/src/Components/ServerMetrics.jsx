import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const ServerMetrics = ({ metrics }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">Server Metrics</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography>CPU: {metrics.CPUUtilization}%</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography>Memory: {metrics.MemoryUtilization}%</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography>Disk: {metrics.DiskUtilization}%</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default ServerMetrics;
