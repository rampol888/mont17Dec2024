import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';

const WebsiteMonitoring = () => {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWebsiteStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/website-monitoring');
            if (!response.ok) throw new Error('Failed to fetch website status');
            const data = await response.json();
            setWebsites(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebsiteStatus();
        const interval = setInterval(fetchWebsiteStatus, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available':
                return 'success.main';
            case 'Unavailable':
                return 'error.main';
            default:
                return 'warning.main';
        }
    };

    const formatLatency = (latency) => {
        if (!latency) return 'N/A';
        return `${latency.toFixed(2)}ms`;
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Website Monitoring</Typography>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={fetchWebsiteStatus} disabled={loading}>
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Website</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Latency</TableCell>
                                    <TableCell>Last Checked</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {websites.map((site) => (
                                    <TableRow key={site.url}>
                                        <TableCell>{site.url}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {site.status === 'Available' ? (
                                                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                                                ) : site.status === 'Unavailable' ? (
                                                    <ErrorIcon sx={{ color: 'error.main' }} />
                                                ) : (
                                                    <TimerIcon sx={{ color: 'warning.main' }} />
                                                )}
                                                <Typography color={getStatusColor(site.status)}>
                                                    {site.status}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatLatency(site.latency)}</TableCell>
                                        <TableCell>
                                            {new Date(site.lastChecked).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default WebsiteMonitoring;