import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ResourceActions = ({ resourceId, resourceType }) => {
    const handleAction = (action) => {
        console.log(`${action} action triggered for ${resourceType} ${resourceId}`);
        // Implement actual AWS actions here
    };

    return (
        <ButtonGroup size="small" aria-label="resource actions">
            <Button 
                startIcon={<PlayArrowIcon />}
                onClick={() => handleAction('start')}
            >
                Start
            </Button>
            <Button 
                startIcon={<StopIcon />}
                onClick={() => handleAction('stop')}
            >
                Stop
            </Button>
            <Button 
                startIcon={<RestartAltIcon />}
                onClick={() => handleAction('restart')}
            >
                Restart
            </Button>
        </ButtonGroup>
    );
};

export default ResourceActions; 