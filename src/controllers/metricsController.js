const { model: Media } = require('../models/mediaModel');
const metricsService = require("../services/metricsService");
const responseHandler = require("../handlers/responseHandler");


/**
 * Get information about the Node.js instance
 */
const getInstanceInfo = async (req, res) => {
    try {
        const instanceInfo = await metricsService.getInstanceInfo();

        const response = {
            instanceInfo,
        };

        return responseHandler.success(res, response);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};


/**
 * Get database information and state
 */
const getDatabaseStats = async (req, res) => {
    try {
        const databaseInfo = await metricsService.getDatabaseStats();
        const response = {
            databaseInfo,
        };
        return responseHandler.success(res, response);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

/**
 * Get HayaseDB metrics
 */
const getHayaseDBMetrics = async (req, res) => {
    try {
        const HayaseDB = await metricsService.getHayaseDBMetrics();
        const response = {
            HayaseDB
        };

        return responseHandler.success(res, response);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

module.exports = {
    getDatabaseStats,
    getInstanceInfo,
    getHayaseDBMetrics
};
