import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    status: {
      running: '#4caf50',
      stopped: '#f44336',
      warning: '#ff9800'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
          }
        }
      }
    }
  }
}); 