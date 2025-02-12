import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    IconButton,
    TextField,
    Typography,
    Fab,
    Zoom,
    CircularProgress,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    OpenInFull as ExtendIcon,
    CloseFullscreen as MinimizeIcon,
} from '@mui/icons-material';
import AppInfoService from '../api/AppInfoService';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExtended, setIsExtended] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            type: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await AppInfoService.generateResponse(inputValue.trim()); // eski method
            //const response = await AppInfoService.generateDeepSeekResponse(inputValue.trim());
            const botMessage = {
                type: 'bot',

                content: response
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                type: 'bot',
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleExtend = () => {
        setIsExtended(!isExtended);
    };

    return (
        <>
            <Zoom in={!isOpen}>
                <Fab
                    color="primary"
                    onClick={() => setIsOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                    }}
                >
                    <ChatIcon />
                </Fab>
            </Zoom>

            <Paper
                sx={{
                    display: isOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: isExtended ? '60%' : 350,
                    height: isExtended ? '80vh' : 500,
                    zIndex: 1000,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h6">Yardımcı</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={toggleExtend}
                            sx={{ color: 'white' }}
                        >
                            {isExtended ? <MinimizeIcon /> : <ExtendIcon />}
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setIsOpen(false)}
                            sx={{ color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Messages */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                    }}
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: isExtended ? '70%' : '80%',
                            }}
                        >
                            <Paper
                                sx={{
                                    p: 1.5,
                                    bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                                    color: message.type === 'user' ? 'white' : 'text.primary',
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="body2">{message.content}</Typography>
                            </Paper>
                        </Box>
                    ))}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Mesajınızı yazın..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={4}
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isLoading}
                                    color="primary"
                                >
                                    <SendIcon />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>
            </Paper>
        </>
    );
};

export default ChatWidget; 