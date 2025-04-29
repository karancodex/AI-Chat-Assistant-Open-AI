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
  ThemeProvider
} from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import PaymentIcon from '@mui/icons-material/Payment';

declare global {
  interface Window {
    Cashfree: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Add welcome message
    setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer b3cbc1a562f24151861dd7df8dd1ab74"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
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

    const cashfree = new window.Cashfree({ mode: "sandbox" });

    const checkoutOptions = {
      paymentSessionId: "session_NTdVduz3Hw4BBNMoKSwi73ecOffygM6_a8oK3MkJgXSkCDZsxQflIDBk1fb36oHVzGPn629erVrICcKh4nB8CDaScM7XurubjOXX7x04m",
      redirectTarget: "_self",
      returnUrl: "http://localhost:5000/api/status/{order_id}",
    };

    cashfree.checkout(checkoutOptions);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI Chat Assistant
            </Typography>
            <Button 
              color="inherit" 
              // startIcon={<PaymentIcon />} 
              onClick={handlePayment}
              disabled={!cashfreeLoaded}
            >
              {cashfreeLoaded ? "Upgrade" : "Loading Payment..."}
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          <Container maxWidth="md">
            <List sx={{ width: '100%' }}>
              {messages.map((message, index) => (
                <ListItem key={index} sx={{
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  px: 0
                }}>
                  {message.role === 'assistant' && (
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>
                    </ListItemAvatar>
                  )}
                  <Card sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                    color: message.role === 'user' ? 'common.white' : 'text.primary',
                    borderRadius: message.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0'
                  }}>
                    <ListItemText 
                      primary={message.content} 
                      primaryTypographyProps={{
                        style: { whiteSpace: 'pre-wrap' }
                      }}
                    />
                  </Card>
                  {message.role === 'user' && (
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
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

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
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
                      >
                        {/* <SendIcon /> */}
                        <p>Send</p>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;