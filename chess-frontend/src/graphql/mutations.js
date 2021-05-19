import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation createUser($username: String! $password: String!) {
    createUser(username: $username password: $password) {
      username
      id
    }
  }
`
export const CREATE_GAME = gql`
  mutation createGame($whiteId: String! $blackId: String! $winner: String!) {
    createGame(whiteId: $whiteId blackId: $blackId winner: $winner) {
      whiteId
      blackId
      winner
    }
  }
`
export const LOGIN = gql`
  mutation login($username: String! $password: String!) {
    login(username: $username password: $password) {
      value
    }
  }
`
export const LOGOUT = gql`
  mutation {
    logout {
      username
      id
    }
  }
`
export const CHALLENGE = gql`
  mutation challenge($id: String! $username: String! $timeControl: Int) {
    challenge(id: $id username: $username timeControl: $timeControl) {
      opponents {
        challenged {
          username
          id
        }
      }
    }
  }
`
export const CANCEL_CHALLENGE = gql`
  mutation cancelChallenge($id: String! $username: String!) {
    cancelChallenge(id: $id username: $username) {
      username
      id
    }
  }
`
export const ACCEPT_CHALLENGE = gql`
  mutation acceptChallenge($id: String! $username: String! $timeControl: Int) {
    acceptChallenge(id: $id username: $username timeControl: $timeControl) {
      opponents {
        challenger {
          username
          id
        }
      }
      timeControl
    }
  }
`

export const DECLINE_CHALLENGE = gql`
  mutation declineChallenge($id: String! $username: String!) {
    declineChallenge(id: $id username: $username) {
      username
      id
    }
  }
`

export const MAKE_A_MOVE = gql`
  mutation makeAMove($userId: String! $from: Int! $to: Int! $time: Int! $promotion: String) {
    makeAMove(userId: $userId from: $from to: $to time: $time promotion: $promotion) {
      to
      from
    }
  }
`

export const ADD_MESSAGE = gql`
  mutation addMessage($message: String!) {
    addMessage(message: $message) {
      writer {
        username
      }
      content
    }
  }
`
export const RESIGN = gql`
  mutation resign($userId: String!) {
    resign(userId: $userId)
  }
`




