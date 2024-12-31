const userService = require("../services/userService");
const responseHandler = require("../handlers/responseHandler");
const customErrorsUtil = require("../utils/customErrorsUtil");


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


module.exports = {getUserById};
