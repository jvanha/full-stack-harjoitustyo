import { gql } from "@apollo/client";

export const ALL_USERS = gql`
  query allUsers {
    allUsers {
      username
      id
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