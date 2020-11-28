import React from 'react'

const Users = ({ users }) => {
  return (
    <div>
      <ul>
        {users.map(user => <li>{user.username}</li>)}
      </ul>
    </div>
  )
}
export default Users