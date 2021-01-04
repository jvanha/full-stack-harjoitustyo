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

export const CHALLENGE_ISSUED = gql`
  subscription challengeIssued($playerId: String!){
    challengeIssued(playerId: $playerId) {
      username
      id
    }
  }
`