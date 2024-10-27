import { useCallback, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const debounce = (fn, delay) => {
    let timeout;

    return (...args)=>{
      clearTimeout(timeout);
      timeout = setTimeout((
        ()=>fn(...args)
      ), delay);
    }
  };

  const handleSelectionEnd = useCallback(
    debounce(
      ()=>{
        const selection = window.getSelection();
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);

    if(selectedText && selectedText.length>0){
      const rect = range.getBoundingClientRect();
      const x = rect.x ;
      const y = rect.y ;

      setPopupPosition({ x, y });
      setShowPopup(true);
      setSelectedText(selectedText);
    }
      }
      ,500),
    
    
  []);

  console.log("Render",showPopup);

  const handleSelectionStart = () => {
    setShowPopup(false);
  };

  return (
    <div className="app">
      <div
      onMouseMove={handleSelectionEnd}
      onMouseDown={handleSelectionStart}
      contentEditable
      suppressContentEditableWarning
      >
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor voluptatem
      ad ipsum iste. Asperiores libero sed officiis, maxime ullam deleniti
      nesciunt dolor nam quae ipsam autem tempora, doloremque, aspernatur aut?
      </div>


{
  showPopup && (
    <div className="popup"
    style={{
      position: "absolute",
      top: `${popupPosition.y}px`,
      left: `${popupPosition.x}px`,
      transform: "translate(0%, -110%)",
      zIndex: 1000,
    }}
    >
    <div className="popup-content">
      <h3>Popup</h3>
      <h5>
        {selectedText}
      </h5>
    </div>
  </div>
  )
}
  </div>
     
  );
}

export default App;
