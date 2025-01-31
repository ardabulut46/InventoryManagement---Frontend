import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            return JSON.parse(savedMode);
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#1976d2',
                light: '#42a5f5',
                dark: '#1565c0',
                ...(darkMode && {
                    main: '#90caf9',
                    light: '#e3f2fd',
                    dark: '#42a5f5',
                }),
            },
            secondary: {
                main: '#9c27b0',
                light: '#ba68c8',
                dark: '#7b1fa2',
            },
            background: {
                default: darkMode ? '#121212' : '#f5f5f5',
                paper: darkMode ? '#1e1e1e' : '#ffffff',
            },
            error: {
                main: darkMode ? '#f44336' : '#d32f2f',
                light: darkMode ? '#e57373' : '#ef5350',
                dark: darkMode ? '#d32f2f' : '#c62828',
            },
            warning: {
                main: darkMode ? '#ffa726' : '#ed6c02',
                light: darkMode ? '#ffb74d' : '#ff9800',
                dark: darkMode ? '#f57c00' : '#e65100',
            },
            info: {
                main: darkMode ? '#29b6f6' : '#0288d1',
                light: darkMode ? '#4fc3f7' : '#03a9f4',
                dark: darkMode ? '#0288d1' : '#01579b',
            },
            success: {
                main: darkMode ? '#66bb6a' : '#2e7d32',
                light: darkMode ? '#81c784' : '#4caf50',
                dark: darkMode ? '#388e3c' : '#1b5e20',
            },
            text: {
                primary: darkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                disabled: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
            },
            divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarColor: darkMode ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
                        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                            width: 8,
                            height: 8,
                            backgroundColor: darkMode ? '#2b2b2b' : '#f5f5f5',
                        },
                        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                            borderRadius: 8,
                            backgroundColor: darkMode ? '#6b6b6b' : '#959595',
                            minHeight: 24,
                            border: `1px solid ${darkMode ? '#2b2b2b' : '#f5f5f5'}`,
                        },
                        '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
                            backgroundColor: darkMode ? '#959595' : '#6b6b6b',
                        },
                        '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
                            backgroundColor: darkMode ? '#959595' : '#6b6b6b',
                        },
                        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: darkMode ? '#959595' : '#6b6b6b',
                        },
                        '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
                            backgroundColor: darkMode ? '#2b2b2b' : '#f5f5f5',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        ...(darkMode && {
                            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.4)',
                        }),
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        '& .MuiTableCell-root': {
                            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                            fontWeight: 600,
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
} 