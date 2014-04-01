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

A demo web application is in the demo folder

*Remember:* You must run your application as `root` 

## Acknowledgements

Some of the design for this module is is based on the [Adafruit python Code Library] 
(https://github.com/adafruit/Adafruit-Raspberry-Pi-Python-Code.git)

>  Here is a growing collection of libraries and example python scripts
>  for controlling a variety of Adafruit electronics with a Raspberry Pi
  
>  In progress!
>
>  Adafruit invests time and resources providing this open source code,
>  please support Adafruit and open-source hardware by purchasing
>  products from Adafruit!
>
>  Written by Limor Fried, Kevin Townsend and Mikey Sklar for Adafruit Industries.
>  BSD license, all text above must be included in any redistribution
>
>  To download, we suggest logging into your Pi with Internet accessibility and typing:
>  git clone https://github.com/adafruit/Adafruit-Raspberry-Pi-Python-Code.git

Additional inspiration came from the pi4j project and the implementation of adafruit-i2c-pwm-driver node module.


