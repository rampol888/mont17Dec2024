import React from 'react';
import Dashboard from './Components/Dashboard';
import { Container, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            AWS Monitor
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Dashboard />
      </Container>
    </>
  );
}

export default App;