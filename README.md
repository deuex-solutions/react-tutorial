# react-tour
Easy way to have a personal **Guide + tutorial** of your react app.


## How to use

> Download or clone this repo by using belowe command

```js
git clone https://github.com/deuex-solutions/react-tutorial.git
```
> include reacttour.min.js file to your project

```js
import ReactTour from 'reacttour.min.js'    // prod
import ReactTour from 'reacttour.js'    // dev
```

<small>[styled-components](https://www.styled-components.com/) it isn't bundled into the package and is required `styled-components@^6.1.8` and `react@^16.3` due to the use of [createRef](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs), so: </small>

```zsh
npm i -S styled-components@^6.1.8
# or
yarn add styled-components@^6.1.8
```

## Usage

Add the `ReactTour` Component in your Application, passing the `steps` with the elements to highlight during the _ReactTour_.

```js
import React from 'react'
import ReactTour from '@deuex-solutions/react-tour'

class App extends Component {
  // ...

  render  (
    <>
      { /* other stuff */}
      <ReactTour
        steps={steps}
        playTour={this.state.playTour}
        onRequestClose={this.closeTour} />
    </>
  )
}

const steps = [
  {
    selector: '.first-step',
    content: 'This is my first Step',
  },
  // ...
]
```

### ReactTour Props

#### accentColor

> Change `--reactour-accent` _(defaults to accentColor on IE)_ css custom prop to apply color in _Helper_, number, dots, etc

Type: `string`

Default: `#007aff`

#### badgeContent

> Customize _Badge_ content using `current` and `total` steps values

Type: `func`

```js
// example
<ReactTour badgeContent={(curr, tot) => `${curr} of ${tot}`} />
```

#### children

> Content to be rendered inside the _Helper_

Type: `node | elem`

#### className

> Custom class name to add to the _Helper_

Type: `string`

#### disableDotsNavigation

> Disable interactivity with _Dots_ navigation in _Helper_

Type: `bool`

#### disableInteraction

> Disable the ability to click or intercat in any way with the _Highlighted_ element

Type: `bool`

#### disableKeyboardNavigation

> Disable all keyboard navigation (next and prev step) when true, disable only selected keys when array

Type: `bool | array(['esc', 'right', 'left'])`

```js
// example
<ReactTour disableKeyboardNavigation={['esc']} />
```

#### highlightedMaskClassName

> Custom class name to add to the element which is the overlay for the target element when `disableInteraction`

Type: `string`

#### inViewThreshold

> Tolerance in pixels to add when calculating if an element is outside viewport to scroll into view

Type: `number`

#### playTour

> You know…

Type: `bool`

Required: `true`

#### lastStepNextButton

> Change Next button in last step into a custom button to close the Tour

Type: `node`

```js
// example
<ReactTour lastStepNextButton={<MyButton>Done! Let's start playing</MyButton>} />
```

#### maskClassName

> Custom class name to add to the _Mask_

Type: `string`

#### maskSpace

> Extra Space between in pixels between Highlighted element and _Mask_

Type: `number`

Default: `10`

#### nextButton

> Renders as next button navigation

Type: `node`

#### onAfterOpen

> Do something after _Tour_ is opened

Type: `func`

```js
// example
<ReactTour onAfterOpen={target => (document.body.style.overflowY = 'hidden')} />
```

#### onBeforeClose

> Do something before _Tour_ is closed

Type: `func`

```js
// example
<ReactTour onBeforeClose={target => (document.body.style.overflowY = 'auto')} />
```

#### onRequestClose

> Function to close the _Tour_

Type: `func`

Required: `true`

#### prevButton

> Renders as prev button navigation

Type: `node`

#### rounded

> Beautify _Helper_ and _Mask_ with `border-radius` (in px)

Type: `number`

Default: `0`

#### scrollDuration

> Smooth scroll duration when positioning the target element (in ms)

Type: `number`

Default: `1`

#### scrollOffset

> Offset when positioning the target element after scroll to it

Type: `number`

Default: a calculation to the center of the viewport

#### showButtons

> Show/Hide _Helper_ Navigation buttons

Type: `bool`

Default: `true`

#### showNavigation

> Show/Hide _Helper_ Navigation Dots

Type: `bool`

Default: `true`

#### showNavigationNumber

> Show/Hide number when hovers on each Navigation Dot

Type: `bool`

Default: `true`

#### showNumber

> Show/Hide _Helper_ Number Badge

Type: `bool`

Default: `true`

#### startAt

> Starting step when _ReactTour_ is open the first time

Type: `number`

Default: `0`

#### stepWaitTimer

> delay of playing next step after current is completed

Type: `number`

Default: `0`

#### maskColor

> Color for fading out unhighlighted part

type: `string`

default: `#000`
#### allowScreenScroll

> allow scrolling screen

type: `bool`

default: `false`

#### steps

> Array of elements to highligt with special info and props

Type: `shape`

Required: `true`

##### Steps shape

```js
steps: PropTypes.arrayOf(
        PropTypes.shape({
            selector: PropTypes.string,
            content: PropTypes.oneOfType([
                PropTypes.node,
                PropTypes.element,
                PropTypes.func,
              ]).isRequired,
            position: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
            arrowPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
            dropSelector: PropTypes.string,
            actionType: PropTypes.oneOf(['click', 'dblclick', 'typing', 'dragndrop','dragwithmove', 'custom', 'wait']),
            userTypeText: PropTypes.string,
            waitTimer: PropTypes.number,
            beforeStep: PropTypes.func,
            afterStep: PropTypes.func,
            beforePrev: PropTypes.func,
            beforeNext: PropTypes.func
        }),
```

##### actionType number

```js
click // StepUp will be done when user click on element with given selector
dblclick  // StepUp will be done when user dbl click on element with given selector
typing  // StepUp will be done when user type exact string as userTypeText on element with given selector
dragdrop  // StepUp will be done when user drag element with given selector and drop it to element with dropSelector
dragwithmove  // StepUp will be done when user perform mouseDown element with given selector, move it to dropSelector element and at last perform mouse up on the dropselector element
custom // Control of stepUp is in authors hand by providing function to content wich will have goto and step as nextstep number
wait // StepUp will be done after waitTimer is over ( waitTimer will be in ms)
```

##### beforeStep

> function will be called before performing step

Type: `func`

##### afterStep

> function will be called before performing step

Type: `func`
##### beforePrev

> function will be called onClick of Prev button and perform task before going to prev step

Type: `func`
##### beforeNext

> function will be called onClick of Next button and perform task before going to Next step

Type: `func`

##### Steps example

```js
const steps = [
  {
    selector: '[data-tour="my-first-step"]',
    content: ({ goTo, inDOM }) => (
      <div>
        Lorem ipsum <button onClick={() => goTo(4)}>Go to Step 5</button>
        <br />
        {inDOM && '🎉 Look at your step!'}
      </div>
    ),
    position: 'top', // Position is optional, if not provided, tour will auto calculate the position.
    style: {
      backgroundColor: '#bada55',
    },
    // Disable interaction for this specific step.
    // Could be enabled passing `true`
    // when `disableInteraction` prop is present in Tour
    stepInteraction: false,
  },
  // ...
]
```