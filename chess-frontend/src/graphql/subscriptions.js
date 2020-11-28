import { gql } from "@apollo/client";

export const USER_LOGGED_IN = gql`
  subscription userLoggedIn {
    userLoggedIn {
      username
      id
      
  }
`