'use client'
import { useState } from 'react'
import { Box, Typography, Stack, TextField, Button } from '@mui/material'
import Image from 'next/image'
import '../app/globals.css'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Qesa (Chat) Mate. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('') // the user input for the chatbot
  const [isLoading, setIsLoading] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false) // state to toggle chatbot visibility

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box 
      display="flex"
      flexDirection="column"
      height="100vh"
      width="100vw"
      overflow="hidden"
      bgcolor={'#F4EEFF'}
    >
      {/* Top Banner */}
      <Box 
        width="100%"
        padding={2}
        bgcolor="#424874"
        color="white"
        textAlign="center"
        boxShadow="0px 2px 4px rgba(0, 0, 0, 0.1)" 
      >
        <Typography variant="h4">
          QesaMate
        </Typography>
      </Box>

      {/* Main Content */}
      <Box 
        display="flex"
        flexDirection="row"
        width="100%"
        maxWidth="1200px"
        marginLeft={5}
        marginTop={2} // Add margin to separate the banner from the content
      >
        {/* Left Side: Description and Image */}
        <Box 
          display="flex"
          flexDirection="column"
          width="50%"
          padding={2}
          alignItems="flex-start"
          gap={2}
          marginLeft="10%"
        >
          <Image 
            src="/assets/anim.gif" 
            alt="Chatbot" 
            width={620} 
            height={630} 
          />
          <Typography variant="h6" fontFamily={'inter'} fontSize={15} textAlign="left">
            QesaMate is your personal language learning assistant, designed 
            to help you master new languages with ease and confidence. 
            Whether you are a beginner or looking to polish your skills, 
            QesaMate is here to guide you through engaging conversations, 
            offer explanations, and provide valuable practice.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowChatbot(!showChatbot)} // Toggle the chatbot visibility
          >
            {showChatbot ? 'Close Chat' : 'Lets Chat!'}
          </Button>
        </Box>

        {/* Right Side: Chatbot (conditionally rendered) */}
        <Box
          position="fixed"
          top={0}
          right={showChatbot ? 0 : '-100%'} // Move the chatbot offscreen initially
          marginTop={10}
          height="90%"
          width={{ xs: '70%', sm: '50%', md: '35%', lg: '35%' }} // Responsive width
          maxWidth="2000px" // Maximum width for larger screens
          bgcolor="white"
          boxShadow="-3px 0 5px rgba(0,0,0,0.2)"
          zIndex={1000}
          padding={2}
          transition="right 0.3s ease-in-out" // Slide-in animation
        >
          <Stack
            direction="column"
            width="100%"
            height="100%"
            spacing={3}
          >
            <Stack
              direction="column"
              flexGrow={1}
              spacing={2}
              overflow="auto" // Allow the chat messages to scroll if they overflow
              maxHeight="calc(100vh - 100px)" // Reserve space for input and padding
              paddingRight={2} // Add padding so the scrollbar doesn't overlap content
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }
                >
                  <Box
                    bgcolor={
                      message.role === 'assistant'
                        ? '#424874'
                        : '#A6B1E1'
                    }
                    color="white"
                    borderRadius={6}
                    maxWidth="75%"
                    p={2}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction={'row'} spacing={2} alignItems="center">
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <Button variant="contained" onClick={sendMessage}>
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
