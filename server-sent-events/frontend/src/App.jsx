import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [stocks,setStocks] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/stocks/price-updates');

    eventSource.onmessage = (event) => {
      const newStock = JSON.parse(event.data);

      setStocks((prevStocks) => {
        const existingStockIndex = prevStocks.findIndex((stock) => stock.symbol === newStock.symbol);
        console.log('existingStockIndex',existingStockIndex);

        if(existingStockIndex>-1){
          const updatedStocks = [...prevStocks];
          console.log('updatedStocks',updatedStocks);
          updatedStocks[existingStockIndex] = newStock;
          return updatedStocks;
        }
        else
        {
          return [...prevStocks,newStock];
        }
      }
      );
    };

    return ()=>{
      eventSource.close();
    }
  }, [])

  return (
    <>
      <div style={{ padding: '20px' }}>
      <h1>Live Stock Price Updates using SSE</h1>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Stock Symbol</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, index) => (
            <tr key={index}>
              <td>{stock.symbol}</td>
              <td>{stock.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
}

export default App
