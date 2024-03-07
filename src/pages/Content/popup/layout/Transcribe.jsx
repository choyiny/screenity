import React, { useEffect, useContext, useState, useRef } from 'react';
import { contentStateContext } from '../../context/ContentState';
const chrome = window.chrome;

const Transcribe = (props) => {

  const openTranscribe = async () => {
    try {
        chrome.runtime.sendMessage({type: "open-transcribe",});
    
    } catch (error) {
     
    }
  };
 
  return (
    <div>
     
      <button style={{ color: 'white' }} className="main-button recording-button" onClick={() => openTranscribe()}>
        Open Transcribe Tab
      </button>
    </div>
  );
};

export default Transcribe;
