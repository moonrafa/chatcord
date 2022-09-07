const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const usersList = document.getElementById('users')
const roomName = document.getElementById('room-name')

// get username and room from url using qs
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})
const socket = io()
//join chatroom
socket.emit('joinRoom', { username, room })

//get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

// message from server
socket.on('message', message => {
  //console.log(message)
  outputMessage(message)
  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// message submit

chatForm.addEventListener('submit', e => {
  e.preventDefault()

  //get message text
  const msg = e.target.elements.msg.value

  //emit message to server
  // console.log(msg)
  socket.emit('chatMessage', msg)

  //clear form
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

//output message to DOM
const outputMessage = message => {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time}</span> </p>
  <p class="text">
  ${message.text}
  </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

const outputRoomName = room => {
  roomName.innerText = room
}
const outputUsers = users => {
  usersList.innerHTML = `${users
    .map(user => `<li> ${user.username}</li>`)
    .join('')}`
}
