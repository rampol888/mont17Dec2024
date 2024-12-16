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
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const RUMDashboard = ({ metrics }) => {
    const chartIds = {
        pageLoad: 'page-load-chart',
        sessions: 'sessions-chart',
        browsers: 'browsers-chart'
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Real User Monitoring</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Page Load Time</Typography>
                                <Box height={300}>
                                    <Line
                                        id={chartIds.pageLoad}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false
                                        }}
                                        data={{
                                            labels: metrics?.pageLoads?.map(m => m.timestamp) || [],
                                            datasets: [{
                                                label: 'Load Time (s)',
                                                data: metrics?.pageLoads?.map(m => m.value) || [],
                                                borderColor: 'rgb(53, 162, 235)',
                                            }]
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">User Sessions</Typography>
                                <Box height={300}>
                                    <Line
                                        id={chartIds.sessions}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false
                                        }}
                                        data={{
                                            labels: metrics?.sessions?.map(m => m.timestamp) || [],
                                            datasets: [{
                                                label: 'Active Sessions',
                                                data: metrics?.sessions?.map(m => m.value) || [],
                                                borderColor: 'rgb(75, 192, 192)',
                                            }]
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Browser Distribution</Typography>
                                <Box height={300}>
                                    <Pie
                                        id={chartIds.browsers}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false
                                        }}
                                        data={{
                                            labels: metrics?.browsers?.map(b => b.name) || [],
                                            datasets: [{
                                                data: metrics?.browsers?.map(b => b.count) || [],
                                                backgroundColor: [
                                                    'rgb(255, 99, 132)',
                                                    'rgb(54, 162, 235)',
                                                    'rgb(255, 205, 86)'
                                                ],
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

export default RUMDashboard; 