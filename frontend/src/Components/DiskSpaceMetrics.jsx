import React from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress } from '@mui/material';
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

const DiskSpaceMetrics = ({ metrics }) => {
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 GB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const calculateUsagePercentage = () => {
        if (!metrics?.disk_used?.[0] || !metrics?.total_size) return 0;
        return (metrics.disk_used[0].Average / metrics.total_size) * 100;
    };

    const usagePercentage = calculateUsagePercentage();

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Disk Space Utilization
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Current Disk Usage
                                </Typography>
                                <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={usagePercentage}
                                            sx={{
                                                height: 20,
                                                borderRadius: 5,
                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: usagePercentage > 90 ? '#f44336' :
                                                                   usagePercentage > 70 ? '#ff9800' :
                                                                   '#4caf50'
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            right: 0,
                                            top: -25,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {`${Math.round(usagePercentage)}%`}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box mt={2}>
                                    <Typography color="textSecondary">
                                        Used: {formatBytes(metrics?.disk_used?.[0]?.Average || 0)}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Available: {formatBytes(metrics?.disk_available?.[0]?.Average || 0)}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Total: {formatBytes(metrics?.total_size || 0)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Disk Usage Trend
                                </Typography>
                                <Box height={300}>
                                    <Line
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                }
                                            }
                                        }}
                                        data={{
                                            labels: metrics?.disk_used?.map(point => new Date(point.Timestamp).toLocaleTimeString()) || [],
                                            datasets: [
                                                {
                                                    label: 'Used',
                                                    data: metrics?.disk_used?.map(point => point.Average) || [],
                                                    borderColor: 'rgb(255, 99, 132)',
                                                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                                    tension: 0.1
                                                },
                                                {
                                                    label: 'Available',
                                                    data: metrics?.disk_available?.map(point => point.Average) || [],
                                                    borderColor: 'rgb(54, 162, 235)',
                                                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                                    tension: 0.1
                                                }
                                            ]
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

export default DiskSpaceMetrics; 