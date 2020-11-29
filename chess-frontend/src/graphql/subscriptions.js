import { gql } from "@apollo/client";

export const USER_LOGGED_IN = gql`
  subscription {
    userLoggedIn {
      username
      id
    }  
  }
`
export const USER_LOGGED_OUT = gql`
  subscription {
    userLoggedOut {
      username
      id
    }  
  }
`