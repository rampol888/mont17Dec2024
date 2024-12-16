import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Button,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const LogManagement = () => {
    const [logGroups, setLogGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [timeRange, setTimeRange] = useState('1h');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        fetchLogGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchLogs();
        }
    }, [selectedGroup, timeRange]);

    const handleError = (error, context) => {
        console.error(`${context} Error:`, error);
        setError(error.message);
        setSnackbar({
            open: true,
            message: `Error: ${error.message}`,
            severity: 'error'
        });
    };

    const fetchLogGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5001/api/logs/groups');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch log groups: ${response.statusText}`);
            }
            
            const groups = await response.json();
            
            if (Array.isArray(groups) && groups.length > 0) {
                setLogGroups(groups);
                setSelectedGroup(groups[0]);
            } else {
                setLogGroups([]);
                setError('No log groups found');
            }
        } catch (err) {
            handleError(err, 'Fetch Log Groups');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        if (!selectedGroup) return;

        try {
            setLoading(true);
            setError(null);
            
            const timeInMs = {
                '1h': 60 * 60 * 1000,
                '6h': 6 * 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000
            };
            
            const startTime = Date.now() - timeInMs[timeRange];
            const params = new URLSearchParams({
                group: selectedGroup,
                start_time: startTime.toString(),
                filter: filterText
            });
            
            const response = await fetch(`http://localhost:5001/api/logs/events?${params}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }
            
            const events = await response.json();
            
            if (Array.isArray(events)) {
                setLogs(events);
            } else {
                throw new Error('Invalid log data received');
            }
        } catch (err) {
            handleError(err, 'Fetch Logs');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchLogs();
        setSnackbar({
            open: true,
            message: 'Logs refreshed',
            severity: 'success'
        });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Log Management</Typography>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading || !selectedGroup}
                        variant="contained"
                        color="primary"
                    >
                        Refresh
                    </Button>
                </Box>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth error={!logGroups.length}>
                            <InputLabel>Log Group</InputLabel>
                            <Select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                disabled={loading || !logGroups.length}
                            >
                                {logGroups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        {group}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Time Range</InputLabel>
                            <Select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                disabled={loading || !selectedGroup}
                            >
                                <MenuItem value="1h">Last Hour</MenuItem>
                                <MenuItem value="6h">Last 6 Hours</MenuItem>
                                <MenuItem value="24h">Last 24 Hours</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <form onSubmit={handleFilterSubmit}>
                            <TextField
                                fullWidth
                                label="Filter Logs"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                disabled={loading || !selectedGroup}
                                placeholder="Enter filter text..."
                            />
                        </form>
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Paper 
                    sx={{ 
                        maxHeight: 400, 
                        overflow: 'auto',
                        backgroundColor: 'background.default'
                    }}
                >
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {logs.map((log, index) => (
                                <ListItem key={`${log.timestamp}-${index}`} divider>
                                    <ListItemText
                                        primary={
                                            <Typography color="textSecondary" variant="caption">
                                                {new Date(log.timestamp).toLocaleString()} - {log.logStreamName}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography 
                                                component="pre" 
                                                sx={{ 
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem',
                                                    mt: 1
                                                }}
                                            >
                                                {log.message}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                            {!loading && logs.length === 0 && (
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography color="textSecondary" align="center">
                                                No logs found
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                >
                    <Alert 
                        onClose={handleSnackbarClose} 
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
};

export default LogManagement;