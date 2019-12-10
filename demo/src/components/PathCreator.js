import React, {useRef, useState, useEffect} from 'react';
import styled from 'styled-components';
import withSteps from './withStepsComponent';

const DragMarker = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background-color: pink;
`;

function useForceUpdate() {
    const [value, setValue] = useState(true);
    return () => setValue(!value);
}

let mouseDown = false;
let x1 = 10, x2 = 10,
y1 = 10, y2 = 10,
startX = 0, startY = 0;
function PathCreator(props) {
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        props.steps.push(...[
            {
                content: 'Click and drag this to other red circle',
                actionType: 'dragwithmove',
                position: 'bottom',
                selector: "#circle1",
                dropSelector: "#circle2"
            },
            {
                content: 'Drag this react to other end',
                actionType: 'dragdrop',
                position: 'bottom',
                selector: "#rect1",
                dropSelector: "#rect2"
            }
        ]);
    },[])
    
    const svgElm = useRef(null);
    const handleMouseDownOnStartMarker = (e) => {
        mouseDown = true;
        var pOffset = svgElm.current.getBoundingClientRect();
        startX = event.clientX - pOffset.left,
        startY = event.clientY - pOffset.top;
    }

    const handleMouseMove = (event) => {
        if(mouseDown) {
            var pOffset = svgElm.current.getBoundingClientRect(),
            px = event.clientX - pOffset.left - 1,
            py = event.clientY - pOffset.top - 1;
            x1 = startX;
            x2 = px;
            y1 = startY;
            y2 = py;
            forceUpdate();
        }
    }

    const handleMouseUp = (e) => {
        if(e.target === svgElm.current) {
            x1 = x2 = y1 = y2 = 10;
            startX = startY = 0;
        }
        mouseDown = false;
        forceUpdate();
    }

    const dragStart = (e) => {
        e.dataTransfer.setData("text", e.target.id);
        console.log('drag start');
    }

    const drop = (e) => {
        const elm = document.getElementById(e.dataTransfer.getData("text"))
        const rect = e.target.getBoundingClientRect();
        elm.style.left = rect.left + 'px';
        elm.style.top = rect.top + 'px';
        e.preventDefault();
    }

    const drag = (e) => {
        console.log('dragging');
    }

    return (<>
        <div id={'rect1'} style={{cursor: 'pointer',
    height: '20px',
    width: '20px',
    position: 'absolute',
    marginTop: '10px',
    backgroundColor: 'red'}} draggable='true' onDrag={drag} onDragStart={dragStart}></div>
    <div id={'rect2'} style={{cursor: 'pointer',
    height: '100px',
    width: '100px',
    float: 'right',
    backgroundColor: 'pink'}} onDragOver={(e) => e.preventDefault()} onDrop={drop}></div>
        <svg ref={svgElm} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} width="500px" height="200px" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle id={'circle1'} onMouseDown={handleMouseDownOnStartMarker} cx="20" cy="50" r="10" fill="red"/>
            <circle id={'circle2'} onMouseUp={handleMouseUp} draggable='true' onDrag={drag} onDragStart={dragStart} cx="450" cy="50" r="10" fill="red"/>
            {/* <rect  />
            <rect id={'rect2'} onDrop={drop} height={20} width={20} x={420} y={0} fill="#fff" /> */}
            <line id="line" x1={x1} y1={y1} x2={x2} y2={y2} stroke="red" />
        </svg>
    </>)
}
export default PathCreator;