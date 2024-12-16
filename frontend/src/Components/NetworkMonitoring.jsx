import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Box 
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const NetworkMonitoring = ({ networkMetrics }) => {
    console.log('Network Metrics received:', networkMetrics);

    if (!networkMetrics || !networkMetrics.networkIn || !networkMetrics.networkOut) {
        console.log('Invalid network metrics structure:', networkMetrics);
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Network Monitoring
                    </Typography>
                    <Typography color="textSecondary">
                        No network data available
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const networkInData = {
        labels: networkMetrics.networkIn.average.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        ),
        datasets: [
            {
                label: 'Network In (Average)',
                data: networkMetrics.networkIn.average.map(point => point.value),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Network In (Maximum)',
                data: networkMetrics.networkIn.maximum.map(point => point.value),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    const networkOutData = {
        labels: networkMetrics.networkOut.average.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        ),
        datasets: [
            {
                label: 'Network Out (Average)',
                data: networkMetrics.networkOut.average.map(point => point.value),
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            },
            {
                label: 'Network Out (Maximum)',
                data: networkMetrics.networkOut.maximum.map(point => point.value),
                borderColor: 'rgb(255, 159, 64)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Network Traffic'
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return formatBytes(value);
                    }
                }
            }
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Network Monitoring
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box>
                            <Line data={networkInData} options={options} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box>
                            <Line data={networkOutData} options={options} />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Total Packets In: {networkMetrics.packetsIn.reduce((sum, point) => sum + point.value, 0).toLocaleString()}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                            Total Packets Out: {networkMetrics.packetsOut.reduce((sum, point) => sum + point.value, 0).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default NetworkMonitoring; 