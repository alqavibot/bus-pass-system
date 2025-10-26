// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
    duration: 4000,
  });

  const showNotification = (message, severity = 'info', duration = 4000) => {
    setNotification({
      open: true,
      message,
      severity,
      duration,
    });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
      >
        <Alert 
          onClose={handleClose} 
          severity={notification.severity}
          variant="filled"
          elevation={6}
          sx={{ 
            width: '100%',
            minWidth: '300px',
            maxWidth: '600px',
            borderRadius: 0, // Sharp corners to match theme
            fontWeight: 500,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

