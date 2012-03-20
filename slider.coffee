(($) ->
    
    supportsRangeInput = () ->
        testRangeInput = document.createElement('input')
        testRangeInput.setAttribute('type', 'range')
        return testRangeInput.type == 'range'
    
    $node = undefined
    data = {
        sliding: false
    }
    $input = undefined
    $handle = undefined
    $slider = undefined
    
    handlers = {
        # touch
        touchDown: (event) ->
            handlers.inputDeviceDown($(event.target), event.targetTouches[0].clientX)
            $(document).on('touchmove', handlers.touchMove)
            $(document).on('touchend', handlers.touchUp)
        
        touchMove: (event) ->
            data.sliding = true
            handlers.inputDeviceMove(event.targetTouches[0].clientX)
        
        touchUp: (event) ->
            $(document).off('touchmove', handlers.touchMove)
            $(document).off('touchend', handlers.touchUp)
            handlers.inputDeviceUp()
            
            event.preventDefault()
            event.stopPropagation()
            
            if (data.sliding)
                return false
            else
                return true
        
        # mouse
        mouseDown: (event) ->
            handlers.inputDeviceDown($(event.target), event.pageX)
            $(document).on('mousemove', handlers.mouseMove)
            $(document).on('mouseup', handlers.mouseUp)
        
        mouseMove: (event) ->
            handlers.inputDeviceMove(event.pageX)
        
        mouseUp: (event) ->
            $(document).off('mousemove', handlers.mouseMove)
            $(document).off('mouseup', handlers.mouseUp)
            handlers.inputDeviceUp()
        
        # unified handlers
        inputDeviceDown: (node, inputDeviceOffsetX) ->
            # setup DOM elements
            $handle = node.stop()
            $slider = $handle.parent()
            $input = $slider.prev()
            # setup data
            data.sliding = true
            data.sliderOffset = $slider.offset().left
            data.sliderWidth = $slider.width()
            data.handleWidth = $handle.width()
            data.slidingWidth = data.sliderWidth - data.handleWidth
            data.handleMaxLeftPercentage = data.slidingWidth / data.sliderWidth * 100
            data.mouseOffsetInHandle = inputDeviceOffsetX - $handle.offset().left
            data.sliderValueMin = parseInt($input.attr('min') || 0)
            data.sliderValueMax = parseInt($input.attr('max') || 100)
            data.sliderValueStep = parseInt($input.attr('step') || 5)
        
        inputDeviceMove: (inputDeviceOffsetX) ->
            # calculate percentage for handle
            handleLeftPositionPixel = inputDeviceOffsetX - data.mouseOffsetInHandle - data.sliderOffset
            handleLeftPositionPercentage = handleLeftPositionPixel / data.slidingWidth * data.handleMaxLeftPercentage
            handleLeftPositionPercentage = Math.min(Math.max(handleLeftPositionPercentage, 0), data.handleMaxLeftPercentage)
            $handle.css('left', handleLeftPositionPercentage + '%')
        
        inputDeviceUp: () ->
            # calculate input value from handle position
            handleLeftPercentage = $handle.css('left').substring(0, $handle.css('left').length - 1)
            range = data.sliderValueMax - data.sliderValueMin
            percentageOfRange = handleLeftPercentage / data.handleMaxLeftPercentage
            inputValue = range * percentageOfRange + data.sliderValueMin
            
            # find the nearest possible value (considering the specified step)
            if data.sliderValueStep > 0
                inputValue = Math.round(inputValue / data.sliderValueStep) * data.sliderValueStep
            
            # adjust handle position
            adjustedHandleLeftPercentage = (inputValue - data.sliderValueMin) / range * data.handleMaxLeftPercentage
            $handle.stop().animate({'left': adjustedHandleLeftPercentage + '%'}, 20)
            
            # update input value
            $input.val(inputValue)
            $input.trigger('change')
            
            # reset data
            data = {
                sliding: false
            }
            $slider = undefined
            $handle = undefined
            
    }
    
    actions = {
        init: (options) ->
            if (supportsRangeInput())
                this.hide()
                $slider = $('<div class="slider"><div class="handle"></div></div>')
                this.after($slider)
                $slider.find('div.handle').on('mousedown', handlers.mouseDown).on('touchstart', handlers.fingerDown)
        
        value: (value) ->
            if typeof value == 'undefined'
                return this.val()
            else
                # move slider
        
    }
    
    
    
    
    $.fn.slider = (action) ->
        if (actions[action])
            $node = this
            return actions[action].apply(this, Array.prototype.slice.call(arguments, 1))
        else
            $.error('Method ' +  action + ' does not exist on jQuery.slider')

)(jQuery)


$(document).ready(() ->
    $('#x').slider('init', {})
)
        