// main library for handling pwm events
// Events are pwm requests channel, value = offtime, on-time always 0 

var socketio, io, PwmDriver, pwm, makePwm, Gpio, led, button;

socketio = require('socket.io');
//PwmDriver = require('adafruit-i2c-pwm-driver');
//pwm = new PwmDriver(0x40);
makePwm = require('adafruit-pca9685');
pwm = makePwm({"freq": 50, "correctionFactor": 1.118});
Gpio = require('onoff').Gpio;
// pwm.setPWMFreq(45);
    led = new Gpio(17, 'out');
    button = new Gpio(18, 'in', 'both');
    button.watch(function(err, value) {
      if (err) {
	  console.log("Button watch error: " + err);
      }
    led.write(1-value);
    });

process.on('SIGINT', function(code) {
    console.log("\nCtrl-C caught ...");
//    button.unexport();
//    led.unexport();
    process.exit(0);
});
process.on('SIGHUP', function(code) {
    console.log("exiting ...");
//    button.unexport();
//    led.unexport();
    process.exit(0);
});
process.on('exit', function(code) {
    console.log("exiting ...");
    button.unexport();
    led.unexport();
    process.exit(0);
});
exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function (socket) {
      console.log('client connected');
    handlePwmRequest(socket);
    handlePwmPulseRequest(socket);
    handleStopRequest(socket);
    handleClientDisconnection(socket);
//    led = new Gpio(17, 'out');
//    button = new Gpio(18, 'in', 'both');
    button.watch(function(err, value) {
      if (err) {
	  console.log("Button watch error: " + err);
      }
    led.write(1-value);
    socket.emit(value == 0 ? 'ledon': 'ledoff');
    });
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
//      button.unexport();
//      led.unexport();
      console.log("client disconnected");
  });
}


