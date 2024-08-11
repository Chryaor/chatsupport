'use client'

import { Box, Button, Stack, TextField, Typography,AppBar,Toolbar } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useRef, useEffect } from 'react'
import Icon from '../public/wave.svg';
import '@fontsource/roboto';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the OceanE assist bot. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const [chatVisible, setChatVisible] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  return (
    <Box
    width="100vw"
    height="100vh"
    sx={{   
        background: `url(${Icon.src}) center / cover`
    }}
  >
    
    <AppBar 
    position="static"
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    }}
    >
      <Toolbar
      sx={{ justifyContent: 'center' }}>
        <img
          src="https://www.svgrepo.com/show/324735/energy-green-offshore-turbine-wind.svg"
          alt="Company Logo"
          width="55px"
        />
      </Toolbar>
    </AppBar>

    {/* Main Content */}
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="calc(100vh - 100px)" 
      textAlign="center"
    >
      <Typography variant="h1" color="#006064" gutterBottom>
        OceanE
      </Typography>
      <Typography variant="h3" color="#455a64" maxWidth="600px" mt={2}>
        Your partner in Ocean renewable energy
      </Typography>
      <Typography 
      variant="h5" 
      color="#fff"
      sx={{
        pt:"120px"
      }}
      maxWidth="500px">
      <br />Join us on our journey to create a cleaner, greener world by tapping into the vast potential of ocean energy.
      </Typography>
      
    </Box>

    {/* Chatbot Button */}
    <Box
      position="fixed"
      bottom={20}
      right={20}
    >
      <button
        style={{
          backgroundColor: '#fcfcfc', 
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '1.5em',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => setChatVisible(!chatVisible) }
      >
        <img src="https://www.svgrepo.com/show/157271/paper-plane.svg" width="38px" height="auto"></img>
      </button>
    </Box>
    {chatVisible && (
        <Box
          position="fixed"
          bottom={90}
          right={20}
          width="400px"
          height="500px"
          border="1px solid #ccc"
          borderRadius="16px"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
          bgcolor="white"
          p={2}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Stack
            direction="column"
            spacing={3}
            overflow="auto"
            flexGrow={1}
            sx={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#f5f5f5',
                borderRadius: '3px',
              },
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? '#f2f2f2' : '#2f87fa'}
                  color={message.role === 'assistant' ? "#2e2d2d" : 'white'}
                  borderRadius={3}
                  p={1}
                  maxWidth="75%"
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction="row" spacing={2} mt={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={isLoading}
              sx={{ bgcolor: '#2f87fa', color: 'white' }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Box>
      )}
  </Box>
  )
}