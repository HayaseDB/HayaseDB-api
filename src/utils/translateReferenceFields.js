const { model: User } = require('../models/userModel');

const translateReferenceFields = async (data) => {
    const baseMediaUrl = `${process.env.API_URL}/media/`;
    const baseUserUrl = `${process.env.API_URL}/user/`;

    const hasLayoutStructure = (item) => {
        return item && typeof item === 'object' &&
            item.hasOwnProperty('name') &&
            item.hasOwnProperty('value') &&
            item.hasOwnProperty('type');
    };

    const recursiveTransform = async (item) => {
        if (item && typeof item === 'object') {
            if (hasLayoutStructure(item)) {
                if (item.type === 'MEDIA' && typeof item.value === 'string') {
                    return {
                        ...item,
                        type: 'IMG URL',
                        value: `${baseMediaUrl}${item.value}`
                    };
                } else if (item.type === 'USER ID' && typeof item.value === 'string') {
                    const userId = item.value;

                    const user = await User.findByPk(userId, {
                        attributes: ['username', 'createdAt', 'isAdmin', 'isBanned']
                    });

                    if (user) {
                        return {
                            ...item,
                            type: 'USER',
                            value: userId,
                            user: {
                                username: user.username,
                                createdAt: user.createdAt,
                                isAdmin: user.isAdmin,
                                isBanned: user.isBanned,
                                url: `${baseUserUrl}${userId}`
                            }
                        };
                    }
                }
            }

            if (Array.isArray(item)) {
                return Promise.all(item.map(recursiveTransform));
            }

            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    item[key] = await recursiveTransform(item[key]);
                }
            }
        }

        return item;
    };

    return await recursiveTransform(data);
};

module.exports = translateReferenceFields;
