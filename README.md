# omni-slider

This is a javascript implementation of a two way / one way slider.

Details:
- Vanilla JS
- 12 KB minified
- 20 KB unminified.

Expects an ES5 shimmed environment when it is used (i.e. `bind`, `forEach`)

## Features

 - Two way or one way slider
 - Left to right sliding
 - Touch and mouse capability
 - Cross user agent support
 - Currency (`typeof Number`) or Date (`typeof Date`)
 - Custom max and min
 - Pub/sub implementation for each state in the process
 - Overlap and touching each other for final state
 - Preset the initial location of the handles
 - Theme-able
 - Disable-able
 - Push data into slider (setting the value)

## Supports

 - IE8
 - IE9
 - IE11
 - Chrome
 - Safari
 - Mobile Safari
 - Android Default Browser

## Installation

To Start:
```html
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="omni-slider.css">
<script type="text/javascript" src="es5-shim.js"></script>
<script type="text/javascript" src="omni-slider.js"></script>
<scipt>
    var slider = new Slider(<elementContainer>, <options>);
</script>
```

`<elementContainer>` - is the `div` container element

`<options>` - to go beyond the default options

## API

### new Slider(elementContainer, options)

`<elementContainer>`
 - expects a `div` DOM element or node
 - this acts as a wrapper for the slider, all of the sliders DOM elements will be transcluded inside the `<element>` provided

`<options>`
 - must be of type `object`
 - contains the options for the slider
 - Currently supported options:
    - `isOneWay` - Boolean, denotes if slider only has one handle
    - `isDate` - Boolean, denotes if returning a date object
    - `overlap` - Boolean, denotes if handles will overlap or just sit next to each other
    - `min` - Lower bounds of the slider (if isDate ? typeof String [yyyy-mm-ddThh:mm] : typeof Number)
    - `max` - Upper bounds of the slider (if isDate ? typeof String [yyyy-mm-ddThh:mm] : typeof Number)
    - `start` - Initial starting position of the left hand slider (if isDate ? typeof String [yyyy-mm-ddThh:mm] : typeof Number)
    - `end` - Initial starting position of the right hand slider (if isDate ? typeof String [yyyy-mm-ddThh:mm] : typeof Number)
 
Example:

```javascript
var element = document.getElementById('harryPotter');
var options = {
    isDate: false,
    min: 3,
    max: 1980,
    start: 7,
    end: 31,
    overlap: false
}
var mySlider = new Slider(element, options);
```

### Slider.prototype.subscribe(topic, listener)

`topic` (type String)
 - `start` - triggers when the handle is selected
 - `moving` - triggers when the handle is being moved
 - `stop` - triggers when the handle is released

`listener` (type Function)
 - will receive the result of `Slider.prototype.getInfo()` as an agrument
 - will be called with the argument (above) once the topic has been fired/published

`returns`
 - an object with accessor method `remove()` which removes the listner from binding to the topic

Example:

```javascript
var mySlider = new Slider(element, options);
var harry = mySlider.subscribe('start', function(data) {
    console.log("harry " + data.left);
});
var potter = mySlider.subscribe('moving', function(data) {
    console.log("potter " + data.right);
});
var data = mySlider.subscribe('start', function(data) {
    console.log(data);
});
potter.remove();
var hermione = mySlider.subscribe('moving', function(data) {
    console.log("hermione " + data.right + data.left);
});
```

### Slider.prototype.getInfo()

Essentially the data for the slider is *always* available since the `slider-fill` is made up of percentages. `slider.getInfo()` merely extracts the said percentages and makes it readable based on the context of the application (either date or value).

Returns an object with `left` and `right` properties.

`left`
 - value of the left handle of the slider
 - can be a date object if slider `isDate` === true or a floating point number otherwise

`right`
 - value of the right handle of the slider
 - can be a date object if slider `isDate` === true or a floating point number otherwise

Example:

```javascript
var mySlider = new Slider(...);
var data = mySlider.getInfo();
console.log(data.left); // left handle value
console.log(data.right); // right handle value
```

If it is a one way slider, then it will return just the value rather than an object.
Note: on the one way slider, the value is calculated from the left handle rather than the fill.

### Slider.prototype.move(data, preventPublish)

`data`
 - type `object` for two way sliders or `number` for one way sliders
 - if it is an object it should be constructed:

   `left`
    - value of the left handle of the slider
    - can be a date object if slider `isDate` === true or a floating point number otherwise

   `right`
    - value of the right handle of the slider
    - can be a date object if slider `isDate` === true or a floating point number otherwise

`preventPublish`
 - type `boolean`
 - if true then it won't publish the `moving` topic otherwise it will

Reverse of `Slider.prototype.getInfo()` in terms of data provided. If you are setting a two way slider then you pass in an object otherwise if it is a one way slider you only pass in a value.

This API does all the checks for overlapping and other built-in features so you know the slider is always valid.

Example:

```javascript
// Two Way
var mySlider = new Slider(... , {isOneWay: false});
var data = {
    left: 7,
    right: 31
}
mySlider.move(data);

// One Way
var myOneWaySlider = new Slider(... , {isDate: true, isOneWay: true});
myOneWaySlider.move(new Date('1980-07-31'));
```

## Development

```
npm install
npm start
```

## Known Issues

 - Chrome Device Emulator does not allow us to bind `touchmove` to the `document` (i.e. `document.addEventListener('touchmove', this.movingHandler, true);`). **Workaround: disable emulate touch screen under Emulation at the bottom tabs of dev tools**
 - Provided style sheet is a `.css` file not a `.scss` file so if the build process does not import `.css` it won't get taken. **Workaround: rename the `.css` file into `.scss`**

## License

omni-slider is released under the MIT license.
