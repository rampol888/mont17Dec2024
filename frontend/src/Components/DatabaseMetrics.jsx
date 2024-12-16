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

const DatabaseMetrics = ({ metrics }) => {
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Database Performance
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Read Latency</Typography>
                                <Box height={300}>
                                    <Line
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Database Read Latency'
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Latency (ms)'
                                                    }
                                                }
                                            }
                                        }}
                                        data={{
                                            labels: metrics?.read_latency?.map(m => 
                                                formatTimestamp(m.Timestamp)) || [],
                                            datasets: [{
                                                label: 'Read Latency',
                                                data: metrics?.read_latency?.map(m => 
                                                    m.Average * 1000) || [], // Convert to ms
                                                borderColor: 'rgb(75, 192, 192)',
                                                tension: 0.1
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
                                <Typography variant="subtitle1">Write Latency</Typography>
                                <Box height={300}>
                                    <Line
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Database Write Latency'
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Latency (ms)'
                                                    }
                                                }
                                            }
                                        }}
                                        data={{
                                            labels: metrics?.write_latency?.map(m => 
                                                formatTimestamp(m.Timestamp)) || [],
                                            datasets: [{
                                                label: 'Write Latency',
                                                data: metrics?.write_latency?.map(m => 
                                                    m.Average * 1000) || [], // Convert to ms
                                                borderColor: 'rgb(255, 99, 132)',
                                                tension: 0.1
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

export default DatabaseMetrics; 