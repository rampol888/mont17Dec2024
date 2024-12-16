import React from 'react';
import { Card, CardContent, Typography, List, ListItem } from '@mui/material';

const LogViewer = ({ logs }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">System Logs</Typography>
      <List>
        {logs.map((log, index) => (
          <ListItem key={index}>
            <Typography>
              {new Date(log.timestamp).toLocaleString()}: {log.message}
            </Typography>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default LogViewer;
