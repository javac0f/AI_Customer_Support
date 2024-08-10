'use client'
import {Box, Stack, TextField, Button} from '@mui/material'
import Image from 'next/image'
import {useState, useRef, useEffect} from 'react'

export default function Home() {
  const[messages, setMessages] = useState([
    {
      role:'assistant',
      content: "Hi, I'm a Support Agent; How may I assist you today?"
    }
  ])
  
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  //FUNCTION: SEND MESSAGE
  const sendMessage = async() => {
    if(!message.trim() || isLoading) return; // handles the exception of sending empty msgs
    setIsLoading(true)

    setMessage('')  // Clear the input field
    setMessages((messages)=>[
      ...messages,
      {role: "user", content: message},  // Add user's message to the chat
      {role: 'assistant', content: ''}  // Add a placeholder for the assistant's response
    ])

    try{
      //SEND MSG TO SERVER
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type':  'application/json',
        },
        body: JSON.stringify([...messages, {role: 'user', content: messages}])
    })
    
    if(!response.ok){
      throw new Error('Network response was not OK')
    }
    
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    
    while(true){
      const{done, value} = await reader.read()
      if(done) break

      const text = decoder.decode(value || new Int8Array(), {stream:true})
      setMessages((messages)=>{
        let lastMesage = messages[messages.length - 1]  // the last message
        let otherMessages = message.slice(0, messages.length-1) //all messages except the last one
        return[
          ...otherMessages,
          {...lastMessage,content: lastMessage.content + text},
          ]
        })
      }
    }catch(error){
      console.error('Error:', error)
      setMessages((messages)=>[
        ...messages,
        {role:'assistant', content: "Error encountered. Please Try Again later."}
      ])
    }

    setIsLoading(false)
  }

  //FUNCTION: KEY PRESS
  const handleKeyPress = (event) => {
    if(event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  //FUNCTION AUTO-SCROLLING
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  useEffect(() =>{
    scrollToBottom()
  }, [messages])





  //MAIN RETURN
  return <Box 
            width="100vw" 
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="Center"
            alignItems="center">
    
    <Stack 
      direction="column" 
      width="600px"
      height="700px"
      border="1px solid black" 
      p={2}
      spacing={3}>

      <Stack 
        direction="column"
        spacing={2}
        flexGrow={1}
        overflow="auto"
        maxHeight="100%">

        {messages.map((message, index) => (
            <Box 
              key = {index} 
              display = 'flex' 
              justifyContent={
                message.role==='assistant' ? 'flex-start' : 'flex-end'
            }
            >
              <Box
                bgcolor = {
                  message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                }
                color = "white"
                borderRadius={16}
                p={3}
              >
                {message.content}
                </Box>
            </Box>
        ))
        }
        <div ref = {messagesEndRef}/>
      </Stack>
      <Stack direction = "row" spacing = {2}>
          <TextField
            label = "message"
            fullWidth
            value={message}
            onChange = {(e) => setMessage(e.target.value)}
            onKeyPress = {handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            variant = "contained" 
            onClick={sendMessage}
            disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
      </Stack>
    </Stack>
  </Box>

}