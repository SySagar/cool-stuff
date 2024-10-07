const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection',(ws)=>{
    console.log("client connecnrted");

    ws.on('message',(msg)=>{
        wss.clients.forEach((client)=>{
            if(client!==ws && client.readyState == WebSocket.OPEN){
                client.send(msg);
            }
        })
    })

    ws.on('close', () => {
        console.log('A client disconnected');
      });
})

console.log('Signaling server running on ws://localhost:8080');
