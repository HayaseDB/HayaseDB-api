const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require("node:fs");
const path = require("node:path");

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
            {
                url: `http://hayasedb:${process.env.PORT || 3000}`,
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
    app.get('/openapi.json', (req, res) => {
        res.json(swaggerDocs);
    });
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        swaggerOptions: {
            docExpansion: 'none',
        },
        customfavIcon: '/assets/favicon-16x16.ico',
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
