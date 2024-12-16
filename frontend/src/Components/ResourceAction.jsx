import React from 'react';
import { Button, ButtonGroup } from '@mui/material';

const ResourceActions = ({ resourceId, resourceType }) => {
    return (
        <ButtonGroup size="small">
            <Button>Start</Button>
            <Button>Stop</Button>
            <Button>Restart</Button>
        </ButtonGroup>
    );
};
