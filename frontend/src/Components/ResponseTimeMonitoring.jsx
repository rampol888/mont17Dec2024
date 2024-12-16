import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    CircularProgress,
    useTheme
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
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import RouterIcon from '@mui/icons-material/Router';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ResponseTimeMonitoring = ({ metrics }) => {
    const theme = useTheme();

    if (!metrics) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `${value}ms`
                }
            }
        }
    };

    const getLatencyColor = (value) => {
        if (value > 1000) return theme.palette.error.main;
        if (value > 500) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Response Time Monitoring
                </Typography>

                <Grid container spacing={3}>
                    {/* API Latency Overview */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <TimerIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">API Response Time</Typography>
                                </Box>
                                <Typography 
                                    variant="h4" 
                                    color={getLatencyColor(metrics.apiLatency.current)}
                                >
                                    {Math.round(metrics.apiLatency.current)}ms
                                </Typography>
                                <Line 
                                    options={chartOptions}
                                    data={{
                                        labels: metrics.apiLatency.history.average.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [
                                            {
                                                label: 'Average',
                                                data: metrics.apiLatency.history.average.map(point => point.value),
                                                borderColor: theme.palette.primary.main,
                                                tension: 0.1
                                            },
                                            {
                                                label: 'Maximum',
                                                data: metrics.apiLatency.history.maximum.map(point => point.value),
                                                borderColor: theme.palette.error.main,
                                                tension: 0.1
                                            },
                                            {
                                                label: 'Minimum',
                                                data: metrics.apiLatency.history.minimum.map(point => point.value),
                                                borderColor: theme.palette.success.main,
                                                tension: 0.1
                                            }
                                        ]
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Integration Latency */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <SpeedIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Integration Latency</Typography>
                                </Box>
                                <Typography 
                                    variant="h4" 
                                    color={getLatencyColor(metrics.integrationLatency.current)}
                                >
                                    {Math.round(metrics.integrationLatency.current)}ms
                                </Typography>
                                <Line 
                                    options={chartOptions}
                                    data={{
                                        labels: metrics.integrationLatency.history.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [{
                                            label: 'Integration Latency',
                                            data: metrics.integrationLatency.history.map(point => point.value),
                                            borderColor: theme.palette.secondary.main,
                                            tension: 0.1
                                        }]
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Endpoint Latency */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <RouterIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Endpoint Response Times</Typography>
                                </Box>
                                <Line 
                                    options={chartOptions}
                                    data={{
                                        labels: metrics.endpointLatency.endpoint1.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [
                                            {
                                                label: 'Endpoint 1',
                                                data: metrics.endpointLatency.endpoint1.map(point => point.value),
                                                borderColor: theme.palette.info.main,
                                                tension: 0.1
                                            }
                                        ]
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ResponseTimeMonitoring; 