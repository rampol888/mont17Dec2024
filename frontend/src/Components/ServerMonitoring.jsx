import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    CircularProgress,
    LinearProgress,
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
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SpeedIcon from '@mui/icons-material/Speed';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ServerMonitoring = ({ metrics }) => {
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
                max: 100
            }
        }
    };

    const getStatusColor = (value) => {
        if (value >= 90) return theme.palette.error.main;
        if (value >= 70) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Server Monitoring
                </Typography>

                <Grid container spacing={3}>
                    {/* CPU Usage */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <SpeedIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">CPU Usage</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="h4" color={getStatusColor(metrics.cpu.current)}>
                                        {Math.round(metrics.cpu.current)}%
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={metrics.cpu.current}
                                        sx={{ 
                                            mt: 1, 
                                            height: 10, 
                                            borderRadius: 5,
                                            backgroundColor: theme.palette.grey[200],
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getStatusColor(metrics.cpu.current)
                                            }
                                        }}
                                    />
                                </Box>
                                <Line 
                                    options={chartOptions} 
                                    data={{
                                        labels: metrics.cpu.history.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [{
                                            label: 'CPU Usage',
                                            data: metrics.cpu.history.map(point => point.value),
                                            borderColor: theme.palette.primary.main,
                                            tension: 0.1
                                        }]
                                    }} 
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Memory Usage */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <MemoryIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Memory Usage</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="h4" color={getStatusColor(metrics.memory.current)}>
                                        {Math.round(metrics.memory.current)}%
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={metrics.memory.current}
                                        sx={{ 
                                            mt: 1, 
                                            height: 10, 
                                            borderRadius: 5,
                                            backgroundColor: theme.palette.grey[200],
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getStatusColor(metrics.memory.current)
                                            }
                                        }}
                                    />
                                </Box>
                                <Line 
                                    options={chartOptions} 
                                    data={{
                                        labels: metrics.memory.history.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [{
                                            label: 'Memory Usage',
                                            data: metrics.memory.history.map(point => point.value),
                                            borderColor: theme.palette.secondary.main,
                                            tension: 0.1
                                        }]
                                    }} 
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Disk Usage */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <StorageIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Disk Usage</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="h4" color={getStatusColor(metrics.disk.current)}>
                                        {Math.round(metrics.disk.current)}%
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={metrics.disk.current}
                                        sx={{ 
                                            mt: 1, 
                                            height: 10, 
                                            borderRadius: 5,
                                            backgroundColor: theme.palette.grey[200],
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getStatusColor(metrics.disk.current)
                                            }
                                        }}
                                    />
                                </Box>
                                <Line 
                                    options={chartOptions} 
                                    data={{
                                        labels: metrics.disk.history.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [{
                                            label: 'Disk Usage',
                                            data: metrics.disk.history.map(point => point.value),
                                            borderColor: theme.palette.warning.main,
                                            tension: 0.1
                                        }]
                                    }} 
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Network Traffic */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <NetworkCheckIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Network Traffic</Typography>
                                </Box>
                                <Line 
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: (value) => `${value} MB/s`
                                                }
                                            }
                                        }
                                    }} 
                                    data={{
                                        labels: metrics.network.in.map(point => 
                                            new Date(point.timestamp).toLocaleTimeString()
                                        ),
                                        datasets: [
                                            {
                                                label: 'Network In',
                                                data: metrics.network.in.map(point => point.value / (1024 * 1024)),
                                                borderColor: theme.palette.success.main,
                                                tension: 0.1
                                            },
                                            {
                                                label: 'Network Out',
                                                data: metrics.network.out.map(point => point.value / (1024 * 1024)),
                                                borderColor: theme.palette.error.main,
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

export default ServerMonitoring; 