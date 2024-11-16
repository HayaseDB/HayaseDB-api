const {sequelize} = require('../config/databaseConfig');
const customErrors = require("../utils/customErrorsUtil");
const os = require("node:os");
const {version, author, license, homepage} = require('../../package.json');


const metricsService = {
    getDatabaseStats: async () => {
        try {
            const [animeCountResult] = await sequelize.query('SELECT COUNT(*) AS count FROM "Animes"');
            const [userCountResult] = await sequelize.query('SELECT COUNT(*) AS count FROM "Users"');
            const [mediaCountResult] = await sequelize.query('SELECT COUNT(*) AS count FROM "Media"');
            const [uptimeResult] = await sequelize.query(`SELECT now() - pg_postmaster_start_time() AS uptime`);
            const [databaseSizeResult] = await sequelize.query("SELECT pg_size_pretty(pg_database_size('HayaseDB')) AS size");
            const [animeSizeResult] = await sequelize.query(`SELECT pg_size_pretty(pg_total_relation_size('"Animes"')) AS size`);
            const [mediaSizeResult] = await sequelize.query(`SELECT pg_size_pretty(pg_total_relation_size('"Media"')) AS size`);

            return {
                totalAnime: parseInt(animeCountResult[0].count, 10),
                totalUsers: parseInt(userCountResult[0].count, 10),
                totalMedia: parseInt(mediaCountResult[0].count, 10),
                totalDatabaseSize: databaseSizeResult[0].size,
                uptime: uptimeResult[0].uptime,
                animeSize: animeSizeResult[0].size,
                mediaSize: mediaSizeResult[0].size,
            };
        } catch (error) {

            if (error.original && error.original.code === 'ENOTFOUND') {
                throw new customErrors.DatabaseError(`Database connection error`);
            } else {
                throw new customErrors.DatabaseError(`Failed to retrieve database stats`);
            }
        }
    },
    getInstanceInfo: async () => {
        const [versionResult] = await sequelize.query('SELECT version() AS version');

        return {
            platform: os.platform(),
            architecture: os.arch(),
            nodeVersion: process.versions.node,
            sequelizeVersion: require('sequelize/package.json').version,
            postgresVersion: versionResult[0].version,
            uptime: os.uptime(),
            memoryUsage: {
                total: os.totalmem(),
                used: os.totalmem() - os.freemem(),
                free: os.freemem(),
            },
            environment: process.env.NODE_ENV || 'development',

        };
    },
    getHayaseDBMetrics: async () => {
        return {
            version: version,
            environment: process.env.NODE_ENV || 'development',
            copyright: `© HayaseDB`,
            license: license || 'MIT',
            repository: homepage || 'https://github.com/HayaseDB',
            author: author || 'Unknown Author',
            homepage: 'https://hayasedb.com',
            supportEmail: 'info@hayasedb.com',
            documentationUrl: `${process.env.API_URL}/docs`,
        };
    },
};


module.exports = metricsService;
