const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const axios = require('axios');

const port = process.env.PORT || 8181;

app.use(cors());

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.get('/ping', function (req, res) {
    res.send({'status': 'healthy', 'service': 'code-with-me'});
});

app.get('/execute/ping', function (req, res) {
    axios.get('http://127.0.0.1:8282/ping')
        .then(response => {
            res.send(response.data);
        }).catch(error => {
            res.send({'status': 'unavailable', 'service': 'code-with-me-executor'});
        });
});

app.get('/execute', function (req, res) {
    // Todo: This code goes into a socket channel (do not keep as endpoint).
    res.send({'error_message': 'service currently not available'});
    return

    axios.post('http://127.0.0.1:8282/v1/execute', {
        code: 'print("Hello world")'
    }).then(response => {
        res.send(response.data);
    }).catch(error => {
        res.send({});
    });
});

http.listen(port, () => {
    console.log('Listening on *:' + port);
});

const io = require('socket.io')(http);
io.on('connection', (socket) => {
    console.log('User connected.');
    socket.emit('connected', {});

    socket.on('message', (message) => {
        console.log('User sent a message: ' + message);
        
        io.emit('message', message);
    });

    socket.on('code_change', (message) => {
        // Send code changes to all other users.
        socket.broadcast.emit('code_change', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.')
    });
});
