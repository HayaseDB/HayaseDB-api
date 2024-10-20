const dns = require('dns').promises;
const logger = require('./logger');

const checkUrl = async (url) => {
    try {
        const urlObj = new URL(url);
        await dns.lookup(urlObj.hostname);
        return true;
    } catch (error) {
        return false;
    }
};

const getWorkingUrl = async (url, fallback) => {
    const isReachable = await checkUrl(url);
    if (!isReachable) {
        logger.warn(`⚠️  Warning: ${url} is not reachable. Falling back to ${fallback}.`);
        return fallback;
    }
    return url;
};

module.exports = {
    getWorkingUrl,
};
