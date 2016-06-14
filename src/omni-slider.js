/* Constructor function
 * elementContainer - this acts as a wrapper for the slider, all of the sliders DOM elements will be transcluded inside the <element> provided
 * options - contains the options for the slider
 */
class Slider {

  constructor(elementContainer = {}, options = {}) {

    // Validation of element, the only required argument
    if (!elementContainer || (elementContainer.nodeName !== 'DIV' && elementContainer.tagName !== 'DIV')) return;

    // Contains the options for this slider
    this.options = {
      isOneWay: null,
      isDate: null,
      overlap: null,
      callbackFunction: null,
      min: null,
      max: null,
      start: null,
      end: null,
    };

    // Custom Logic for 1 way
    let oneWay = false;
    if (options.isOneWay) {
      options.isOneWay = false;
      options.overlap = true;
      if (options.start && !options.end) {
        options.end = options.start;
      }
      options.start = null;
      oneWay = true;
    }

    // Handles this.options creation and options initialization
    this.init(options);

    // Contain pub/sub listeners
    this.topics = {
      start: [],
      moving: [],
      stop: [],
    };

    // Contains the DOM elements for the slider
    this.UI = {
      slider: null,
      handleLeft: null,
      handleRight: null,
      fill: null,
    };

    // Slider element
    const sliderElem = document.createElement('div');
    if (oneWay) {
      sliderElem.className = 'slider one-way';
    } else {
      sliderElem.className = 'slider';
    }
    this.UI.slider = sliderElem;

    // Left handle
    const handleLeft = document.createElement('div');
    handleLeft.className = 'handle handle-left';
    const circleLeft = document.createElement('div');
    circleLeft.className = 'slider-circle';
    handleLeft.appendChild(circleLeft);
    this.UI.handleLeft = handleLeft;
    this.UI.slider.appendChild(this.UI.handleLeft);

    // Right handle
    const handleRight = document.createElement('div');
    handleRight.className = 'handle handle-right';
    const circleRight = document.createElement('div');
    circleRight.className = 'slider-circle';
    handleRight.appendChild(circleRight);
    this.UI.handleRight = handleRight;
    this.UI.slider.appendChild(this.UI.handleRight);

    // Fill element
    const fill = document.createElement('div');
    fill.className = 'slider-fill';
    this.UI.fill = fill;
    this.UI.slider.appendChild(this.UI.fill);

    elementContainer.appendChild(this.UI.slider);

    // Move handles to have it's center as the end pointer point
    this.UI.handleLeft.style.marginLeft = '-' + (handleLeft.offsetWidth / 2) + 'px';
    this.UI.handleRight.style.marginRight = '-' + (handleRight.offsetWidth / 2) + 'px';

    // Push elements to starting positions
    const data = {
      left: this.options.start,
      right: this.options.end,
    };
    this.move.bind(this)(data, true);

    // Bind events to start listening
    this.startingHandler = this.starting.bind(this);
    this.UI.handleLeft.onmousedown = this.startingHandler;
    this.UI.handleLeft.ontouchstart = this.startingHandler;
    this.UI.handleRight.onmousedown = this.startingHandler;
    this.UI.handleRight.ontouchstart = this.startingHandler;
  }

  /* Default config
   * isOneWay (Boolean denotes if slider only has one handle)
   * isDate (Boolean denotes if returning a moment wrapped value)
   * overlap (Boolean denotes if handles will overlap or just sit next to each other)
   * min and max (isDate ? typeof String [yyyy-mm-ddThh:mm] : typeof Number) - bounds
   * start and end (isDate ? typeof String [yyyy-mm-ddThh:mm] : typeof Number) - starting position
   */
  get defaultOptions() {
    return {
      isOneWay: false,
      isDate: false,
      overlap: false,
      callbackFunction: null,
      min: 0,
      max: 100,
    };
  }

  /* Helper method (replace with shared function from library) */
  extend(defaults = {}, options = {}) {
    const extended = {};
    let prop;

    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }

    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }

    return extended;
  }

  // Initialize options and browser sniffing
  init(options = {}) {
    // Extend default options
    if (typeof options === 'object') {
      this.options = this.extend(this.defaultOptions, options);
    } else {
      this.options = this.defaultOptions;
    }

    // Default start/end
    this.options.start = this.options.start || this.options.min;
    this.options.end = this.options.end || this.options.max;

    // Handle currency vs date type sanitization
    if (this.options.isDate) {
      this.options.max = new Date(this.options.max).valueOf();
      this.options.min = new Date(this.options.min).valueOf();

      // Check if max and min are proper
      if (this.options.max < this.options.min) {
        this.options.min = this.options.max;
      }

      // Check if start and end are within bounds
      if (typeof this.options.start !== 'undefined' &&
        typeof this.options.end !== 'undefined' &&
        this.options.start <= this.options.end &&
        new Date(this.options.start).valueOf() >= this.options.min &&
        new Date(this.options.end).valueOf() <= this.options.max) {
        this.options.start = new Date(this.options.start).valueOf();
        this.options.end = new Date(this.options.end).valueOf();
      } else {
        this.options.start = new Date(this.options.min).valueOf();
        this.options.end = new Date(this.options.max).valueOf();
      }
    } else {
      this.options.max = parseFloat(this.options.max);
      this.options.min = parseFloat(this.options.min);

      // Check if max and min are proper
      if (this.options.max < this.options.min) {
        this.options.min = this.options.max;
      }

      // Check if start and end are within bounds
      if (typeof this.options.start !== 'undefined' &&
        typeof this.options.end !== 'undefined' &&
        this.options.start <= this.options.end &&
        this.options.start >= this.options.min &&
        this.options.end <= this.options.max) {
        this.options.start = parseFloat(this.options.start);
        this.options.end = parseFloat(this.options.end);
      } else {
        this.options.start = this.options.min;
        this.options.end = this.options.max;
      }
    }
  }

  /* Provide information about the slider value
   * Returns an Object with property left and right denoting left and right values */
  getInfo() {
    let info = {};
    const total = this.options.max - this.options.min;
    const left = this.UI.fill.style.left ? parseFloat(this.UI.fill.style.left.replace('%', '')) : 0;
    const right = this.UI.fill.style.right ? parseFloat(this.UI.fill.style.right.replace('%', '')) : 0;

    if (this.options.isDate) {
      info = {
        left: new Date(this.options.min + (left / 100) * total),
        right: new Date(this.options.max - (right / 100) * total),
      };
    } else {
      info = {
        left: this.options.min + (left / 100) * total,
        right: this.options.max - (right / 100) * total,
      };
    }

    if (typeof this.options.callbackFunction === 'function') {
      info.left = this._applyCallback_(info.left, this.options.callbackFunction);
      info.right = this._applyCallback_(info.right, this.options.callbackFunction);
    }

    return info;
  }

  /*
   * Apply call back using data provided
   **/
  _applyCallback_(data = null, callback = null) {
    try {
      if (!callback) return null;

      return callback.call(undefined, data);
    } catch (error) {

      throw error;

    }
  }

  /* When handle is pressed
   * Attach all the necessary event handlers */
  starting(event = null) {
    if (!event) return;

    // Exit if disabled
    if (this.isDisabled) return;

    let x = 0;
    let y = 0;

    // Initialize drag object
    this.dragObj = {};

    // Get handle element node not the child nodes
    // If this is a child of the parent try to find the handle element
    this.dragObj.elNode = event.target;

    while (!this.dragObj.elNode.classList.contains('handle')) {
      this.dragObj.elNode = this.dragObj.elNode.parentNode;
    }

    // Direction where the slider control is going
    this.dragObj.dir = this.dragObj.elNode.classList.contains('handle-left') ? 'left' : 'right';

    // Get cursor position wrt the page
    // If touch screen (event.touches) and if IE11 (pageXOffset)
    x = (typeof event.clientX !== 'undefined' ? event.clientX :
      event.touches[0].pageX) + (window.scrollX || window.pageXOffset);
    y = (typeof event.clientY !== 'undefined' ? event.clientY :
      event.touches[0].pageY) + (window.scrollY || window.pageYOffset);

    // Save starting positions of cursor and element
    this.dragObj.cursorStartX = x;
    this.dragObj.cursorStartY = y;
    this.dragObj.elStartLeft = parseFloat(this.dragObj.elNode.style.left);
    this.dragObj.elStartRight = parseFloat(this.dragObj.elNode.style.right);
    if (isNaN(this.dragObj.elStartLeft)) this.dragObj.elStartLeft = 0;
    if (isNaN(this.dragObj.elStartRight)) this.dragObj.elStartRight = 0;

    // Update element's positioning for z-index
    // The element last moved will have a higher positioning
    this.UI.handleLeft.classList.remove('ontop');
    this.UI.handleRight.classList.remove('ontop');
    this.dragObj.elNode.classList.add('ontop');

    // Capture mousemove and mouseup events on the page
    this.movingHandler = this.moving.bind(this);
    this.stopHandler = this.stop.bind(this);
    document.addEventListener('mousemove', this.movingHandler, true);
    document.addEventListener('mouseup', this.stopHandler, true);
    document.addEventListener('touchmove', this.movingHandler, true);
    document.addEventListener('touchend', this.stopHandler, true);

    // Stop default events
    this.stopDefault.bind(this)(event);
    this.UI.fill.classList.remove('slider-transition');
    this.UI.handleLeft.classList.remove('slider-transition');
    this.UI.handleRight.classList.remove('slider-transition');

    // Pub/sub lifecycle - start
    this.publish('start', this.getInfo());
  }

  /* When handle is being moved */
  moving(event) {
    // Get cursor position with respect to the page
    const x = (typeof event.clientX !== 'undefined' ? event.clientX :
      event.touches[0].pageX) + (window.scrollX || window.pageXOffset);


    // Move drag element by the same amount the cursor has moved
    const sliderWidth = this.UI.slider.offsetWidth;
    let calculatedVal = 0;
    if (this.dragObj.dir === 'left') {
      calculatedVal = this.dragObj.elStartLeft + ((x - this.dragObj.cursorStartX) / sliderWidth * 100);
    } else if (this.dragObj.dir === 'right') {
      calculatedVal = this.dragObj.elStartRight + ((this.dragObj.cursorStartX - x) / sliderWidth * 100);
    }

    // Keep handles within range
    if (calculatedVal < 0) {
      calculatedVal = 0;
    } else if (calculatedVal > 100) {
      calculatedVal = 100;
    }

    // Sanitize to work for both directions
    // Since we are adding to left and right there should not be a negative number
    calculatedVal = Math.abs(calculatedVal);

    // Take into account the handle when calculating space left
    let handleOffset = 0;
    if (!this.options.overlap) {
      handleOffset = (this.UI.handleRight.offsetWidth / this.UI.slider.offsetWidth) * 100;
    }

    // Add movement based on handle direction
    let remaining = 0;
    if (this.dragObj.dir === 'left') {
      remaining = (100 - handleOffset) - this.UI.fill.style.right.replace('%', '');
      if (remaining <= calculatedVal) {
        calculatedVal = remaining;
      }

      this.dragObj.elNode.style.left = calculatedVal + '%';
      this.UI.fill.style.left = calculatedVal + '%';
    } else {
      remaining = (100 - handleOffset) - this.UI.fill.style.left.replace('%', '');
      if (remaining <= calculatedVal) {
        calculatedVal = remaining;
      }

      this.dragObj.elNode.style.right = calculatedVal + '%';
      this.UI.fill.style.right = calculatedVal + '%';
    }

    // Stop default events
    this.stopDefault.bind(this)(event);

    // Pub/sub lifecycle - moving
    this.publish('moving', this.getInfo());
  }

  /* When handle is blured - do clean up */
  stop(event) {
    // Stop capturing mousemove and mouseup events
    document.removeEventListener('mousemove', this.movingHandler, true);
    document.removeEventListener('mouseup', this.stopHandler, true);
    document.removeEventListener('touchmove', this.movingHandler, true);
    document.removeEventListener('touchend', this.stopHandler, true);

    // Stop default events
    this.stopDefault.bind(this)(event);

    // Pub/sub lifecycle - stop
    this.publish('stop', this.getInfo());
  }

  /* Push elements to position based on data */
  move(data, preventPublish) {
    let importedData = data;

    // Transition effects (cleaned up at Slider.prototype.starting);
    this.UI.fill.classList.add('slider-transition');
    this.UI.handleLeft.classList.add('slider-transition');
    this.UI.handleRight.classList.add('slider-transition');

    const total = this.options.max - this.options.min;

    if (typeof importedData === 'object') {
      if (importedData.left) {
        if (importedData.left < this.options.min) importedData.left = this.options.min;
        if (importedData.left > this.options.max) importedData.left = this.options.max;

        const posLeft = (importedData.left - this.options.min) / total * 100;
        this.UI.handleLeft.style.left = posLeft + '%';
        this.UI.fill.style.left = posLeft + '%';
      }

      if (importedData.right) {
        if (importedData.right < this.options.min) importedData.right = this.options.min;
        if (importedData.right > this.options.max) importedData.right = this.options.max;

        const posRight = (this.options.max - importedData.right) / total * 100;
        this.UI.handleRight.style.right = posRight + '%';
        this.UI.fill.style.right = posRight + '%';
      }

      // If overlap is not enabled then check if the starting positions are overlapping - reset to full
      if (!this.options.overlap && this.UI.handleLeft.offsetLeft + this.UI.handleLeft.offsetWidth >
        this.UI.handleRight.offsetLeft - 1) {
        this.UI.fill.style.left = '0%';
        this.UI.fill.style.right = '0%';
        this.UI.handleLeft.style.left = '0%';
        this.UI.handleRight.style.right = '0%';
      }
    } else if (!isNaN(importedData)) {
      if (importedData < this.options.min) importedData = this.options.min;
      if (importedData > this.options.max) importedData = this.options.max;

      const pos = (importedData - this.options.min) / total * 100;
      this.UI.handleLeft.style.left = pos + '%';
      this.UI.fill.style.left = '0%';
      this.UI.fill.style.right = (100 - pos) + '%';
    }

    // Pub/sub lifecycle - moving
    if (!preventPublish) {
      this.publish('moving', this.getInfo());
    }
  }

  /* Utility function to stop default events */
  stopDefault(event = null) {
    if (!event) return;

    event.preventDefault();
  }

  /* Accessor for disable property */
  disable(boolean) {
    this.isDisabled = boolean;
    if (this.isDisabled) {
      this.UI.slider.classList.add('slider-disabled');
    } else {
      this.UI.slider.classList.remove('slider-disabled');
    }
  }

  /* Subscribe hook
   * Topic - keyword (start, moving, end)
   * Listener - function that will be called when topic is fired with argument of getInfo() data
   */
  subscribe(topic = null, listener = null) {

    if (!topic || !listener) return {};

    // Check validity of topic and listener
    if (!this.topics.hasOwnProperty.call(this.topics, topic) ||
      typeof topic !== 'string' ||
       typeof listener !== 'function') return {};

    // Add the listener to queue
    // Retrieve the index for deletion
    const index = this.topics[topic].push(listener) - 1;

    // Return instance of the subscription for deletion
    return {
      remove: (function() {
        delete this.topics[topic][index];
      }).bind(this),
    };
  }

  /* Publish hook
   * Topic - keyword (start, moving, end)
   * Data - getInfo() result to pass into the listener
   */
  publish(topic = null, data = null) {

    if (!topic || !data) return;

    // Check validity of topic
    if (!this.topics.hasOwnProperty.call(this.topics, topic) || typeof topic !== 'string') return;

    // Cycle through events in the queue and fire them with the slider data
    this.topics[topic].forEach(function(event) {
      event(data);
    });

  }

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Slider;
} else {
  window.Slider = Slider;
}
