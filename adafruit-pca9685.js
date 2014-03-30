/*
 * module adafruit-pca9685.js
 * node  module for controlling the Adafruit 16-channel 12-bit PWM/Servo driver
 * requires: i2c, sleep 
 * Usage makePwm = require('adafruit-pca9685')
 * pwm = makePwm({options})  address=0x40 for out of box Adafruit module
 * pwm.setFreq(freq); default freq = 50, yeilding 20 ms period, which servos like
 * pwm.setFreq(freq, correction); needed if you want to tune the freqency
 * pwm.setPwm(channel, on, off); 
 * pwm.setPulse(channel, pulse); convenience for setting servos - on = 0 and off = pulse/(#uS per bit)
 * Author: John Treacy
 * copyright 2013 John Treacy
 */

// TODO add jslint comment
//       extend functionality to cover additional capability described in the datasheet

// -------------------------BEGIN MODULE SCOPED VARIABLES ------------------------------
var  
    i2c, i2cSend, i2cRead, // i2c instance and functions to wrap writing/reading
    clearAll,  // convenience function to turn off all pwms at once
    frequency, setFrequency, getFrequency, // private property and accessor
    isValidFreq, isValidChannel, isValidPwm, isValidPulse, // validators for args to public methods

// public methods
     setFreq, setPwm, setPulse, stop,

//PCA9685 Address constants
     __MODE1              = 0x00,
     __PRESCALE           = 0xFE,
     __LED0_ON_L          = 0x06,
     __LED0_ON_H          = 0x07,
     __LED0_OFF_L         = 0x08,
     __LED0_OFF_H         = 0x09,
     __ALLLED_ON_L        = 0xFA,
     __ALLLED_ON_H        = 0xFB,
     __ALLLED_OFF_L       = 0xFC,
     __ALLLED_OFF_H       = 0xFD,

// external modules
     I2C = require('i2c'),
     sleep = require('sleep');

//-------------------------- END MODULE SCOPED VARIABLES ------------------------------
  
//-------------------------- BEGIN MODULE PRIVATE/UTILITY METHODS ----------------------------

// method i2cSend: utility function to wrap i2c.writeBytes 
//   cmd is one of the PCA9685 addresses above, values is context dependent on which command
//   see the PCA9685 datasheet for details
i2cSend = function(cmd, values) {
    if (!(values instanceof Array))
      values = [values];
    i2c.writeBytes(cmd, values, function(error) {
	if (error != null)
	    console.log("I2C error", error);
    });
}

// method i2cRead(): utility to wrap i2c.readBytes
//   cmd is one of the PCA9685 addresses above, length is # of bytes
i2cRead = function(cmd, length) {
    var result;
    i2c.readBytes(cmd, length, function (err, res) {
	if (err != null) {
	    console.log("I2C read error", err);
	    throw new Error(err);
	}
	result = res[0];
    }); 
    return result;
};

// private accessors for frequency property
// This property is set and used to set the freqency of the PCA9685 
// and later used in pulse calculations

setFrequency = function(freq) {
    frequency = freq;
};

getFrequency = function() {
    return frequency;
};

// clearAll - Turn off all channels at once - useful for setup and shutdown
clearAll = function() {
    i2cSend(__ALLLED_OFF_H, 0x10);
}

isValidChannel = function(channel) {
    return (channel > -1 &&
            channel < 16 );
}

isValidPwm = function(pwm) {
    return (pwm > -1 &&
	    pwm < 4096);
}

isValidPulse = function(pulse) {
    return (pulse > -1 &&
	    pulse < 1000000/getFrequency());
}

isValidFreq = function(freq) {
    return (freq >= 40 
	    && freq < 1000);
}

//-------------------------- END MODULE PRIVATE/UTILITY METHODS --------------------

//-------------------------- BEGIN PWM PUBLIC METHODS  -------------------------

// method setFreq(frequency, correctionfactor) 
// correction factor may be needed to get actual frequency - ymmv
// I have found that 1.118 correction factor with 50 hz gives me very close to 50
// but 50 with no factor gives over 55 Hz measured with a logic analyzer

setFreq = function(freq, correctionFactor) {
    if (! isValidFreq(freq)) throw new Error("Frequency must be between 40 and 1000 Hz");
    var oldmode, newmode, prescale, 
      prescaleval = 25000000;
    setFrequency(freq);
    correctionFactor = correctionFactor || 1.0;
    prescaleval = 25000000;
    prescaleval /= 4096.0;
    prescaleval /= freq;
    prescaleval -= 1.0;
    prescale = Math.floor(prescaleval * correctionFactor + 0.5);
    oldmode = i2cRead(__MODE1, 1);
    newmode = (oldmode & 0x7F) | 0x10;	
    i2cSend(__MODE1, newmode);
    i2cSend(__PRESCALE, Math.floor(prescale));
    i2cSend(__MODE1, oldmode);
    sleep.usleep(10000);
    i2cSend(__MODE1, oldmode | 0x80);
}

// method setPwm(channel, off, on)
// Set the pwm on off values 0-4095 for a channel 0-15

setPwm = function(channel, pulseon, pulseoff) {
    // validate inputs
    if (!( isValidChannel(channel)
	   && isValidPwm(pulseon)
	   && isValidPwm(pulseoff)
	 )) throw new Error("Ivalid inputs to setPwm");
    // inputs ok
    i2cSend(__LED0_ON_L+4*channel, pulseon & 0xFF);
    i2cSend(__LED0_ON_H+4*channel, pulseon >> 8);
    i2cSend(__LED0_OFF_L+4*channel, pulseoff & 0xFF);
    i2cSend(__LED0_OFF_H+4*channel, pulseoff >> 8);
}

// method setPulse(channel, pulse)
// Set pwm on at time 0 and off a number of microseconds later
setPulse = function(channel, pulse) {
    if (! isValidChannel(channel)) throw new Error("Channel must be between 0 and 15");
    if (! isValidPulse(pulse)) throw new Error("Pulse must be > 0 and less than PWM period");
    var pulseLength;
    pulseLength = 1000000; // usecs in a second
    pulseLength /= getFrequency(); // period of a pulse, eg 20 ms
    pulseLength /= 4096; // 12 bit resolution - time per 1 unit 
    pulse /= pulseLength;
    setPwm(channel, 0, Math.floor(pulse));
}

// method stop() 
// leave everything in a clean state
stop = function() {
    clearAll();
}

// ** Constructor makePwm() ** 
// This is the only object exported by the module using require().
// It is then used to create the pwm instance
// takes optional argument object with the following parameters
//    freq: freqency to set pwm modulator, default 50 Hz (20ms pulses)
//    correctionFactor: optional factor to apply to prescale to fine tune frequency setting, default 1.0
//    address: i2c bus address, default 0x40
//    device: i2c device name, default '/dev/i2c-1'
//    debug: make additional debug functionality available

makePwm = function( arg_map ) {
    var pwm, address, deviceName, correctionFactor;
    arg_map = arg_map || {};
    pwm = {
      setFreq    : setFreq,
      setPwm     : setPwm,
      setPulse   : setPulse,
      stop       : stop
    };

    // set device parameters using arg_map values or defaults 
    setFrequency(arg_map['freq'] || 50);
    address = arg_map['address'] || 0x40;
    deviceName = arg_map['device'] || '/dev/i2c-1';
    correctionFactor = arg_map['correctionFactor'] || 1.0;

    // get an i2c connection to the pwm board, initialize frequency and set all channels off
    i2c = new I2C(address,{device: deviceName});
    i2cSend(__MODE1, 0x00);
    pwm.setFreq(frequency, correctionFactor);
    clearAll();

    // Turn on debugging if asked
    if (arg_map['debug'] === true) {
	pwm.debug = {
	    getFrequency: getFrequency,
	    getCorrectionFactor: function(){
		return correctionFactor;
	    }
	};
    }

  return pwm;
};
//-------------------------  END PWM PUBLIC METHODS  -------------------------

// export only the constructor 

module.exports = makePwm;
 
