import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Grid, 
    Container, 
    Typography, 
    Box,
    Card,
    CardContent,
    useTheme,
    alpha,
    CircularProgress,
    Alert,
    Paper,
    Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';

// Material Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import WebIcon from '@mui/icons-material/Web';
import ComputerIcon from '@mui/icons-material/Computer';
import WarningIcon from '@mui/icons-material/Warning';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MonitorIcon from '@mui/icons-material/Monitor';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Chart.js registration
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Import your components
import WebsiteMonitoring from './WebsiteMonitoring';
import LogManagement from './LogManagement';
import APMDashboard from './APMDashboard';
import RUMDashboard from './RUMDashboard';
import DatabaseMetrics from './DatabaseMetrics';
import DiskSpaceMetrics from './DiskSpaceMetrics';
import NetworkMonitoring from './NetworkMonitoring';
import WebsitePerformance from './WebsitePerformance';
import WebpageSpeedTest from './WebpageSpeedTest';
import ServerMonitoring from './ServerMonitoring';
import ResponseTimeMonitoring from './ResponseTimeMonitoring';

// Import the actions from your slice
import { 
    fetchAWSStatus, 
    fetchAllMetrics 
} from '../features/awsServices/awsServicesSlice';

// Styled components remain the same
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(8px)',
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    }
}));

const MetricBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2)
}));

const menuItems = [
    { title: 'Home', icon: <HomeIcon />, path: '/' },
    { title: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' },
    { title: 'Monitoring', icon: <MonitorIcon />, path: '/monitoring' },
    { title: 'Server', icon: <StorageIcon />, path: '/server' },
    { title: 'Reports', icon: <AssessmentIcon />, path: '/reports' }
];

const Dashboard = () => {
    const dispatch = useDispatch();
    const { data, status } = useSelector((state) => state.awsServices);
    const theme = useTheme();
    const [networkMetrics, setNetworkMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [websitePerformance, setWebsitePerformance] = useState(null);
    const [serverMetrics, setServerMetrics] = useState(null);
    const [responseTimeMetrics, setResponseTimeMetrics] = useState(null);

    useEffect(() => {
        // Fetch initial data
        dispatch(fetchAWSStatus());
        dispatch(fetchAllMetrics());

        // Set up polling intervals
        const statusInterval = setInterval(() => {
            dispatch(fetchAWSStatus());
        }, 30000); // Every 30 seconds

        const metricsInterval = setInterval(() => {
            dispatch(fetchAllMetrics());
        }, 60000); // Every minute

        return () => {
            clearInterval(statusInterval);
            clearInterval(metricsInterval);
        };
    }, [dispatch]);

    const fetchNetworkMetrics = async () => {
        try {
            console.log('Fetching network metrics...');
            const response = await fetch('http://localhost:5001/api/network-metrics');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Network metrics data received:', data);
            setNetworkMetrics(data);
        } catch (error) {
            console.error('Error fetching network metrics:', error);
            setError(error.message);
        }
    };

    const fetchWebsitePerformance = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/website-performance');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setWebsitePerformance(data);
        } catch (error) {
            console.error('Error fetching website performance:', error);
        }
    };

    const fetchServerMetrics = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/server-metrics');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setServerMetrics(data);
        } catch (error) {
            console.error('Error fetching server metrics:', error);
        }
    };

    const fetchResponseTimeMetrics = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/response-time-metrics');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResponseTimeMetrics(data);
        } catch (error) {
            console.error('Error fetching response time metrics:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Starting data fetch...');
                setLoading(true);
                setError(null);
                await Promise.all([
                    fetchNetworkMetrics(),
                    fetchWebsitePerformance(),
                    fetchServerMetrics(),
                    fetchResponseTimeMetrics(),
                    // Add other fetch calls here
                ]);
                console.log('Data fetch complete');
                setLoading(false);
            } catch (error) {
                console.error('Error in data fetch:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'CPU Utilization'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Percentage (%)'
                }
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    // Rest of your component remains the same...
    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            minHeight: '100vh',
            minWidth: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'auto',
            display: 'flex'
        }}>
            {/* Left Sidebar Navigation */}
            <Box sx={{
                width: '280px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                {/* Logo/Brand */}
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    mb: 2
                }}>
                    <DashboardIcon sx={{ color: 'white', fontSize: 32 }} />
                    <Typography variant="h6" color="white" fontWeight="bold">
                        AWS Monitor
                    </Typography>
                </Box>

                {/* Navigation Items */}
                {menuItems.map((item) => (
                    <Box
                        key={item.title}
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                transform: 'translateX(5px)'
                            }
                        }}
                        onClick={() => console.log(`Navigating to ${item.path}`)}
                    >
                        {React.cloneElement(item.icon, { 
                            sx: { fontSize: 24 }
                        })}
                        <Typography>{item.title}</Typography>
                    </Box>
                ))}

                {/* User Profile Section */}
                <Box sx={{ 
                    mt: 'auto',
                    p: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    color: 'white'
                }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
                    <Box>
                        <Typography variant="subtitle2">Admin User</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            System Administrator
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{
                flex: 1,
                p: 4,
                overflowY: 'auto'
            }}>
                <Container maxWidth="xl">
                    {/* Header */}
                    <Box mb={4} sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 2,
                        color: 'white'
                    }}>
                        <DashboardIcon sx={{ fontSize: 40 }} />
                        <Typography variant="h4" fontWeight="bold">
                            AWS Infrastructure Monitor
                        </Typography>
                    </Box>

                    {/* Overview Metrics */}
                    <Grid container spacing={3} mb={4}>
                        {/* Running Instances */}
                        <Grid item xs={12} md={3}>
                            <StyledCard>
                                <CardContent>
                                    <MetricBox>
                                        <ComputerIcon color="primary" sx={{ fontSize: 40 }} />
                                        <Box>
                                            <Typography variant="h6" color="primary">Running Instances</Typography>
                                            <Typography variant="h4" fontWeight="bold">
                                                {data?.ec2?.length || 0}
                                            </Typography>
                                        </Box>
                                    </MetricBox>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* CPU Alerts */}
                        <Grid item xs={12} md={3}>
                            <StyledCard>
                                <CardContent>
                                    <MetricBox>
                                        <WarningIcon 
                                            sx={{ 
                                                fontSize: 40,
                                                color: theme.palette.warning.main 
                                            }} 
                                        />
                                        <Box>
                                            <Typography variant="h6" color="warning.main">CPU Alerts</Typography>
                                            <Typography variant="h4" fontWeight="bold">
                                                {data?.ec2?.filter(i => i.cpuUtilization > 80).length || 0}
                                            </Typography>
                                        </Box>
                                    </MetricBox>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Average CPU */}
                        <Grid item xs={12} md={3}>
                            <StyledCard>
                                <CardContent>
                                    <MetricBox>
                                        <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
                                        <Box>
                                            <Typography variant="h6" color="primary">Avg CPU Usage</Typography>
                                            <Typography variant="h4" fontWeight="bold">
                                                {data?.ec2?.length 
                                                    ? (data.ec2.reduce((acc, curr) => acc + curr.cpuUtilization, 0) / data.ec2.length).toFixed(1)
                                                    : 0}%
                                            </Typography>
                                        </Box>
                                    </MetricBox>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>

                    {/* EC2 and RDS Instances */}
                    <Grid container spacing={3} mb={4}>
                        {/* EC2 Instances */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>EC2 Instances</Typography>
                                    <Box height={300}>
                                        <Line
                                            options={chartOptions}
                                            data={{
                                                labels: data?.ec2?.map(i => i.id) || [],
                                                datasets: [{
                                                    label: 'CPU Utilization',
                                                    data: data?.ec2?.map(i => i.cpuUtilization) || [],
                                                    borderColor: theme.palette.primary.main,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                    fill: true
                                                }]
                                            }}
                                        />
                                    </Box>
                                    <Box mt={2}>
                                        {data?.ec2?.map(instance => (
                                            <Paper 
                                                key={instance.id}
                                                sx={{ 
                                                    p: 2, 
                                                    mb: 1,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Typography>{instance.id}</Typography>
                                                <Typography 
                                                    color={instance.cpuUtilization > 80 ? 'error.main' : 'success.main'}
                                                >
                                                    {instance.cpuUtilization}%
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* RDS Instances */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>RDS Instances</Typography>
                                    <Box height={300}>
                                        <Line
                                            options={chartOptions}
                                            data={{
                                                labels: data?.rds?.map(i => i.id) || [],
                                                datasets: [{
                                                    label: 'CPU Utilization',
                                                    data: data?.rds?.map(i => i.cpuUtilization) || [],
                                                    borderColor: theme.palette.secondary.main,
                                                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                    fill: true
                                                }]
                                            }}
                                        />
                                    </Box>
                                    <Box mt={2}>
                                        {data?.rds?.map(instance => (
                                            <Paper 
                                                key={instance.id}
                                                sx={{ 
                                                    p: 2, 
                                                    mb: 1,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Typography>{instance.id}</Typography>
                                                <Typography 
                                                    color={instance.cpuUtilization > 80 ? 'error.main' : 'success.main'}
                                                >
                                                    {instance.cpuUtilization}%
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>

                    {/* Other monitoring components */}
                    <Grid container spacing={3}>
                        {/* Website Monitoring */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <WebIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Website Monitoring</Typography>
                                    </Box>
                                    <WebsiteMonitoring data={data?.websites} />
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Log Management */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <ListAltIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Log Management</Typography>
                                    </Box>
                                    <LogManagement logs={data?.logs} />
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* APM Dashboard */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <TimelineIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Application Performance</Typography>
                                    </Box>
                                    <APMDashboard metrics={data?.apmMetrics} />
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* RUM Dashboard */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <SpeedIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Real User Monitoring</Typography>
                                    </Box>
                                    <RUMDashboard metrics={data?.rumMetrics} />
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Database Metrics */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <StorageIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Database Performance</Typography>
                                    </Box>
                                    <DatabaseMetrics metrics={data?.dbMetrics} />
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Disk Space Metrics */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <StorageIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Disk Space Utilization</Typography>
                                    </Box>
                                    <DiskSpaceMetrics metrics={data?.diskMetrics} />
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Network Monitoring */}
                        <Grid item xs={12}>
                            {console.log('Rendering NetworkMonitoring with metrics:', networkMetrics)}
                            <NetworkMonitoring networkMetrics={networkMetrics} />
                        </Grid>

                        {/* Website Performance */}
                        <Grid item xs={12}>
                            <WebsitePerformance performanceData={websitePerformance} />
                        </Grid>

                        {/* Webpage Speed Test */}
                        <Grid item xs={12}>
                            <WebpageSpeedTest />
                        </Grid>

                        {/* Server Monitoring */}
                        <Grid item xs={12}>
                            <ServerMonitoring metrics={serverMetrics} />
                        </Grid>

                        {/* Response Time Monitoring */}
                        <Grid item xs={12}>
                            <ResponseTimeMonitoring metrics={responseTimeMetrics} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default Dashboard;
