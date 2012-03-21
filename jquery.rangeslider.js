(function($) {
    "use strict";

    var methods, actions, interactionData, slider, handlers, isTouchDevice, supportsRangeInput;

    supportsRangeInput = (function() {
        var testRangeInput;
        testRangeInput = document.createElement('input');
        testRangeInput.setAttribute('type', 'range');
        testRangeInput.style.cssText = 'position:absolute;visibility:hidden;';
        document.documentElement.appendChild(testRangeInput);
        return testRangeInput.type === 'range' && testRangeInput.offsetHeight > 0;
    })();

    isTouchDevice = (function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (error) {
            return false;
        }
    })();

    slider = {};
    interactionData = {
        dragged: false
    };

    handlers = {
        /**
         * Event handler for "touchstart"
         * Apply touch events
         *
         * @param event
         */
        touchDown: function(event) {
            handlers.inputDeviceDown($(event.target), event.targetTouches[0].clientX);
            document.addEventListener('touchmove', handlers.touchMove, false);
            document.addEventListener('touchend', handlers.touchUp, false);
        },
        /**
         * Event handler for "touchmove"
         * Passes touch position to inputDeviceMove
         *
         * @param event
         */
        touchMove: function(event) {
            handlers.inputDeviceMove(event.targetTouches[0].clientX);
        },
        /**
         * Event handler for "touchend"
         * Remove touch events and prevent scroll if handle was dragged
         *
         * @param event
         */
        touchUp: function(event) {
            document.removeEventListener('touchmove', handlers.touchMove);
            document.removeEventListener('touchend', handlers.touchUp);
            handlers.inputDeviceUp();
            event.preventDefault();
            event.stopPropagation();
            return !interactionData.dragged;
        },
        /**
         * Event handler for "mousedown"
         * Apply mouse events
         *
         * @param event
         */
        mouseDown: function(event) {
            handlers.inputDeviceDown($(event.target), event.pageX);
            $(document).on('mousemove', handlers.mouseMove);
            $(document).on('mouseup', handlers.mouseUp);
            return false;
        },
        /**
         * Event handler for "mousemove"
         * Passes mouse position to inputDeviceMove
         *
         * @param event
         */
        mouseMove: function(event) {
            handlers.inputDeviceMove(event.pageX);
            return false;
        },
        /**
         * Event handler for "mouseup"
         * Remove mouse events
         *
         * @param event
         */
        mouseUp: function(event) {
            $(document).off('mousemove', handlers.mouseMove);
            $(document).off('mouseup', handlers.mouseUp);
            handlers.inputDeviceUp();
            return false;
        },
        /**
         * Unified handler for input device down
         * Loads the slider configuration and sets initial data for the interaction
         *
         * @param $handle
         * @param inputDeviceOffsetX
         */
        inputDeviceDown: function($handle, inputDeviceOffsetX) {
            slider = methods.getSlider($handle.parent().prev());
            interactionData.dragged = true;
            interactionData.offsetInHandle = inputDeviceOffsetX - slider.$handle.offset().left;

        },
        /**
         * Unified handler for input device move
         * Moves the handle along the slider
         *
         * @param inputDeviceOffsetX
         */
        inputDeviceMove: function(inputDeviceOffsetX) {
            var handleLeftPositionPercentage, handleLeftPositionPixel;
            handleLeftPositionPixel = inputDeviceOffsetX - interactionData.offsetInHandle - slider.offset;
            handleLeftPositionPercentage = handleLeftPositionPixel / slider.slidingWidth * slider.handleMaxLeftPercentage;
            handleLeftPositionPercentage = Math.min(Math.max(handleLeftPositionPercentage, 0), slider.handleMaxLeftPercentage);
            //console.log(handleLeftPositionPercentage);
            slider.$handle.css('left', handleLeftPositionPercentage + '%');
        },
        /**
         * Unified handler for input device up
         * Adjusts the handle position according to the slider configuration
         */
        inputDeviceUp: function() {
            var handleOffset, value;

            handleOffset = slider.$handle.position().left / slider.slidingWidth;
            value = (slider.maxValue - slider.minValue) * handleOffset + slider.minValue;

            methods.moveSliderToValue(slider, value, true, true);

            interactionData = {
                dragged: false
            };
        }
    };

    methods = {
        /**
         * Initialize the slider with the value of the input field
         *
         * @param $input
         * @param value
         */
        initSliderValue: function ($input, value) {
            methods.moveSliderToValue(methods.getSlider($input), value, false, false);
        },
        /**
         * Move the slider to the specified value
         *
         * @param slider
         * @param value
         * @param updateInput If true, the input field is updated
         * @param animate If true, the move is animated
         */
        moveSliderToValue: function (slider, value, updateInput, animate) {
            var handleLeftPercentage,
                range = slider.maxValue - slider.minValue;

            if (slider.stepValue > 0) {
                value = Math.round(value / slider.stepValue) * slider.stepValue;
            }

            handleLeftPercentage = (value - slider.minValue) / range * slider.handleMaxLeftPercentage;

            if (animate) {
                slider.$handle.stop().animate({
                    'left': handleLeftPercentage + '%'
                }, 20);
            } else {
                slider.$handle.stop().css('left', handleLeftPercentage + '%');
            }

            if (updateInput) {
                slider.$input.val(value);
                slider.$input.trigger('change');
            }

        },
        /**
         * Returns data about the slider
         *
         * @param $input
         */
        getSlider: function ($input) {
            var $slider, $handle, sliderWidth, handleWidth, slidingWidth;

            $slider = $input.next();
            $handle = $slider.find('div.handle');
            sliderWidth = $slider.width();
            handleWidth = $handle.width();
            slidingWidth = sliderWidth - handleWidth;

            return {
                '$slider': $slider,
                '$handle': $handle,
                '$input': $input,
                'minValue': parseInt($input.attr('min') || 0, 10),
                'maxValue': parseInt($input.attr('max') || 100, 10),
                'stepValue': parseInt($input.attr('step') || 5, 10),
                'offset': $slider.offset().left,
                'width': sliderWidth,
                'handleWidth': handleWidth,
                'slidingWidth': slidingWidth,
                'handleMaxLeftPercentage': slidingWidth / sliderWidth * 100
            };
        }
    };

    actions = {
        /**
         * Initializes the slider
         * If the browser does not support the range type, a fallback is inserted
         * Attaches mouse or touch handlers, depending on the device
         */
        init: function() {
            var $slider;

            if (!supportsRangeInput) {
                this.hide();
                $slider = $('<div class="slider"><div class="handle"></div></div>');
                this.after($slider);
                methods.initSliderValue(this, this.val());
                if (!isTouchDevice) {
                    return $slider.find('div.handle').on('mousedown', handlers.mouseDown);
                } else {
                    return $slider.find('div.handle').get(0).addEventListener("touchstart", handlers.touchDown, false);
                }
            }
        },
        /**
         * Returns the current value
         */
        get: function () {
            return this.val();
        },
        /**
         * Set the value of the slider to value
         * Updates the input field, but does not play an animation
         *
         * @param value
         * @param animate
         */
        set: function(value, animate) {
            if (!supportsRangeInput) {
                animate = !(typeof animate === 'undefined' || animate === false);
                methods.moveSliderToValue(methods.getSlider($(this)), value, true, animate);
            } else {
                $(this).val(value).trigger('change');
            }
        }
    };

    /**
     * Call actions
     *
     * @param action
     */
    $.fn.slider = function(action) {
        if (actions[action]) {
            return actions[action].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return $.error('Method ' + action + ' does not exist on jQuery.slider');
        }
    };
})(jQuery);