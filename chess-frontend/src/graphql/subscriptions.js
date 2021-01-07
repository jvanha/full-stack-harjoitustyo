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
      challenger {
        username
        id
      }
    }
  }
`
export const CHALLENGE_ACCEPTED = gql`
  subscription challengeAccepted($playerId: String!){
    challengeAccepted(playerId: $playerId) {
      challenged {
        username
        id
      }
    }
  }
`