const dgram = require('dgram');

const DNS_ZONE = {
    'example.com': '192.168.1.1',
    'test.com': '192.168.1.2',
    'myapp.dev': '10.0.0.5',
    'myapp.com': '10.0.0.6',
    'mydomain.in': '172.16.254.1',
};

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    console.log(`Received DNS query from ${rinfo.address}:${rinfo.port}`);

    const domain = parseDnsQuery(msg);
    if (!domain) {
        console.log('Invalid DNS query');
        return;
    }

    console.log(`Requested domain: ${domain}`);

    // Build and send DNS response
    const ip = DNS_ZONE[domain];
    if (ip) {
        const response = buildDnsResponse(msg, ip);
        server.send(response, rinfo.port, rinfo.address);
        console.log(`Sent DNS response with IP: ${ip}`);
    } else {
        console.log(`Domain ${domain} not found in zone`);
    }
});

// example usae: 0x03 0x77 0x77 0x77 0x07 ... 0x00 (this is end)
function parseDnsQuery(msg) {
    const qname = [];
    let offset = 12; // Skip the first 12 bytes (header)
    while (msg[offset] !== 0) {
        const len = msg[offset];
        const part = msg.slice(offset + 1, offset + 1 + len).toString();
        qname.push(part);
        offset += len + 1;
    }
    return qname.join('.');
}

// Build a basic DNS response for an A (IPv4) query
function buildDnsResponse(query, ip) {
    const response = Buffer.alloc(512);

    // Copy the header from the query
    query.copy(response, 0, 0, 12);

    // Set response flags (standard query response, no error)
    response[2] = 0x81;
    response[3] = 0x80;

    // Set the answer count to 1
    response[6] = 0x00;
    response[7] = 0x01;

    // Copy the query section from the original query
    query.copy(response, 12, 12, query.length);

    // Answer section (IPv4 address response)
    const answerOffset = query.length;
    const ipParts = ip.split('.').map(Number);

    // Name (pointer to the query domain name)
    response[answerOffset] = 0xc0;
    response[answerOffset + 1] = 0x0c;

    // Type (A record)
    response[answerOffset + 2] = 0x00;
    response[answerOffset + 3] = 0x01;

    // Class (IN - Internet)
    response[answerOffset + 4] = 0x00;
    response[answerOffset + 5] = 0x01;

    // TTL (Time to live)
    response[answerOffset + 6] = 0x00;
    response[answerOffset + 7] = 0x00;
    response[answerOffset + 8] = 0x00;
    response[answerOffset + 9] = 0x3c; // TTL = 60 seconds

    // Data length (IPv4 address is 4 bytes)
    response[answerOffset + 10] = 0x00;
    response[answerOffset + 11] = 0x04;

// The IP address (e.g., 192.168.1.1)
response[answerOffset + 12] = ipParts[0]; // 192
response[answerOffset + 13] = ipParts[1]; // 168
response[answerOffset + 14] = ipParts[2]; // 1
response[answerOffset + 15] = ipParts[3]; // 1

    return response.slice(0, answerOffset + 16);
}

server.bind(53, () => {
    console.log('DNS server is running on port 53');
});