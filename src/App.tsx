import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
  createTheme,
  ThemeProvider,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PaymentIcon from '@mui/icons-material/Payment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

declare global {
  interface Window {
    Cashfree: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'chat_messages';

const generateMessageId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages from localStorage
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Validate the parsed messages
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    // Return default welcome message if no valid messages found
    return [{
      id: generateMessageId(),
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: Date.now()
    }];
  });
  const [loading, setLoading] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: darkMode ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
              },
            },
          },
        },
      }),
    [darkMode],
  );

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  useEffect(() => {
    const scriptUrl = "https://sdk.cashfree.com/js/v3/cashfree.js";

    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
          console.log("✅ Cashfree script loaded");
          resolve();
        };
        script.onerror = () => reject("Failed to load Cashfree SDK");
        document.body.appendChild(script);
      });
    };

    loadScript()
      .then(() => {
        const interval = setInterval(() => {
          if (window.Cashfree && typeof window.Cashfree === "function") {
            console.log("✅ Cashfree SDK is now available");
            setCashfreeLoaded(true);
            clearInterval(interval);
          } else {
            console.log("⏳ Waiting for Cashfree SDK...");
          }
        }, 300);
      })
      .catch((err) => {
        console.error("❌", err);
      });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_AIML_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: Date.now()
        };
        setMessages((prev: Message[]) => [...prev, assistantMessage]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePayment = () => {
    if (!cashfreeLoaded || !window.Cashfree) {
      alert("❌ Cashfree SDK not loaded properly");
      return;
    }

    const cashfree = new window.Cashfree({ mode: process.env.REACT_APP_CASHFREE_MODE || "sandbox" });

    const checkoutOptions = {
      paymentSessionId: process.env.REACT_APP_CASHFREE_PAYMENT_SESSION_ID,
      redirectTarget: "_self",
      returnUrl: process.env.REACT_APP_CASHFREE_RETURN_URL,
    };

    cashfree.checkout(checkoutOptions);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Paper elevation={0} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              AI Chat Assistant
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button 
              color="inherit" 
              startIcon={<PaymentIcon />} 
              onClick={handlePayment}
              disabled={!cashfreeLoaded}
              sx={{ ml: 2 }}
            >
              {cashfreeLoaded ? "Upgrade" : "Loading Payment..."}
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          <Container maxWidth="md">
            <List sx={{ width: '100%' }}>
              {messages.map((message) => (
                <ListItem key={message.id} sx={{
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  px: 0,
                  py: 1
                }}>
                  {message.role === 'assistant' && (
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        AI
                      </Avatar>
                    </ListItemAvatar>
                  )}
                  <Card sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                    color: message.role === 'user' ? 'common.white' : 'text.primary',
                    borderRadius: message.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <ListItemText 
                      primary={message.content} 
                      secondary={new Date(message.timestamp).toLocaleTimeString()}
                      primaryTypographyProps={{
                        style: { 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.5
                        }
                      }}
                      secondaryTypographyProps={{
                        style: {
                          fontSize: '0.75rem',
                          opacity: 0.7
                        }
                      }}
                    />
                  </Card>
                  {message.role === 'user' && (
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        U
                      </Avatar>
                    </ListItemAvatar>
                  )}
                </ListItem>
              ))}
              {loading && (
                <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>
                  </ListItemAvatar>
                  <Card sx={{ p: 2, borderRadius: '18px 18px 18px 0' }}>
                    <CircularProgress size={24} />
                  </Card>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Container>
        </Box>

        <Divider />
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                variant="outlined"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!input.trim() || loading}
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '&:disabled': {
                            backgroundColor: 'action.disabledBackground',
                          }
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Container>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default App;