import React, { useState, useReducer, useEffect, useRef, useCallback} from 'react';
import Scrollparent from 'scrollparent';
import scrollSmooth from 'scroll-smooth';
import cn from 'classnames'
import _ from 'lodash';
import {getNodeRect, getWindow, inView, isBody, stepWait} from './Utils';
import {
  SvgMask,
  Guide,
  Badge,
  Controls,
  Arrow,
  Navigation,
  Dot,
  Close
} from './components/index';
import {propTypes, defaultProps} from './propTypes';
import useScrollBlock from "./components/useScrollBlock"
import CN from './classNames'
import * as hx from './Utils';


const ReactTour = props => {
  const {
    steps,
    playTour,
    onRequestClose,
    showButtons,
    showNavigation,
    prevButton,
    showNavigationNumber,
    children,
    className,
    showNumber,
    scrollDuration,
    maskSpace,
    disableKeyboardNavigation,
    disableInteraction,
    highlightedMaskClassName,
    rounded,
    maskClassName,
    accentColor,
    scrollOffset,
    onAfterOpen,
    onBeforeClose,
    inViewThreshold,
    disableDotsNavigation,
    lastStepNextButton,
    nextButton,
    startAt,
    maskColor,
    stepWaitTimer,
    allowScreenScroll = false,
    onRequestSkip,
    showCloseButton
  } = props;
  const [totalSteps] = useState(steps.length);
  const [currentStep, setCurrentStep] = useState(typeof startAt === 'number' ? startAt : 0);
  const balloonRef = useRef(null);
  const helper = useRef(null);
  const [tourPlaying, setTourPlaying] = useState(playTour);
  const [blockScroll, allowScroll] = useScrollBlock();
  const [state, dispatch] = useReducer(reducer, initialState);

  const startTour = useCallback(() => {
    if( currentStep >= 0 && currentStep < totalSteps){
      const step = steps[currentStep];
      stepStart(step);
      performStep(step);
    } else {
      close();
    }
  }, [currentStep]);

  useEffect(() => {
    if (allowScreenScroll) {
      allowScroll();
    } else {
      blockScroll();
    }
    if(playTour) {
      startTour();
    }
    if(playTour !== tourPlaying && playTour) {
      if (balloonRef.current) {
        balloonRef.current.focus()
        if (onAfterOpen && typeof onAfterOpen === 'function') {
          onAfterOpen(helper.current);
        }
      }
      setTourPlaying(playTour);
    }
    window.addEventListener('keydown', keyHandler, false)
    window.addEventListener('resize', handleResize);
    return () => {
      setTourPlaying(false);
      window.removeEventListener('keydown', keyHandler, false)
      window.removeEventListener('resize', handleResize);
    };
  }, [playTour, startTour]);

  async function stepUp () {
    if(currentStep + 1 < totalSteps) {
      const step = steps[currentStep];
      if(step.userTypeText){
        const node = step.selector ? document.querySelector(step.selector) : null;
        if(node.value !== step.userTypeText){
         return;
       }
      }
      step.beforeNext && step.beforeNext()
      await stepWait(stepWaitTimer);
      setCurrentStep(currentStep + 1);
    } else {
      close();
    }
  }

  const goTo = useCallback( async (i) => {
    await stepWait(stepWaitTimer);
    setCurrentStep(i);
  }, [setCurrentStep]);

  function handleResize(e) {
    if(!playTour) {return;}
    const step = steps[currentStep];
    const node = step.selector ? document.querySelector(step.selector) : null;
    node && makeCalculations(getNodeRect(node), step.position);
  };

  async function stepDown() {
    const step = steps[currentStep];
    step.beforePrev && step.beforePrev()
    await stepWait(stepWaitTimer);
    setCurrentStep(currentStep === 0 ? currentStep : currentStep  - 1 );
  }

  function stepStart (step) {
    step.beforeStep && step.beforeStep(step);
  }

  function stepEnd () {
    const step = steps[currentStep];
    step.afterStep && step.afterStep(step);
    stepUp();
  }

  function close() {
    if (onBeforeClose && typeof onBeforeClose === 'function') {
      onBeforeClose(balloonRef.current)
    }
    onRequestClose();
  }

  const handleSkipClick = () => {
    close();
    onRequestSkip && onRequestSkip();
  };

  const performStep = (step) => {
    const node = step.selector ? document.querySelector(step.selector) : null;
    if( (_.isNull(node) || _.isUndefined(node) ) && step.actionType !== actionType.WAIT){
      close();
      console.error(`Element could not found with selector: ${step.selector} \n Please update selector and try again`);
    }
    bringNodeToView(node, step);
    attchListeners(node, step);
  }

  async function attchListeners(node, step){
    switch(step.actionType) {
      case actionType.CLICK:
        node.addEventListener('click', clickActionPerformed);
        break;
      case actionType.DBL_CLICK:
        node.addEventListener('dblclick', dblClickActionPerformed);
        break;
      case actionType.TYPING:
        node.addEventListener('input', typeActionPerformed);
        break;
      case actionType.ENTER:
        node.addEventListener('keydown', enterActionPerformed);
        break;
      case actionType.DRAG_N_DROP:
        node.addEventListener('mousedown', dragMouseDown);
        let dropNode = step.dropSelector ? document.querySelector(step.dropSelector) : null;
        window.addEventListener('drag', dragMouseMove, true);
        window.addEventListener('dragend', dragEnd);
        dropNode && dropNode.addEventListener('drop', dragMouseUp);
        break;
      case actionType.DRAG_WITH_MOUSE_MOVE:
        dropNode = step.dropSelector ? document.querySelector(step.dropSelector) : null;
        node.addEventListener('mousedown', dragMouseDown);
        window.addEventListener('mousemove', dragMouseMove);
        dropNode && dropNode.addEventListener('mouseup', dragMouseUp);
        break;
      case actionType.WAIT:
        step.isRendered = true;
        await stepWait(step.waitTimer);
        stepEnd();
        break;
      case actionType.CUSTOM:
      default:
        break;
    }
    step.isRendered = true;
  }

  function bringNodeToView(node, step) {
    const {w, h} = getWindow();
    if(node) {
      const nodeRect = getNodeRect(node);
      if(!inView({...nodeRect, w, h, threshold: inViewThreshold})) {
        const parentScroll = Scrollparent(node);
        const offset = scrollOffset
        ? scrollOffset
        : nodeRect.height > h
          ? -25
          : -(h / 2) + nodeRect.height / 2;
        scrollSmooth.to(node, {
          context: isBody(parentScroll) ? window : parentScroll,
          duration: scrollDuration,
          offset,
          callback: _node => {
            makeCalculations(getNodeRect(_node), step.position);
          }
        });
      } else {
        makeCalculations(nodeRect, step.position);
      }
      step.isRendered = true;
    } else {
      dispatch({
        type: 'NO_DOM_NODE',
        helperPosition: step.position,
        w,
        h,
        inDOM: false
      });
      if(step.actionType !== actionType.WAIT){
        console.error('Node not found with selector: ', step.selector);
      }
    }
  }

  function clickActionPerformed (e) {
    e.target.removeEventListener('click', clickActionPerformed);
    stepEnd();
  }
  function dblClickActionPerformed (e) {
    e.target.removeEventListener('click', dblClickActionPerformed);
    stepEnd();
  }
  function enterActionPerformed (e) {
    const stepData = steps[currentStep];
    if(stepData.userTypeText){
      if(stepData.userTypeText === e.target.value) {
        if(e.key === "Enter"){
          e.target.removeEventListener('keydown', enterActionPerformed);
          stepEnd();
        }
        e.target.removeEventListener('input', enterActionPerformed);
      }
    }else {
      if(e.key === "Enter"){
        e.target.removeEventListener('keydown', enterActionPerformed);
        stepEnd();
      }
    }
  }
  function typeActionPerformed (e) {
    const stepData = steps[currentStep];
    if(stepData.userTypeText === e.target.value) {
      e.target.removeEventListener('input', typeActionPerformed);
      setTimeout(() => {
        stepEnd();
      }, 0);
    }
  }
  function dragMouseDown (e) {
    const stepData = steps[currentStep];
    stepData.mouseDownReceived = true;
  }
  function dragMouseMove (e) {
    const step = steps[currentStep];
    if(step.mouseDownReceived && step.dropSelector){
      const node = step.dropSelector ? document.querySelector(step.dropSelector) : null;
      bringNodeToView(node, step);
      step.mouseMoved = true;
    }
  }
  function dragMouseUp (e) {
    const step = steps[currentStep];
    const dropArea = step.dropSelector ? document.querySelector(step.dropSelector) : null;
    const node = step.selector ? document.querySelector(step.selector) : null;
    if(dropArea && step.mouseDownReceived && e.path[0] === dropArea){
      node.removeEventListener('mousedown', dragMouseDown);
      window.removeEventListener('drag', dragMouseMove);
      window.removeEventListener('dragend', dragEnd);
      dropArea.removeEventListener('drop', dragMouseUp);
      node.removeEventListener('mousedown', dragMouseDown);
      window.removeEventListener('mousemove', dragMouseMove);
      dropArea.removeEventListener('mouseup', dragMouseUp);
      stepEnd();
    } else {
      bringNodeToView(node, step);
    }
    step.mouseDownReceived = false;
  }

  function dragEnd(e) {
    const step = steps[currentStep];
    const node = step.selector ? document.querySelector(step.selector) : null;
    bringNodeToView(node, step);
    step.mouseDownReceived = false;
  }

  function makeCalculations (nodeRect, helperPosition) {
    const { w, h } = getWindow();
    const { width: helperWidth, height: helperHeight } = getNodeRect(
      balloonRef.current
    );
    dispatch({
      type: 'HAS_DOM_NODE',
      ...nodeRect,
      helperWidth,
      helperHeight,
      helperPosition,
      w,
      h,
      inDOM: true
    });
  }

  function keyHandler(e) {
    e.stopPropagation()

    if (disableKeyboardNavigation === true) {
      return
    }

    let isEscDisabled, isRightDisabled, isLeftDisabled

    if (disableKeyboardNavigation) {
      isEscDisabled = disableKeyboardNavigation.includes('esc')
      isRightDisabled = disableKeyboardNavigation.includes('right')
      isLeftDisabled = disableKeyboardNavigation.includes('left')
    }

    if (e.keyCode === 27 && !isEscDisabled) {
      // esc
      e.preventDefault()
      close()
    }

    if (e.keyCode === 39 && !isRightDisabled) {
      // right
      e.preventDefault()
      stepUp()
    }

    if (e.keyCode === 37 && !isLeftDisabled) {
      // left
      e.preventDefault()
      stepDown()
    }
  }

  const stepContent =
    steps[currentStep] &&
    (typeof steps[currentStep].content === 'function'
      ? steps[currentStep].content({
          close: close,
          goTo,
          inDOM: state.inDOM,
          step: currentStep + 1
        })
      : steps[currentStep].content);

      const getTransformPosition = (positionData) => {
        const {
          targetTop,
          targetRight,
          targetBottom,
          targetLeft,
          targetWidth,
          targetHeight,
          windowWidth,
          windowHeight,
          helperWidth,
          helperHeight,
          helperPosition,
          padding,
        } = positionData;
        const available = {
          left: targetLeft,
          right: windowWidth - targetRight,
          top: targetTop,
          bottom: windowHeight - targetBottom,
        };

        const bufferSpace = 20 + padding;

        let position = helperPosition;
        let top = 0,
          left = 0,
          arrowPosition = "bottom";

        const targetXcenter = targetWidth / 2;
        const targetYcenter = targetHeight / 2;
        const helperXcenter = helperWidth / 2;
        const helperYcenter = helperHeight / 2;

        const checkPosition = (checkStrickly) => {
          const topPosition = checkStrickly
            ? available.top > helperHeight + bufferSpace &&
              helperXcenter - targetXcenter <= available.left &&
              helperXcenter - targetXcenter <= available.right
            : available.top > helperHeight + bufferSpace;
          const bottomPosition = checkStrickly
            ? available.bottom > helperHeight + bufferSpace &&
              helperXcenter - targetXcenter <= available.left &&
              helperXcenter - targetXcenter <= available.right
            : available.bottom > helperHeight + bufferSpace;
          const rightPosition = checkStrickly
            ? available.right > helperWidth + bufferSpace &&
              helperYcenter - targetYcenter <= available.top &&
              helperYcenter - targetYcenter <= available.bottom
            : available.right > helperWidth + bufferSpace;
          const leftPosition = checkStrickly
            ? available.left > helperWidth + bufferSpace &&
              helperYcenter - targetYcenter <= available.top &&
              helperYcenter - targetYcenter <= available.bottom
            : available.left > helperWidth + bufferSpace;

          const posiblePosition = {
            top: topPosition,
            bottom: bottomPosition,
            right: rightPosition,
            left: leftPosition,
          };
          if (helperPosition && posiblePosition[helperPosition]) {
            position = helperPosition;
          } else {
            if (topPosition) {
              position = "top";
            } else if (bottomPosition) {
              position = "bottom";
            } else if (rightPosition) {
              position = "right";
            } else if (leftPosition) {
              position = "left";
            } else {
              checkPosition(false);
            }
          }
        };

        if (targetWidth && targetHeight) {
          checkPosition(!helperPosition);
        }

        switch (position) {
          case "top":
            top = Math.round(available.top - (helperHeight + bufferSpace));
            left = Math.round(available.left + targetXcenter - helperXcenter);
            arrowPosition = "bottom";

            break;
          case "bottom":
            top = Math.round(available.top + (targetHeight + bufferSpace));
            left = Math.round(available.left + targetXcenter - helperXcenter);
            arrowPosition = "top";

            break;
          case "right":
            top = Math.round(available.top + targetYcenter - helperYcenter);
            left = Math.round(available.left + targetWidth + bufferSpace);
            arrowPosition = "left";

            break;
          case "left":
            top = Math.round(available.top + targetYcenter - helperYcenter);
            left = Math.round(available.left - helperWidth - bufferSpace);
            arrowPosition = "right";

            break;

          default:
            break;
        }

        return {
          top: `${Math.sign(top) !== -1 ? top : 5}px`,
          left: `${Math.sign(left) !== -1 ? left : 5}px`,
          arrowPosition,
        };
      };

  

      

  return playTour ? (
    <div className={"react-tutorial"}>
      <Guide
        ref={balloonRef}
        rounded={rounded}
        accentColor={accentColor}
        defaultStyles={true}
        coords={getTransformPosition(
          {
            windowWidth:state.w,
            windowHeight:state.h,
            targetWidth:state.width,
            targetHeight:state.height,
            targetTop:state.top,
            targetLeft:state.left,
            targetRight:state.right,
            targetBottom:state.bottom,
            helperWidth:state.helperWidth,
            helperHeight:state.helperHeight,
            helperPosition:state.helperPosition,
            padding:maskSpace || 10,
          }
        )}
        className={cn(CN.helper.base, className, {
          [CN.helper.isOpen]: playTour,
        })}
      >
        {children}
        {stepContent}
        {showNumber && (
          <Badge data-tour-elem="badge">
            {/* {typeof badgeContent === 'function'
              ? badgeContent(currentStep + 1, steps.length)
              : currentStep + 1} */}
            {currentStep + 1}
          </Badge>
        )}
        {(showButtons || showNavigation) && (
          <Controls data-tour-elem="controls">
            {showButtons && (
              <Arrow
                onClick={stepDown}
                disabled={currentStep === 0}
                label={prevButton ? prevButton : null}
              />
            )}

            {showNavigation && (
              <Navigation data-tour-elem="navigation">
                {steps.map((s, i) => (
                  <Dot
                    key={`${s.selector ? s.selector : "undef"}_${i}`}
                    onClick={() => goTo(i)}
                    current={currentStep}
                    index={i}
                    disabled={currentStep === i || disableDotsNavigation}
                    showNumber={showNavigationNumber}
                    data-tour-elem="dot"
                    className={cn(CN.dot.base, {
                      [CN.dot.active]: currentStep === i,
                    })}
                  />
                ))}
              </Navigation>
            )}

            {showButtons && (
              <Arrow
                onClick={
                  currentStep === steps.length - 1
                    ? lastStepNextButton
                      ? close
                      : () => {}
                    : stepUp
                }
                disabled={
                  !lastStepNextButton && currentStep === steps.length - 1
                }
                inverted
                label={
                  lastStepNextButton && currentStep === steps.length - 1
                    ? lastStepNextButton
                    : nextButton
                    ? nextButton
                    : null
                }
              />
            )}
          </Controls>
        )}
        {showCloseButton && (
          <Close
            onClick={handleSkipClick}
            className="reactour__close"
          />
        )}
      </Guide>
      <SvgMask
        windowWidth={state.w}
        windowHeight={state.h}
        targetWidth={state.width}
        targetHeight={state.height}
        targetTop={state.top}
        targetLeft={state.left}
        padding={maskSpace}
        rounded={rounded}
        className={maskClassName}
        disableInteraction={
          steps[currentStep].stepInteraction === false || disableInteraction
            ? !steps[currentStep].stepInteraction
            : disableInteraction
        }
        maskColor={maskColor}
        disableInteractionClassName={cn(
          CN.mask.disableInteraction,
          highlightedMaskClassName
        )}
      />
    </div>
  ) : null;
};

const initialState = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
  w: 0,
  h: 0,
  node: null
};

function reducer(state, action) {
  switch (action.type) {
  case 'HAS_DOM_NODE':
    const { type, ...newState } = action;
    return { ...state, ...newState };
  case 'NO_DOM_NODE':
    return {
      ...state,
      top: state.h + 10,
      right: state.w / 2 + 9,
      bottom: state.h / 2 + 9,
      left: action.w / 2 - state.helperWidth ? state.helperWidth / 2 : 0,
      width: 0,
      height: 0,
      w: action.w,
      h: action.h,
      helperPosition: 'center',
      node: null
    };
  default:
    return state;
  }
}

const actionType = {
  CLICK: 'click',
  DBL_CLICK: 'dblclick',
  TYPING: 'typing',
  ENTER: 'enter',
  DRAG_N_DROP: 'dragdrop',
  DRAG_WITH_MOUSE_MOVE: 'dragwithmove',
  CUSTOM: 'custom',
  WAIT: 'wait'
};

ReactTour.propTypes = propTypes;
ReactTour.defaultProps = defaultProps;

export default ReactTour;