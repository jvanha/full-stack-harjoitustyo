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
      opponents {
        challenger {
          username
          id
        }
      }
      timeControl
      color
    }
  }
`
export const CHALLENGE_CANCELLED = gql`
  subscription challengeCancelled($playerId: String!){
    challengeCancelled(playerId: $playerId) {
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
      opponents {
        challenged {
          username
          id
        }
      }
      timeControl
      color
    }
  }
`
export const CHALLENGE_DECLINED = gql`
  subscription challengeDeclined($playerId: String!){
    challengeDeclined(playerId: $playerId) {
      challenged {
        username
        id
      }
    }
  }
`
export const MOVE_MADE = gql`
  subscription moveMade($opponentId: String!) {
    moveMade(opponentId: $opponentId) {
      move {
        from
        to
        time
        promotion
      }
    }
  }
`
export const MESSAGE_ADDED = gql`
  subscription {
    messageAdded {
      id
      writer {
        username
      }
      content
      date
    }
  }
`
export const OPPONENT_RESIGNED = gql`
  subscription opponentResigned($opponentId: String!) {
    opponentResigned(opponentId: $opponentId)
    
  }
`
export const GAME_CREATED = gql`
  subscription gameCreated($playerId: String!) {
    gameCreated(playerId: $playerId) {
      id
      white {username}
      black {username}
      winner
      moves
      date    
    }
  }
`