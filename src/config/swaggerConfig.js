const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HayaseDB API',
            version: '1.0.0',
            description: 'API Documentation',
        },
        servers: [
            {
                url: process.env.API_URL,
            },
        ],
        components: {
            schemas: {}
        },
    },
    apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);


const setupSwagger = (app) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        swaggerOptions: {
            docExpansion: 'none',
        },
        customSiteTitle: "HayaseDB API",
        customCss: `
            .topbar { display: none; }
            .swagger-ui .topbar { display: none; }
            .swagger-ui .link { font-size: 24px; color: #333; }
            .swagger-ui .info { font-size: 28px; font-weight: bold; }
            .swagger-ui .info h1 { content: "HayaseDB"; }
        `,

    }));
};

module.exports = setupSwagger;
