import { gql } from "@apollo/client";

export const ALL_USERS = gql`
  query allUsers {
    allUsers {
      username
      id
    }
  }
`
export const ALL_MESSAGES = gql`
  query allMessages {
    allMessages {
      writer
      content
    }
  }
`

export const ME = gql`
  query me{ 
    me {
      username
      id
    }
  }
` 