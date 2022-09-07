const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessages = require('./assets/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./assets/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)
    // console.log('new ws connection')
    // single user connect
    socket.emit(
      'message',
      formatMessages('Dazzcord Bot', 'Welcome to Dazzcord')
    )

    //broadcast when a user connects (to everybody except user)

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessages('Dazzcord Bot', `${user.username} has joined the chat`)
      )

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  //listen for chatMessage
  socket.on('chatMessage', msg => {
    //  console.log(msg)
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessages(user.username, msg))
  })

  //when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      //to all users
      io.to(user.room).emit(
        'message',
        formatMessages('Dazzcord Bot', `${user.username} has left the chat`)
      )
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
