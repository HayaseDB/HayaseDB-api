const express = require('express');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const chokidar = require('chokidar');
const WebSocket = require('ws');

const app = express();
const PORT = 3030;
const WS_PORT = 3031;
const TEMPLATE_DIR = path.join(__dirname, 'src', 'module', 'mailer', 'templates');

const dummyData = {
    url: 'https://example.com/verify?token=abc123',
    name: 'John Doe'
};

const templates = fs.readdirSync(TEMPLATE_DIR).filter(file => file.endsWith('.hbs'));

const wss = new WebSocket.Server({ port: WS_PORT });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => {
        clients.delete(ws);
    });
});

const watcher = chokidar.watch(TEMPLATE_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

watcher.on('change', (path) => {
    console.log(`Template changed: ${path}`);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
});

app.use((req, res, next) => {
    const originalSend = res.send;

    res.send = function(body) {
        if (typeof body === 'string' && body.includes('<!DOCTYPE html>') || body.includes('<html')) {
            const hotReloadScript = `
                <script>
                    (function() {
                        const ws = new WebSocket('ws://localhost:${WS_PORT}');
                        ws.onmessage = function(event) {
                            if (event.data === 'reload') {
                                console.log('Template changed, reloading page...');
                                window.location.reload();
                            }
                        };
                        ws.onclose = function() {
                            console.log('WebSocket connection closed. Reconnecting...');
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        };
                    })();
                </script>
            `;

            if (body.includes('</body>')) {
                body = body.replace('</body>', `${hotReloadScript}</body>`);
            } else {
                body += hotReloadScript;
            }
        }
        return originalSend.call(this, body);
    };

    next();
});

app.get('/', (req, res) => {
    const updatedTemplates = fs.readdirSync(TEMPLATE_DIR).filter(file => file.endsWith('.hbs'));

    const links = updatedTemplates.map(file => {
        const name = path.basename(file, '.hbs');
        return `<li><a href="/preview/${name}">${name}</a></li>`;
    }).join('');

    res.send(`
        <!DOCTYPE html>
        <html>
                <ul>
                    ${links}
                </ul>
        </html>
    `);
});

app.get('/preview/:templateName', (req, res) => {
    const { templateName } = req.params;
    const fileName = `${templateName}.hbs`;
    const templatePath = path.join(TEMPLATE_DIR, fileName);

    if (!fs.existsSync(templatePath)) {
        return res.status(404).send('Template not found');
    }

    try {
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const compiled = handlebars.compile(templateContent);
        const html = compiled(dummyData);

        if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
            res.send(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>${templateName} Preview</title>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `);
        } else {
            res.send(html);
        }
    } catch (err) {
        console.error('Error rendering template:', err);
        res.status(500).send('Error rendering template');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`WebSocket server for hot reload running at ws://localhost:${WS_PORT}`);
    console.log(`Watching for changes in: ${TEMPLATE_DIR}`);
});
