import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JokeFetcher = () => {
  const [joke, setJoke] = useState({ setup: '', punchline: '' });
  const [loading, setLoading] = useState(true);

  const fetchJoke = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/joke');
      console.log("response",response)
      setJoke(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching joke:', error);
      setLoading(false);
    }
  };

console.log("joke",joke)

  // Polling - Fetch joke every 5 seconds
  useEffect(() => {
    fetchJoke(); 
    const intervalId = setInterval(() => {
      fetchJoke();
    }, 8000);

    return () => clearInterval(intervalId);  
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Joke Fetcher using http pooling</h1>
      <br />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p><strong>Setup:</strong> {joke.setup}</p>
          <p><strong>Punchline:</strong> {joke.punchline}</p>
        </div>
      )}
      <button onClick={fetchJoke} style={{ marginTop: '20px' }}>Refresh Now</button>
    </div>
  );
};

export default JokeFetcher;
