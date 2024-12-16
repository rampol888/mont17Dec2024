import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';

const MetricsDisplay = ({ metrics }) => {
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const createChartData = (values, label) => ({
        labels: Array.from({ length: values.length }, (_, i) => i + 1),
        datasets: [{
            label,
            data: values,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    });

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">CPU Usage</Typography>
                        <Box height={300}>
                            <Line 
                                data={createChartData(metrics.CPU, 'CPU Usage %')} 
                                options={chartOptions} 
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Memory Usage</Typography>
                        <Box height={300}>
                            <Line 
                                data={createChartData(metrics.Memory, 'Memory Usage %')} 
                                options={chartOptions} 
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Disk Usage</Typography>
                        <Box height={300}>
                            <Line 
                                data={createChartData(metrics.Disk, 'Disk Usage %')} 
                                options={chartOptions} 
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Network Traffic</Typography>
                        <Box height={300}>
                            <Line 
                                data={{
                                    labels: Array.from({ length: metrics.Network.NetworkIn.length }, (_, i) => i + 1),
                                    datasets: [
                                        {
                                            label: 'Network In',
                                            data: metrics.Network.NetworkIn,
                                            borderColor: 'rgb(75, 192, 192)',
                                            fill: false
                                        },
                                        {
                                            label: 'Network Out',
                                            data: metrics.Network.NetworkOut,
                                            borderColor: 'rgb(255, 99, 132)',
                                            fill: false
                                        }
                                    ]
                                }}
                                options={chartOptions}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default MetricsDisplay;
