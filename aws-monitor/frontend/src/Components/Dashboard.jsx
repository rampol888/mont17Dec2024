import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAWSStatus } from '../features/awsServices/awsServicesSlice';
import { 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    CircularProgress,
    Alert,
    Box
} from '@mui/material';

const ServiceCard = ({ title, data, renderItem }) => (
    <Card sx={{ height: '100%', minHeight: 200 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            {data?.map(renderItem)}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.awsServices);

    useEffect(() => {
        dispatch(fetchAWSStatus());
        const interval = setInterval(() => {
            dispatch(fetchAWSStatus());
        }, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed') {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <ServiceCard
                    title="EC2 Instances"
                    data={data?.ec2}
                    renderItem={(instance) => (
                        <Box key={instance.id} mb={2}>
                            <Typography variant="subtitle1">ID: {instance.id}</Typography>
                            <Typography>State: {instance.state}</Typography>
                            <Typography>Type: {instance.type}</Typography>
                            <Typography>Launch Time: {new Date(instance.launchTime).toLocaleString()}</Typography>
                        </Box>
                    )}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ServiceCard
                    title="RDS Instances"
                    data={data?.rds}
                    renderItem={(db) => (
                        <Box key={db.id} mb={2}>
                            <Typography variant="subtitle1">ID: {db.id}</Typography>
                            <Typography>Status: {db.status}</Typography>
                            <Typography>Engine: {db.engine}</Typography>
                            <Typography>Size: {db.size}</Typography>
                        </Box>
                    )}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <ServiceCard
                    title="Lambda Functions"
                    data={data?.lambda}
                    renderItem={(func) => (
                        <Box key={func.name} mb={2}>
                            <Typography variant="subtitle1">Name: {func.name}</Typography>
                            <Typography>Runtime: {func.runtime}</Typography>
                            <Typography>Memory: {func.memory}MB</Typography>
                            <Typography>Timeout: {func.timeout}s</Typography>
                        </Box>
                    )}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <ServiceCard
                    title="ECS Clusters"
                    data={data?.ecs}
                    renderItem={(cluster) => (
                        <Box key={cluster.name} mb={2}>
                            <Typography variant="subtitle1">Name: {cluster.name}</Typography>
                            <Typography>Status: {cluster.status}</Typography>
                            <Typography>Active Services: {cluster.activeServices}</Typography>
                            <Typography>Running Tasks: {cluster.runningTasks}</Typography>
                        </Box>
                    )}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <ServiceCard
                    title="EKS Clusters"
                    data={data?.eks}
                    renderItem={(cluster) => (
                        <Box key={cluster.name} mb={2}>
                            <Typography variant="subtitle1">Name: {cluster.name}</Typography>
                            <Typography>Status: {cluster.status}</Typography>
                            <Typography>Version: {cluster.version}</Typography>
                            <Typography>Platform: {cluster.platform}</Typography>
                        </Box>
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default Dashboard;