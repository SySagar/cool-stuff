import React, { useState, useRef, useEffect } from 'react';

const App: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false); // Track if connected
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // STUN server to help discover public IP addresses for NAT traversal
  const iceServers: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(iceServers);

    // When WebRTC gathers an ICE candidate (an address where a peer can be contacted), this event fires
    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && wsRef.current) {
        // Send the ICE candidate to the other peer via WebSocket
        wsRef.current.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      // Set the remote stream to the remote video element
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peerConnection;
  };

  const handleSignaling = (message: string) => {
    const data = JSON.parse(message);

    if (data.type === 'offer') {
      // Set remote offer and create an answer
      peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => {
          // Access the local media (video and audio)
          return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        })
        .then((stream) => {
          // Add local stream tracks to the peer connection
          stream.getTracks().forEach((track) => peerConnectionRef.current?.addTrack(track, stream));

          // Display the local video stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          // Create an answer and send it to the other peer via WebSocket
          return peerConnectionRef.current?.createAnswer();
        })
        .then((answer) => {
          if (answer && peerConnectionRef.current) {
            peerConnectionRef.current.setLocalDescription(answer);
            wsRef.current?.send(JSON.stringify({ type: 'answer', answer }));
          }
        });
    } else if (data.type === 'answer') {
      // Handle incoming answer: Set remote description
      peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'ice-candidate') {
      // Handle incoming ICE candidate
      const candidate = new RTCIceCandidate(data.candidate);
      peerConnectionRef.current?.addIceCandidate(candidate);
    }
  };

  const connect = () => {
    wsRef.current = new WebSocket('ws://localhost:8080');
    wsRef.current.onmessage = (event: MessageEvent) => handleSignaling(event.data);

    const peerConnection = createPeerConnection();
    peerConnectionRef.current = peerConnection;

    // Access the local media (video and audio)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Display the local stream in the local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add the local stream to the peer connection
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

        // Create an offer and send it to the other peer via WebSocket
        return peerConnection.createOffer();
      })
      .then((offer) => {
        peerConnection.setLocalDescription(offer);
        wsRef.current?.send(JSON.stringify({ type: 'offer', offer }));
      });

    setConnected(true);
  };

  return (
    <div>
      <h1>WebRTC Video Call</h1>
      {!connected ? (
        <button onClick={connect}>Connect</button>
      ) : (
        <>
          <div>
            <h2>Local Stream</h2>
            <video ref={localVideoRef} autoPlay muted style={{ width: '300px', height: '200px' }}></video>
          </div>
          <div>
            <h2>Remote Stream</h2>
            <video ref={remoteVideoRef} autoPlay style={{ width: '300px', height: '200px' }}></video>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
