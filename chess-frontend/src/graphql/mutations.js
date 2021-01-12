import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation createUser($username: String!) {
    createUser(username: $username) {
      username
      id
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
  mutation challenge($id: String! $username: String!) {
    challenge(id: $id username: $username) {
      username
      id
    }
  }
`

export const ACCEPT_CHALLENGE = gql`
  mutation acceptChallenge($id: String! $username: String!) {
    acceptChallenge(id: $id username: $username) {
      username
      id
    }
  }
`
export const DECLINE_CHALLENGE = gql`
  
`
export const MAKE_A_MOVE = gql`
  mutation makeAMove($userId: String! $from: Int! $to: Int!) {
    makeAMove(userId: $userId from: $from to: $to) {
      to
      from
    }
  }
`




