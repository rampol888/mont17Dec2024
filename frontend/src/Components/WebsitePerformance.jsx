import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Box,
    CircularProgress
} from '@mui/material';
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
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorIcon from '@mui/icons-material/Error';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import DataUsageIcon from '@mui/icons-material/DataUsage';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const WebsitePerformance = ({ performanceData }) => {
    if (!performanceData) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const responseTimeData = {
        labels: performanceData.responseTime.average.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        ),
        datasets: [
            {
                label: 'Average Response Time',
                data: performanceData.responseTime.average.map(point => point.value),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Maximum Response Time',
                data: performanceData.responseTime.maximum.map(point => point.value),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    const errorRateData = {
        labels: performanceData.errorRate.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        ),
        datasets: [{
            label: 'Error Rate',
            data: performanceData.errorRate.map(point => point.value),
            borderColor: 'rgb(255, 159, 64)',
            tension: 0.1
        }]
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Website Performance Analysis
                </Typography>
                <Grid container spacing={3}>
                    {/* Response Time Chart */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <SpeedIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Response Time</Typography>
                                </Box>
                                <Line options={chartOptions} data={responseTimeData} />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Error Rate Chart */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Error Rate</Typography>
                                </Box>
                                <Line options={chartOptions} data={errorRateData} />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Requests */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <NetworkCheckIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Request Volume</Typography>
                                </Box>
                                <Typography variant="h4">
                                    {performanceData.requests.reduce((sum, point) => sum + point.value, 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary">Total Requests (24h)</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Bandwidth */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <DataUsageIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Bandwidth Usage</Typography>
                                </Box>
                                <Typography variant="h4">
                                    {formatBytes(performanceData.bandwidth.reduce((sum, point) => sum + point.value, 0))}
                                </Typography>
                                <Typography color="textSecondary">Total Bandwidth (24h)</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default WebsitePerformance; 