import React, {useState} from 'react';
// import logo from './logo.svg';
// import './App.css';
import ReactTutorial from '../src/index';

//create your forceUpdate hook
function useForceUpdate(){
  const [value, setValue] = useState(true); //boolean state
  return () => setValue(!value); // toggle the state to force render
}
let tourPlaying = false;
function App() {
  const forceUpdate = useForceUpdate();
  const [typeValue, setTypeValue] = useState('');
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <div>
        <button id={'btn6'} onClick={() => {
          tourPlaying = true;
          forceUpdate(); 
        }}>start tour</button>
      </div>
      <div>
        <button id={'btn1'}>button 1</button>
      </div>
      <div>
        <span id={'btn2'}>button 2</span>
      </div>
      <div>
        <input type="text" name="name" id='name1' value={typeValue} onChange={(e) => setTypeValue(e.target.value)} />
      </div>
      
        <ReactTutorial 
          steps={[
            {
                content: 'Click on btn',
                actionType: 1,
                position: 'top',
                selector: "#btn1"
            },
            {
                content: 'double click this item',
                actionType: 2,
                position: 'top',
                selector: "#btn2"
            },
            {
                content: 'Type "Hello world"',
                actionType: 3,
                position: 'top',
                userTypeText:'Hello world',
                selector: "#name1"
            }
          ]}
          playTour={tourPlaying}
          showNumber={true}
          onRequestClose={() => {
            tourPlaying=false;
            forceUpdate();
          }}
        />
    </div>
  );
}

export default App;
