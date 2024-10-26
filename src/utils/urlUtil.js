const dns = require('dns').promises;
const net = require('net'); 
const logger = require('./loggerUtil');

const checkUrl = async (url) => {
    try {
        const urlObj = new URL(url);
        await dns.lookup(urlObj.hostname);
        return urlObj;
    } catch (error) {
        return null;
    }
};

const checkPort = async (hostname, port) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            resolve(false);
        });

        socket.connect(port, hostname);
    });
};

const getUrl = async (url, fallback = "http://localhost") => {
    const urlObj = await checkUrl(url);
    if (!urlObj) {
        await logger.warn(`${url} is not reachable. Falling back to ${fallback}`);
        const fallbackObj = await checkUrl(fallback);
        
        if (fallbackObj) {
            const isFallbackReachable = await checkPort(fallbackObj.hostname, fallbackObj.port);
            return {
                url: fallback,
                status: isFallbackReachable ? 'fallback' : 'no connection',
                color: isFallbackReachable ? 'yellow' : 'red',
            };
        }

        return {
            url: fallback,
            status: 'no connection',
            color: 'red',
        };
    }

    const isPrimaryReachable = await checkPort(urlObj.hostname, urlObj.port);
    if (!isPrimaryReachable) {
        await logger.warn(`${url} is not reachable on port ${urlObj.port}. Falling back to ${fallback}`);
        const fallbackObj = await checkUrl(fallback);
        
        if (fallbackObj) {
            const isFallbackReachable = await checkPort(fallbackObj.hostname, fallbackObj.port);
            return {
                url: fallback,
                status: isFallbackReachable ? 'fallback' : 'no connection',
                color: isFallbackReachable ? 'yellow' : 'red',
            };
        }

        return {
            url: fallback,
            status: 'no connection',
            color: 'red',
        };
    }

    return {
        url: url,
        status: 'success',
        color: 'green',
    };
};

module.exports = { getUrl };
