(function() {

  (function($) {
    var $handle, $input, $node, $slider, actions, data, handlers, supportsRangeInput;
    supportsRangeInput = function() {
      var testRangeInput;
      testRangeInput = document.createElement('input');
      testRangeInput.setAttribute('type', 'range');
      return testRangeInput.type === 'range';
    };
    $node = void 0;
    data = {
      sliding: false
    };
    $input = void 0;
    $handle = void 0;
    $slider = void 0;
    handlers = {
      touchDown: function(event) {
        handlers.inputDeviceDown($(event.target), event.targetTouches[0].clientX);
        $(document).on('touchmove', handlers.touchMove);
        return $(document).on('touchend', handlers.touchUp);
      },
      touchMove: function(event) {
        data.sliding = true;
        return handlers.inputDeviceMove(event.targetTouches[0].clientX);
      },
      touchUp: function(event) {
        $(document).off('touchmove', handlers.touchMove);
        $(document).off('touchend', handlers.touchUp);
        handlers.inputDeviceUp();
        event.preventDefault();
        event.stopPropagation();
        if (data.sliding) {
          return false;
        } else {
          return true;
        }
      },
      mouseDown: function(event) {
        handlers.inputDeviceDown($(event.target), event.pageX);
        $(document).on('mousemove', handlers.mouseMove);
        return $(document).on('mouseup', handlers.mouseUp);
      },
      mouseMove: function(event) {
        return handlers.inputDeviceMove(event.pageX);
      },
      mouseUp: function(event) {
        $(document).off('mousemove', handlers.mouseMove);
        $(document).off('mouseup', handlers.mouseUp);
        return handlers.inputDeviceUp();
      },
      inputDeviceDown: function(node, inputDeviceOffsetX) {
        $handle = node.stop();
        $slider = $handle.parent();
        $input = $slider.prev();
        data.sliding = true;
        data.sliderOffset = $slider.offset().left;
        data.sliderWidth = $slider.width();
        data.handleWidth = $handle.width();
        data.slidingWidth = data.sliderWidth - data.handleWidth;
        data.handleMaxLeftPercentage = data.slidingWidth / data.sliderWidth * 100;
        data.mouseOffsetInHandle = inputDeviceOffsetX - $handle.offset().left;
        data.sliderValueMin = parseInt($input.attr('min') || 0);
        data.sliderValueMax = parseInt($input.attr('max') || 100);
        return data.sliderValueStep = parseInt($input.attr('step') || 5);
      },
      inputDeviceMove: function(inputDeviceOffsetX) {
        var handleLeftPositionPercentage, handleLeftPositionPixel;
        handleLeftPositionPixel = inputDeviceOffsetX - data.mouseOffsetInHandle - data.sliderOffset;
        handleLeftPositionPercentage = handleLeftPositionPixel / data.slidingWidth * data.handleMaxLeftPercentage;
        handleLeftPositionPercentage = Math.min(Math.max(handleLeftPositionPercentage, 0), data.handleMaxLeftPercentage);
        return $handle.css('left', handleLeftPositionPercentage + '%');
      },
      inputDeviceUp: function() {
        var adjustedHandleLeftPercentage, handleLeftPercentage, inputValue, percentageOfRange, range;
        handleLeftPercentage = $handle.css('left').substring(0, $handle.css('left').length - 1);
        range = data.sliderValueMax - data.sliderValueMin;
        percentageOfRange = handleLeftPercentage / data.handleMaxLeftPercentage;
        inputValue = range * percentageOfRange + data.sliderValueMin;
        if (data.sliderValueStep > 0) {
          inputValue = Math.round(inputValue / data.sliderValueStep) * data.sliderValueStep;
        }
        adjustedHandleLeftPercentage = (inputValue - data.sliderValueMin) / range * data.handleMaxLeftPercentage;
        $handle.stop().animate({
          'left': adjustedHandleLeftPercentage + '%'
        }, 20);
        $input.val(inputValue);
        $input.trigger('change');
        data = {
          sliding: false
        };
        $slider = void 0;
        return $handle = void 0;
      }
    };
    actions = {
      init: function(options) {
        if (supportsRangeInput()) {
          this.hide();
          $slider = $('<div class="slider"><div class="handle"></div></div>');
          this.after($slider);
          return $slider.find('div.handle').on('mousedown', handlers.mouseDown).on('touchstart', handlers.fingerDown);
        }
      },
      value: function(value) {
        if (typeof value === 'undefined') {
          return this.val();
        } else {

        }
      }
    };
    return $.fn.slider = function(action) {
      if (actions[action]) {
        $node = this;
        return actions[action].apply(this, Array.prototype.slice.call(arguments, 1));
      } else {
        return $.error('Method ' + action + ' does not exist on jQuery.slider');
      }
    };
  })(jQuery);

  $(document).ready(function() {
    return $('#x').slider('init', {});
  });

}).call(this);
