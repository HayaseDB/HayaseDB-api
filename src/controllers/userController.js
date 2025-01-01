const userService = require("../services/userService");
const responseHandler = require("../handlers/responseHandler");
const customErrorsUtil = require("../utils/customErrorsUtil");
const customErrors = require("../utils/customErrorsUtil");


/**
 * Retrieves user details by ID
 */
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userService.getUserById(userId);

        if (!user) {
            return responseHandler.error(res, new customErrorsUtil.NotFoundError('User not found'), 404);
        }

        return responseHandler.success(res, { user }, 'User details retrieved successfully', 200);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};

/**
 * Get User Avatar by ID
 */
const getAvatar = async (req, res) => {
    const { id } = req.params;

    try {
        const avatarBuffer = await userService.getAvatar(id);

        return res.send(avatarBuffer);
    } catch (error) {
        if (error instanceof customErrors.NotFoundError) {
            return responseHandler.error(res, error.message, 404);
        } else {
            return responseHandler.error(res, 'Internal server error', 500);
        }
    }
};


const listUsers = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        order = 'ASC',
        sortBy = 'createdAt',
        search = '',
        filters = '{}'
    } = req.query;

    try {

        const parsedFilters = JSON.parse(filters);
        if (typeof parsedFilters !== 'object') {
            return responseHandler.error(res, 'Invalid filters format', 400);
        }

        const { users, meta } = await userService.listUsers({
            page: Number(page),
            limit: Number(limit),
            order: order.toUpperCase(),
            sortBy,
            search: search?.trim(),
            filters: parsedFilters,
            admin: req.auth?.role === 'admin'
        });

        return responseHandler.success(res, {
            users: users.length ? users : [],
            meta: users.length ? meta : { ...meta, message: 'No users found' }
        });

    } catch (error) {
        console.log(error)
        return responseHandler.error(res, error.message || 'Internal server error', 500);
    }
};

module.exports = {getUserById, listUsers, getAvatar};
