import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const APMDashboard = ({ metrics }) => {
    const chartIds = {
        responseTime: 'response-time-chart',
        errorRate: 'error-rate-chart'
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Application Performance</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Response Time</Typography>
                                <Box height={300}>
                                    <Line
                                        id={chartIds.responseTime}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false
                                        }}
                                        data={{
                                            labels: metrics?.responseTimes?.map(m => m.timestamp) || [],
                                            datasets: [{
                                                label: 'Avg Response Time (ms)',
                                                data: metrics?.responseTimes?.map(m => m.value) || [],
                                                borderColor: 'rgb(75, 192, 192)',
                                            }]
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Error Rate</Typography>
                                <Box height={300}>
                                    <Line
                                        id={chartIds.errorRate}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false
                                        }}
                                        data={{
                                            labels: metrics?.errorRates?.map(m => m.timestamp) || [],
                                            datasets: [{
                                                label: 'Error Rate (%)',
                                                data: metrics?.errorRates?.map(m => m.value) || [],
                                                borderColor: 'rgb(255, 99, 132)',
                                            }]
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default APMDashboard; 