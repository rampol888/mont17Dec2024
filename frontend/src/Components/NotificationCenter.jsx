import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationCenter = () => {
    return (
        <Snackbar>
            <Alert severity="warning">
                High CPU Usage Detected on Instance i-1234
            </Alert>
        </Snackbar>
    );
};
