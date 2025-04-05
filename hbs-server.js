const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const fs = require('fs');

const app = express();
const port = 3030;

app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: false,
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'module', 'mailer', 'templates'));

app.use(express.static(path.join(__dirname, 'public')));

fs.readdirSync(path.join(__dirname, 'src', 'module', 'mailer', 'templates')).forEach(file => {
    if (file.endsWith('.hbs') && file !== 'base.hbs') {
        const fileName = file.replace('.hbs', '');
        app.get(`/preview/${fileName}`, (req, res) => {
            res.render(fileName, {
                title: `${fileName} - HayaseDB`,
                year: new Date().getFullYear(),
                url: 'http://example.com/verify',
                layout: 'base'
            });
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
