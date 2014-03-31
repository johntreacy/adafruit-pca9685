adafruit-pca9685
==============

This is a **node.js** library for driving the Adafruit 12 bit 16 channel PWM Driver based on the PCA9685 with the **Raspberry Pi** 


Installation:

```sh
npm install adafruit-pca9685 (eventually - not yet published to npm)
```

In your node.js file just require the library:
```js
var makePwm = require( "adafruit-pca9685" );
```

This returns a constructor which you can now use to create a pwm instance using:
```js
var pwm = makePwm();
```
The constructor can also be called with an argument map object. The map below shows defaults

```js
 {
    "freq": "50",   // frequency of the device
    "correctionFactor": "1.0", // correction factor - fine tune the frequency 
    "address": "0x40", // i2c bus address
    "device": '/dev/i2c-1', // device name
    "debug": <null> // adds some debugging methods if set 
  }
```
The created pwm object has four methods
```js
pwm.setFrequency(freq, correctionFactor);
pwm.setPwm(channel, on, off);
pwm.setPulse(channel, pulse);
pwm.stop();
```

A demo using a web application is in the demo folder

*Remember:* You must run your application as `root` 



