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
      id
      writer {
        username
      }
      content
      date
    }
  }
`

export const ME = gql`
  query me{ 
    me {
      username
      id
      registrationDate
      games {
        id
        black {username}
        white {username}
        winner
        moves {
          from
          to
          promotion
          takenPiece {type color}
          enPassant
        }
        date
      }
    }
  }
` 