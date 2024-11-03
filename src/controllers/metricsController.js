const { model: Media } = require('../models/mediaModel');
const metricsService = require("../services/metricsService");
const responseHandler = require("../handlers/responseHandler");
const os = require("node:os");


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
        const stats = await metricsService.getDatabaseStats();

        return responseHandler.success(res, stats);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

module.exports = {
    getDatabaseStats,
    getInstanceInfo
};
