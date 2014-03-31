/* pcaslider.js
 * author: John Treacy
 * copyright 2013 John Treacy
*/

var socket, resetButton, motorCap, makeSliderObj, makeLedSliderObj, makeServoSliderObj;

socket = io.connect();

//motorCap - capability of different servo types
// TODO move this to an external JSON file and use $.parseJSON() to retrieve
motorCap = {
    "Tower Pro MG995" : {"minVal": 525, "maxVal": 2175, description: "Tower Pro MG995"},
    "Tower Pro SG92R": {"minVal": 515, "maxVal": 2165},
    "Parallax Standard": {"minVal": 525, "maxVal": 2375},
    "Parallax Continuous": {"minVal": 1300, "maxVal": 1700},
    "generic": {"minVal": 1000, "maxVal": 2000}
};

makeSliderObj = function(args) {
    var sliderObj = {
	range: "min",
	animate: true,
	orientation: "vertical"
    };
    $.extend(sliderObj, args);
    return sliderObj;
};

makeLedSliderObj = function( args ) {
    var sliderObj = makeSliderObj(args);
    $.extend(sliderObj, {
	min: 0,
	max: 4095,
	step: 32,
	change: function(event, info) {
            console.log("slide change " + info.value + " " + $( this ).attr('channel'));
            socket.emit('pwm', $( this ).attr('channel'), info.value);
	}
    });
    return sliderObj;
};

makeServoSliderObj = function(args) {
    var sliderObj = makeSliderObj(args);
    $.extend(sliderObj, {
	step: 5,
	change: function(event, info) {
            console.log("slide change " + info.value + " " + $( this ).attr('channel'));
            socket.emit('pwmpulse', $( this ).attr('channel'), info.value);
	},
    });
    return sliderObj;
};

$(function() {
  // Find values and configure UI sliders for leds and motors 
  var value, sliderObj;

  // setup specific to led sliders
  $( "#leds > span" ).each(function() {
    var
    toolTipString = "Channel "+ $( this ).attr('channel');

    // use initial value from markup or 0 default if none was present
    value = parseInt( $( this ).text(), 10 ) || 0;
    sliderObj = makeLedSliderObj({value: value});

    // create the slider and add the tooltip
    $( this ).empty().slider(sliderObj)
      .tooltip({content: toolTipString}) 
      ;
    $( this ).attr('title', "LED"); // needs some title for tooltip to work - grr
    $( this ).attr('initval', value); // save for later use such as reset
  });

  // setup specific to  motor sliders
  $( "#motors > span" ).each(function() {
    var  minval, maxval, servoType, 
    toolTipString = "Channel "+ $( this ).attr('channel') + "<br>" + ($( this ).attr('servoType')|| "Generic Servo");

    // see if minval and maxval are set in markup 
    minval = parseInt($( this ).attr('minval'));
    maxval = parseInt($( this ).attr('maxval'));

    // now see if a recognized servo type is in markup, else use values for generic
    servoType = motorCap[$( this ).attr('servotype')] || motorCap["generic"];
    minval = minval || servoType["minVal"];
    maxval = maxval || servoType["maxVal"];

    // value saved from markup or 50% mark of range if none was present
    value = parseInt( $( this ).text(), 10 ) || parseInt((maxval-minval)/2 + minval);
    sliderObj = makeServoSliderObj({value: value, min: minval, max: maxval});
    // create the slider and add the tooltip
    $( this ).empty().slider(sliderObj)
      .tooltip({content: toolTipString}) 
    ;
    $( this ).attr('title', "servo");  // force the tooltip - grrr
    $( this ).attr('initval', value); // save for later use such as a reset
  });

  // setup the button  
    resetButton = $("#resetbutton");
    resetButton[0].onclick = function(){
	$("#motors > span, #leds > span").each(function() { $(this).slider('value', $(this).attr('initval'));});
//	socket.emit('pwmstop');
    }
    resetButton.button(); // give it jquery-ui l&f

    // set everything to initial state
    $("#motors > span, #leds > span").each(function() {
	$(this).slider('value', $(this).attr('initval'));
    });
});
