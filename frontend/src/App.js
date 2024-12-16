import React from 'react';
import Dashboard from './Components/Dashboard';
import { Container, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default App;