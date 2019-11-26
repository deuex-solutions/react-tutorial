import React, { useState, useReducer, useEffect, useRef, useCallback} from 'react';
import {getNodeRect, getWindow, inView, isBody} from './Utils';
import Scrollparent from 'scrollparent';
import scrollSmooth from 'scroll-smooth';
import _ from 'lodash';
import {
  SvgMask,
  Guide,
  // Badge,
  Controls,
  Arrow,
  Navigation,
  Dot
} from './components/index';

const defaultConfig = {
  showButtons: false,
  showNavigation: false,
  stepWait: 500,
  scrollDuration: 500
};

const ReactTutorial = ({
  steps, 
  options, 
  playTour,
  onRequestClose,
  showButtons,
  showNavigation,
  // scrollDuration,
  prevButton,
  showNavigationNumber,
  disableDotsNavigation,
  lastStepNextButton,
  nextButton
}) => {
  const [config] = useState(options || defaultConfig);
  const [totalSteps] = useState(steps.length);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourPlayInternal, setTourPlayInternal] = useState(true);
  const balloonRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const startTour = useCallback( async () => {
    if( currentStep >= 0 && currentStep < totalSteps){
      const step = steps[currentStep];
      stepStart(step);
      performStep(step);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    if(playTour) {
      setTourPlayInternal(tourPlayInternal && playTour);
      startTour();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playTour, startTour]);

  async function stepUp () {
    if(currentStep + 1 < totalSteps) {
      await stepWait(500);
      setCurrentStep(currentStep + 1);
      // startTour();
    } else {
      close();
    }
  }

  async function goTo(i){
    await stepWait(500);
    setCurrentStep(i);
  }

  function stepWait (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  } 

  function handleResize(e) {
    if(!playTour) {return;}
    const step = steps[currentStep];
    const node = step.selector ? document.querySelector(step.selector) : null;
    node && makeCalculations(getNodeRect(node), step.position);
  };

  function stepDown() {
      setCurrentStep(currentStep - 1);
  }

  function stepStart (step) {
    config.beforeStep && config.beforeStep(step);
  }

  function stepEnd (step) {
    config.afterStep && config.afterStep(step);
    stepUp();
    // startTour();
  }

  function close() {
    onRequestClose();
  }

  const performStep = async (step) => {
    // const step = steps[currentStep];
    // if(step.isRendered) {return;}
    console.log(step);
    const node = step.selector ? document.querySelector(step.selector) : null;
    if( (_.isNull(node) || _.isUndefined(node) ) && step.actionType !== actionType.WAIT){
      setTourPlayInternal(false);
      console.error(`Element could not found with selector: ${step.selector} \n Please update selector and try again`);
    }
    bringNodeToView(node, step);    
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
      default:
      case actionType.CUSTOM:

        break;
      case actionType.WAIT:
        step.isRendered = true;
        await stepWait(step.miliseconds);
        stepEnd();
        break;
    }
    step.isRendered = true;
  }

  function bringNodeToView(node, step) {
    const {w, h} = getWindow();
    if(node) {
      const nodeRect = getNodeRect(node);
      if(!inView({...nodeRect, w, h})) {
        const parentScroll = Scrollparent(node);
        const offset = nodeRect.height > h
          ? -25
          : -(h / 2) + nodeRect.height / 2;
        scrollSmooth.to(node, {
          context: isBody(parentScroll) ? window : parentScroll,
          duration: config.scrollDuration,
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
        throw console.error('Node not found with selector: ', step.selector);
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
  function typeActionPerformed (e) {
    const stepData = steps[currentStep];
    if(stepData.text === e.target.value) {
      e.target.removeEventListener('input', typeActionPerformed);
      stepEnd();
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
      // console.log(e);
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

  return ( playTour ? <div className={'rootabsaas'}>
    <Guide
      ref={balloonRef}
      windowWidth={state.w}
      windowHeight={state.h}
      targetWidth={state.width}
      targetHeight={state.height}
      targetTop={state.top}
      targetLeft={state.left}
      targetRight={state.right}
      targetBottom={state.bottom}
      helperWidth={state.helperWidth}
      helperHeight={state.helperHeight}
      helperPosition={state.helperPosition}
      tabIndex={-1}
      defaultStyles={true}
      padding={10}
    >
    {steps[currentStep].instructionText}
        {stepContent}

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
                    key={`${s.selector ? s.selector : 'undef'}_${i}`}
                    onClick={() => goTo(i)}
                    current={currentStep}
                    index={i}
                    disabled={currentStep === i || disableDotsNavigation}
                    showNumber={showNavigationNumber}
                    data-tour-elem="dot"
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
    </Guide>
    
    {/* <Overlay ref={balloonRef} target={() => document.querySelector(steps[currentStep].selector)} placement={steps[currentStep] ? steps[currentStep].position : 'top'} show={steps[currentStep] ? true : false}>
      <Popover
        id="popover-basic"
        placement={steps[currentStep] ? steps[currentStep].position : 'top'}
        bsClass="tour-hive popover"
      >
        
      </Popover>
    </Overlay> */}
    <SvgMask 
      windowWidth={state.w}
      windowHeight={state.h}
      targetWidth={state.width}
      targetHeight={state.height}
      targetTop={state.top}
      targetLeft={state.left}
      padding={5}
      rounded={5}
      disableInteraction={false}
      disableInteractionClassName={'classname'} 
      className={'classname'}
    />
  </div> : null);
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
  CLICK: 1,
  DBL_CLICK: 2,
  TYPING: 3,
  DRAG_N_DROP: 4,
  DRAG_WITH_MOUSE_MOVE:5,
  CUSTOM: 6,
  WAIT: 10
};

export default ReactTutorial;