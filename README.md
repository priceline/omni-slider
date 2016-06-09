# omni-slider

This is a JavaScript implementation of a slider to select a numeric value or a range. The slider is horizontal and can be implemented with one handle or two. Following are some technical details for the omni-slider:

- Vanilla JS
- 9.34 KB minified
- 18.86 KB unminified

## Demo

Three ways to try out the Priceline omni-slider:

 - Use it to live search at [priceline.com](https://www.priceline.com)
 - View the functionality on our [demo page](http://pricelinelabs.github.io/omni-slider/)
 - Download the demo with the omni-slider source file [ZIP](https://github.com/pricelinelabs/omni-slider/archive/master.zip)

## Features

 - Two handle sliding to select a numeric range
 - One handle sliding from left/minimum to right/maximum
 - Touch and mouse capability
 - Currency (`typeof Number`) or Date (`typeof Date`)
 - Custom minimum and maximum values
 - Pub/sub implementation for each state in the process
 - Overlap and touching each other for final state
 - Preset the initial location of the handles
 - Push data into slider (setting the value)
 - Can be disabled
 - Can change design using css (see `fly.css` inside `demo` folder)

## Supported Browsers

 - IE9
 - IE11
 - Chrome
 - Safari
 - Mobile Safari
 - Android Default Browser

## Using the Slider

### Declare the slider

```html
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="omni-slider.css">
<script type="text/javascript" src="es5-shim.js"></script>
<script type="text/javascript" src="omni-slider.js"></script>
var element = document.getElementById('harryPotter');
var options = {
    isDate: false,
    min: 3,
    max: 1980,
    start: 7,
    end: 31,
    overlap: false
};
var mySlider = new Slider(element, options);
</script>
```
> #### new Slider(elementContainer, options)
> 
> Defines the slider features: 
> 
> - one handle (minimum/maximum) or two handle (range)
> - currency or date
> 
> `<elementContainer>`
> 
> - expects a `div` DOM element or node that acts as a wrapper for the slider
> - all of the slider's DOM elements will be transcluded inside the `<elementContainer>` provided
> 
> `<options>`
> 
> - must be of type `object`
> - defines the following currently supported slider options
>   - `isOneWay` - Boolean, denotes if slider only has one handle
>   - `isDate` - Boolean, denotes if returning a date object
>   - `overlap` - Boolean, denotes if handles will overlap or just sit next to each other
>   - `callbackFunction` - Function, denotes if a generic callback function is provided to apply to the value of the Slider
>   - `min` - Lower bounds of the slider (if isDate true typeof String [yyyy-mm-ddThh:mm] else typeof Number)
>   - `max` - Upper bounds of the slider (if isDate true typeof String [yyyy-mm-ddThh:mm] else typeof Number)
>   - `start` - Initial starting position of the left hand slider (if isDate true typeof String [yyyy-mm-ddThh:mm] else typeof Number)
>   - `end` - Initial starting position of the right hand slider (if isDate true typeof String [yyyy-mm-ddThh:mm] else typeof Number)
> 
> `<elementContainer>` - is the `div` container element
> 
> `<options>` - can be defined to customize the slider

### Add listeners

```javascript
var mySlider = new Slider(element, options);
var harry = mySlider.subscribe('start', function(data) {
    console.log('harry ' + data.left);
});
var potter = mySlider.subscribe('moving', function(data) {
    console.log('potter ' + data.right);
});
var data = mySlider.subscribe('start', function(data) {
    console.log(data);
});
potter.remove();
var hermione = mySlider.subscribe('moving', function(data) {
    console.log('hermione ' + data.right + data.left);
});
```

> #### Slider.prototype.subscribe(topic, listener)
> 
> `topic` (type String)
> 
> - `start` - triggers when the handle is selected
> - `moving` - triggers when the handle is being moved
> - `stop` - triggers when the handle is released
> 
> `listener` (type Function)
> 
> - will receive the result of `Slider.prototype.getInfo()` as an argument
> - will be called with the argument (above) once the topic has been fired/published
> 
> `returns`
> 
> - an object with accessor method `remove()` which removes the listener from binding to the topic

### Preset a slider value

This can be used to preset a handle at a specific value upon initially generating the page or it can move a slider handle based on value typed in a field. It also initially checks whether the handles are overlapping and for other built-in features.

```javascript
// Two Way
var mySlider = new Slider(... , {isOneWay: false});
var data = {
    left: 7,
    right: 31
};
mySlider.move(data);

// One Way
var myOneWaySlider = new Slider(... , {isDate: true, isOneWay: true});
myOneWaySlider.move(new Date('1980-07-31'));
```

> #### Slider.prototype.move(data, preventPublish)
> 
> `data`
> - type `object` for two way sliders or `number` for one way sliders
> - if it is an object it should be constructed:
> 
> `left`
> - value of the left handle of the slider
> - can be a date object if slider `isDate === true` or a floating point number otherwise
> 
> `right`
> - value of the right handle of the slider
> - can be a date object if slider `isDate === true` or a floating point number otherwise
> 
> `preventPublish`
> - type `boolean`
> - if true then it won't publish the `moving` topic otherwise it will
> 
> Reverse of `Slider.prototype.getInfo()` in terms of data provided. If you are setting a two way slider then you pass in an object otherwise if it is a one way slider you only pass in a value.

### Extract slider values

Example for a two handle slider

```javascript
var mySlider = new Slider(...);
var data = mySlider.getInfo();
console.log(data.left); // left handle value
console.log(data.right); // right handle value
```

If it is a one handle slider, then it will return just the value rather than an object. In this case, the value is calculated from the left handle rather than the fill.

> #### Slider.prototype.getInfo()
> 
> Essentially the data for the slider is *always* available since the `slider-fill` is made up of percentages. `slider.getInfo()` merely extracts the said percentages and generates a human-readable value based on the context of the application (either date or currency). `Slider.getInfo()` returns an object with `left` and `right` properties.
> 
> `left`
> - value of the left handle of the slider
> - can be a date object if slider `isDate === true` or a floating point number otherwise
> 
> `right`
> - value of the right handle of the slider
> - can be a date object if slider `isDate === true` or a floating point number otherwise

### Disable the slider

```javascript
var disabledSlider = new Slider(document.getElementById('disabledSlider'), {
    overlap: true
});
disabledSlider.disable(true);
```

> #### Slider.prototype.disable
> 
> Makes the slider handle unmovable

## Development

To develop new features on top of this slider first download and build it with dependencies listed in `package.json`.

```
npm install
npm start
```

## Known Issues

 - Chrome Device Emulator does not allow us to bind `touchmove` to the `document` (i.e. `document.addEventListener('touchmove', this.movingHandler, true);`). 

 **Workaround: disable emulate touch screen under Emulation at the bottom tabs of dev tools**

 - Provided style sheet is a `.css` file not a `.scss` file so if the build process does not import `.css` it won't get taken. 
 
 **Workaround: rename the `.css` file into `.scss`**

## License

omni-slider is released under the MIT license.
