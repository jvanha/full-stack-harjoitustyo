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