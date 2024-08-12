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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box 
      display="flex"
      height="100vh"
      width="100vw"
      overflow="hidden"
    >
      <Box 
        display="flex"
        flexDirection="row"
        width="100%"
        maxWidth="1200px"
        margin="auto"
      >
        {/* Left Side: Description and Image */}
        <Box 
          display="flex"
          flexDirection="column"
          width="50%"
          padding={2}
          justifyContent="center"
          alignItems="flex-start"
          gap={2}
          paddingLeft="10px"
          style={{ marginLeft: '-20px' }}
        >
          <Image 
            src="/assets/chatbot.gif" 
            alt="Chatbot" 
            width={650} 
            height={530} 
          />
          <Typography variant="h6" fontFamily={'inter'} textAlign="left">
          QesaMate is your personal language learning assistant, designed 
          to help you master new languages with ease and confidence. 
          Whether you're a beginner or looking to polish your skills, 
          QesaMate is here to guide you through engaging conversations, 
          offer explanations, and provide valuable practice.
          </Typography>
        </Box>

        {/* Right Side: Chatbot */}
        <Box
          display="flex"
          flexDirection="column"
          width="50%"
          padding={2}
          borderLeft="1px solid #ddd"
        >
          <Stack
            direction="column"
            width="100%"
            height="100%"
            border="1px solid black"
            p={2}
            spacing={3}
            style={{ overflowY: 'auto' }}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
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
                        ? 'primary.main'
                        : 'secondary.main'
                    }
                    color="white"
                    borderRadius={16}
                    p={3}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction={'row'} spacing={2}>
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
