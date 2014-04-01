// main library for handling pwm events
// Events are pwm requests channel, value = offtime, on-time always 0 

var socketio, io, PwmDriver, pwm, makePwm, Gpio;

socketio = require('socket.io');
makePwm = require('adafruit-pca9685');
pwm = makePwm({"freq": 50, "correctionFactor": 1.118});

// deal with any signals and cleanup

process.on('SIGINT', function(code) {
    console.log("\nCtrl-C caught ...");
    process.exit(0);
});

process.on('SIGHUP', function(code) {
    console.log("exiting ...");
    process.exit(0);
});

process.on('exit', function(code) {
    console.log("exiting ...");
    process.exit(0);
});

// Setup the socketio connection and listeners

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function (socket) {
      console.log('client connected');
    handlePwmRequest(socket);
    handlePwmPulseRequest(socket);
    handleStopRequest(socket);
    handleClientDisconnection(socket);
  });
};

function handlePwmRequest(socket) {
    socket.on('pwm', function(channel, value) {
	var ch = parseInt(channel);
        var v = parseInt(value);
	pwm.setPwm(ch, 0, v); 
      });
}

function handlePwmPulseRequest(socket) {
    socket.on('pwmpulse', function(channel, value) {
	var ch = parseInt(channel);
        var v = parseInt(value);
	pwm.setPulse(ch, v); 
      });
}

function handleStopRequest(socket) {
    socket.on('pwmstop', function() {
	pwm.stop();
    });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    pwm.stop();
      console.log("client disconnected");
  });
}


