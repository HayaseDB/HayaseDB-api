const User = require("../models/userModel");
const Plan = require("../models/planModel");
const {Op} = require("sequelize");

const userService = {
    getUserPlan: async (userId) => {
        const user = await User.findByPk(userId, {
            include: {
                model: Plan,
                as: 'plan',
            },
        });

        if (!user || !user.plan) {
            let plan = await Plan.findOne({where: {monthlyCost: 0}});

            if (!plan) {
                return {name: 'Unknown', rateLimit: 0, description: '', monthlyCost: 0};
            }

            return plan;
        }

        return user.plan;
    },


    getUserById: async (userId) => {
        const user = await User.findByPk(userId);

        if (!user) {
            return null;
        }

        return user;
    },


};
module.exports = userService;
