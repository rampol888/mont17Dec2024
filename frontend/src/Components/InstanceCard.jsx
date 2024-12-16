import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import ResourceActions from './ResourceActions';

const StyledInstanceCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    overflow: 'visible',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: ({ status }) => 
            status === 'running' ? theme.palette.success.main : 
            status === 'stopped' ? theme.palette.error.main :
            theme.palette.warning.main
    }
}));

const MetricCircle = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: 100,
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
}));

const InstanceCard = ({ instance }) => {
    return (
        <StyledInstanceCard status={instance.state}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Typography variant="h6" component="div">
                                {instance.id}
                            </Typography>
                            <Tooltip title="Instance Details">
                                <IconButton size="small" sx={{ ml: 1 }}>
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Chip 
                            label={instance.state}
                            color={instance.state === 'running' ? 'success' : 'error'}
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        <Typography color="textSecondary" gutterBottom>
                            Type: {instance.type}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                            Launched: {new Date(instance.launch_time).toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <MetricCircle>
                            <CircularProgress
                                variant="determinate"
                                value={instance.cpuUtilization || 0}
                                size={80}
                                thickness={8}
                                sx={{
                                    color: (theme) => 
                                        instance.cpuUtilization > 80 ? theme.palette.error.main :
                                        instance.cpuUtilization > 60 ? theme.palette.warning.main :
                                        theme.palette.success.main
                                }}
                            />
                            <Typography
                                variant="caption"
                                component="div"
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {`${Math.round(instance.cpuUtilization || 0)}%`}
                            </Typography>
                        </MetricCircle>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                            mt={1}
                        >
                            CPU Usage
                        </Typography>
                    </Grid>
                </Grid>
                <Box mt={2}>
                    <ResourceActions resourceId={instance.id} resourceType="ec2" />
                </Box>
            </CardContent>
        </StyledInstanceCard>
    );
};

export default InstanceCard; 