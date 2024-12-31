
const Plan = require('../models/planModel');

async function seedPlans() {
    const defaultPlans = [
        {
            name: 'Free',
            rateLimit: 200,
            description: 'Basic plan with limited access',
            monthlyCost: 0.00,

        },
        {
            name: 'Pro',
            rateLimit: 500,
            description: 'Advanced plan with higher limits',
            monthlyCost: 5.00,
        },
        {
            name: 'Enterprise',
            rateLimit: 1000,
            description: 'Unlimited access for enterprises',
            monthlyCost: 10.00,
        },
    ];

    for (const plan of defaultPlans) {
        await Plan.findOrCreate({
            where: { name: plan.name },
            defaults: plan,
        });
    }

}

module.exports = seedPlans;

