import React from 'react';
import { Card, CardContent, FormControl, FormGroup, Switch, TextField } from '@mui/material';

const Settings = () => {
    return (
        <Card>
            <CardContent>
                <FormGroup>
                    <FormControl>
                        <TextField label="Refresh Interval (seconds)" type="number" />
                    </FormControl>
                    <FormControl>
                        <Switch label="Auto-refresh" />
                    </FormControl>
                    <FormControl>
                        <TextField label="Alert Thresholds" />
                    </FormControl>
                </FormGroup>
            </CardContent>
        </Card>
    );
};

export default Settings;
