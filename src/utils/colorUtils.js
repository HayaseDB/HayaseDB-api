const chalk = require('chalk');

const blendColors = (startHex, endHex, ratio) => {
    const start = parseInt(startHex.slice(1), 16);
    const end = parseInt(endHex.slice(1), 16);

    const r = Math.round((start >> 16) * (1 - ratio) + (end >> 16) * ratio);
    const g = Math.round(((start >> 8) & 0xff) * (1 - ratio) + ((end >> 8) & 0xff) * ratio);
    const b = Math.round((start & 0xff) * (1 - ratio) + (end & 0xff) * ratio);

    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const createGradient = (text, startColor = '#b396e9', endColor = '#ffffff') => {
    const gradientColors = [];

    for (let i = 0; i < text.length; i++) {
        const ratio = i / (text.length - 1);
        const color = blendColors(startColor, endColor, ratio);
        gradientColors.push(chalk.hex(color)(text[i]));
    }

    return gradientColors.join('');
};

module.exports = {
    blendColors,
    createGradient,
};
