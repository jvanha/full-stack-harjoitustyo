import { useMutation, useSubscription } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { Button, Comment, Form } from 'semantic-ui-react'
import { ADD_MESSAGE } from '../graphql/mutations'
import { MESSAGE_ADDED } from '../graphql/subscriptions'

const Chat = () => {
  const [ messages, setMessages ] = useState([])
  const [ message, setMessage ] = useState('')

  useSubscription(MESSAGE_ADDED, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('MESSAGE_ADDED subscriptionData',subscriptionData)
      const addedMessage = subscriptionData.data.messageAdded
      setMessages(messages.concat(addedMessage))
    }
  })

  const [ addMessage, result ] = useMutation(ADD_MESSAGE) 
  const submit = (event) => {
    event.preventDefault()
    addMessage({variables: { message }})
    
  }
  useEffect(() => {
    if (result.data) {
      console.log(result.data.addMessage)
      setMessages(messages.concat(result.data.addMessage))
      setMessage('')
    }
  },[result.data])
  return (
    <Comment.Group minimal>
      {messages.map(message =>
        <Comment key={message.content}>
          <Comment.Author>{message.writer.username}</Comment.Author>
          <Comment.Metadata>Just now</Comment.Metadata>
          <Comment.Text>{message.content}</Comment.Text>
        </Comment>  
      )}
      <Form>
        <Form.TextArea
          value={message}
          onChange={(e, content) => setMessage(content.value)}
        />
        <Button onClick={submit} content='Send' primary/>
      </Form>
    </Comment.Group>
  )
}

export default Chat