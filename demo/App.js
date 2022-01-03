import React, {useState, useCallback, useEffect} from 'react';
import ReactTutorial from '../src/';
import MaterialButtonPrimary from './src/components/MaterialButtonPrimary';
import PathCreator from './src/components/PathCreator';
import withSteps from './src/components/withStepsComponent';


function App() {
  const [showNameTextBox, setShowNameTextBox] = useState(false);

  const tuteSteps = [
    {
      content: 'Type "Hello world" and hit Enter',
      actionType: 'enter',
      userTypeText:'Hello world',
      position: 'bottom',
      selector: "#name2"
    },
    {
        content: 'Click on btn, Lorem Ipsum is simply dummy text of the printing and typesetting Lorem Ipsum is simply dummy text of the printing and typesetting',
        actionType: 'click',
        position: 'bottom',
        selector: "#btn1",
        beforeNext: () => {setShowNameTextBox(true)}
    },
    {
        content: 'double click this item',
        actionType: 'dblclick',
        position: 'right',
        arrowPosition: 'left',
        selector: "#btn2",
        beforePrev: () => {setShowNameTextBox(false)}
    },
    {
        content: 'Type "Hello world"',
        actionType: 'typing',
        position: 'right',
        arrowPosition: 'left',
        userTypeText:'Hello world',
        selector: "#name1"
    }
  ];

  const stepCollector = {};
  const PathWithSteps = withSteps(PathCreator, stepCollector);

  const [tourPlaying, setTourPlaying] = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const [color, setColor] = useState('red');
  const [stps, setSteps] = useState(tuteSteps);

  useEffect(() => {
    setSteps([...stps, ...stepCollector.getSteps()])
  },[])

  return (
    <div style={{height: '200vh'}} className="App">
      <p>Welcome to react Tour</p>
      <MaterialButtonPrimary
        name={'Try it'}
        onClick={() => {setTourPlaying(true)}}
      />
      <MaterialButtonPrimary
        name={'GitHub'}
      />
      <button id={'btn1'} onClick={() => setShowNameTextBox(true)}>Click me!!</button>
      <div id={'btn2'} onDoubleClick={ () => {color === 'red' ? setColor('blue') : setColor('red');}} style={{background: color, height: '100px', width: '100px'}}>Double click to toggle color</div>
      {showNameTextBox ? <input type={'text'} id={'name1'} onChange={(e) => {setTypeValue(e.target.value)}} value={typeValue} placeholder={'Enter Text'} /> : null}
      <input type={'text'} id={'name2'} placeholder={'Type Text and hit enter'} />
      <PathWithSteps />
      {tourPlaying ?
        <ReactTutorial
          steps={stps}
          playTour={tourPlaying}
          showNumber={true}
          onRequestClose={() => {
            setTourPlaying(false);
          }}
        /> : null }
    </div>
  );
}

export default App;
