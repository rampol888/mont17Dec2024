import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    useTheme
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';

const WebpageSpeedTest = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const theme = useTheme();

    const handleTest = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5001/api/webpage-speed-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const getSpeedRating = (loadTime) => {
        if (loadTime < 1000) return { text: 'Excellent', color: theme.palette.success.main };
        if (loadTime < 2500) return { text: 'Good', color: theme.palette.info.main };
        if (loadTime < 5000) return { text: 'Fair', color: theme.palette.warning.main };
        return { text: 'Poor', color: theme.palette.error.main };
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Webpage Speed Test
                </Typography>

                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Enter URL"
                        variant="outlined"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        onClick={handleTest}
                        disabled={!url || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SpeedIcon />}
                    >
                        Test Speed
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {results && (
                    <Grid container spacing={3}>
                        {/* Overall Speed Score */}
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Speed Rating
                                    </Typography>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ color: getSpeedRating(results.loadTime).color }}
                                    >
                                        {getSpeedRating(results.loadTime).text}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Total Load Time: {results.loadTime}ms
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Detailed Metrics */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <TimerIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Timing Breakdown</Typography>
                                    </Box>
                                    <List>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Time to First Byte" 
                                                secondary={`${results.metrics.ttfb}ms`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Download Time" 
                                                secondary={`${results.metrics.downloadTime}ms`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="DNS Lookup" 
                                                secondary={`${results.metrics.dnsLookup}ms`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="SSL Connection" 
                                                secondary={`${results.metrics.sslTime}ms`}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Resource Information */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <StorageIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Resource Info</Typography>
                                    </Box>
                                    <List>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Page Size" 
                                                secondary={formatBytes(results.pageSize)}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Server" 
                                                secondary={results.server}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Content Type" 
                                                secondary={results.contentType}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Status Code" 
                                                secondary={results.statusCode}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default WebpageSpeedTest;
