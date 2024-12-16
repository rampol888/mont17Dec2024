import React from 'react';
import { Alert, Stack } from '@mui/material';

const AlertsManager = ({ metrics }) => {
    const checkThresholds = () => {
        const alerts = [];
        if (metrics.cpu > 80) {
            alerts.push({ severity: 'error', message: 'High CPU Usage!' });
        }
        if (metrics.memory > 80) {
            alerts.push({ severity: 'error', message: 'High Memory Usage!' });
        }
        return alerts;
    };

    const alerts = checkThresholds();

    return (
        <Stack spacing={2}>
            {alerts.map((alert, index) => (
                <Alert key={index} severity={alert.severity}>
                    {alert.message}
                </Alert>
            ))}
        </Stack>
    );
};

export default AlertsManager;
