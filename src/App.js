import { useState } from 'react';
import './App.css';
import './Map.js';
import MapChart from './Map.js';

function App() {
  const [fetchUrl, setFetchUrl] = useState("http://localhost:3648");

  return (
    <div className="App">
      <input type="text" value={fetchUrl} onChange={e => setFetchUrl(e.target.value)} />
      <MapChart fetchUrl={fetchUrl} key={fetchUrl}/>
    </div>
  );
}

export default App;
