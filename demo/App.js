import React, {useState, useCallback, useEffect} from 'react';
import ReactTutorial from '../src/';
import MaterialButtonPrimary from './src/components/MaterialButtonPrimary';
import PathCreator from './src/components/PathCreator';
import withSteps from './src/components/withStepsComponent';

const tuteSteps = [
  {
    content: 'Type Somthing and hit Enter',
    actionType: 'enter',
    position: 'bottom',
    selector: "#name2"
  },
  {
      content: 'Click on btn',
      actionType: 'click',
      position: 'bottom',
      selector: "#btn1"
  },
  {
      content: 'double click this item',
      actionType: 'dblclick',
      position: 'top',
      selector: "#btn2"
  },
  {
      content: 'Type "Hello world"',
      actionType: 'typing',
      position: 'top',
      userTypeText:'Hello world',
      selector: "#name1"
  }
];
const stepCollector = {};
const PathWithSteps = withSteps(PathCreator, stepCollector);

function App() {
  const [tourPlaying, setTourPlaying] = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const [showNameTextBox, setShowNameTextBox] = useState(false);
  const [color, setColor] = useState('red');
  const [stps, setSteps] = useState(tuteSteps);

  useEffect(() => {
    setSteps([...stps, ...stepCollector.getSteps()])
  },[])

  return (
    <div className="App">
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
