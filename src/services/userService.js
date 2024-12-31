const User = require("../models/userModel");
const Plan = require("../models/planModel");
const {Op} = require("sequelize");
customErrorsUtil = require("../utils/customErrorsUtil");

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

    listUsers: async ({
                          page = 1,
                          limit = 10,
                          order = 'ASC',
                          search = '',
                          filters = {},
                          sortBy = 'username',
                          admin = false
                      }) => {
        const offset = (page - 1) * limit;
        if (isNaN(offset) || offset < 0) {
            throw new Error('Invalid pagination parameters');
        }

        const allowedSortFields = ['username', 'email', 'createdAt', 'updatedAt'];
        const normalizedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'username';

        const whereClause = {
            ...(search?.trim() && {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${search.replace(/%/g, '\\%')}%` } },
                    { email: { [Op.iLike]: `%${search.replace(/%/g, '\\%')}%` } }
                ]
            }),
            ...filters,
            ...(admin ? {} : { public: true })
        };

        const UserModel = admin ? User.unscoped() : User;
        const { rows: users, count: totalUsers } = await UserModel.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[normalizedSortBy, order]],
            attributes: admin ? { exclude: ['password'] } : undefined
        });

        const usersWithPlans = await Promise.all(users.map(async (user) => {
            const plan = admin ? await userService.getUserPlan(user.id) : undefined;
            return {
                ...user.toJSON(),
                plan: plan
            };
        }));

        return {
            users: usersWithPlans,
            meta: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                itemsPerPage: limit,
                appliedFilters: Object.keys(filters),
                search: search || undefined,
                orderDirection: order,
                sortBy: normalizedSortBy
            }
        };
    },



};
module.exports = userService;
