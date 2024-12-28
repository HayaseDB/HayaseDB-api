/*
const Plan = require('../models/planModel');

async function seedPlans() {
    const defaultPlans = [
        {
            name: 'Free',
            rateLimit: 1000,
            description: 'Basic plan with limited access',
        },
        {
            name: 'Pro',
            rateLimit: 10000,
            description: 'Advanced plan with higher limits',
        },
        {
            name: 'Enterprise',
            rateLimit: 100000,
            description: 'Unlimited access for enterprises',
        },
    ];

    for (const plan of defaultPlans) {
        await Plan.findOrCreate({
            where: { name: plan.name },
            defaults: plan,
        });
    }

}

//module.exports = seedPlans;
*/
