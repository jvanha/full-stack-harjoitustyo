import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { Button, Comment, Form } from 'semantic-ui-react'
import { ADD_MESSAGE } from '../graphql/mutations'
import { ALL_MESSAGES } from '../graphql/queries'

const Chat = () => {
  const [ message, setMessage ] = useState('')
  const client = useApolloClient()
  const allMessagesResult = useQuery(ALL_MESSAGES)
  //console.log('Users result',result)
  const [ addMessage, result ] = useMutation(ADD_MESSAGE) 

  const submit = (event) => {
    event.preventDefault()
    addMessage({variables: { message }})
    
    setMessage('')
  }
  /*
  useEffect(()=>{
    console.log('result.data changed', result.data)
    if (result.data) {
      const addedMessage = result.data.addMessage
      const messagesInStorage = client.readQuery({ query: ALL_MESSAGES })
      client.writeQuery({
        query: ALL_MESSAGES,
        data: { allMessages: messagesInStorage.allMessages.concat(addedMessage)}
      })
    }
  },[result.data])
  */
  const time = (date) => {
    const commentDate = new Date(date)
    const elapsed = Date.now() - commentDate
    console.log('elapsed', elapsed)
    const days = Math.floor (elapsed / (1000*60*60*24))
    const hours = Math.floor(elapsed / (1000*60*60))
    const minutes = Math.floor(elapsed / (1000*60))
    if (days > 0) return `${days} days ago`
    if (hours > 0) return `${hours} hours ago`
    if (minutes > 0) return `${minutes} minutes ago`
    return 'Just now'
  }
  if (allMessagesResult.loading) return <div>loading...</div>
  console.log('allMessagesResult',allMessagesResult)
  return (
    <Comment.Group size='mini'>
      {allMessagesResult.data && allMessagesResult.data.allMessages.map(message =>
        <Comment key={message.id }>
          <Comment.Avatar src='https://react.semantic-ui.com/images/avatar/small/joe.jpg'/>
          
          <Comment.Content >
            <Comment.Author>{message.writer.username}</Comment.Author>
            <Comment.Metadata >
              <div>{time(message.date)}</div>
            </Comment.Metadata>
            <Comment.Text>{message.content}</Comment.Text>
          </Comment.Content>
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