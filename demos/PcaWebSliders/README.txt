Copyright 2014-2017 John Treacy

This demo program shows the usage of the pca9685 module.

To use it, take a look at public/index.html and modify as needed. As it is written, the pca board is connected to some LEDs, 2 red, 2 yellow, 2 green, 2 white and also to some various servos, including some continuous rotation. 

The demo then uses simple jquery sliders to allow the leds to be dimmed or the servos to be moved within their range.

The demo depends on socket.io and mime. Run npm install to get the latest for your installation.

To start the demo, sudo node server.js. Then point a browser to this host:3000
