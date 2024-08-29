const characterService = require('../services/characterService');
const { CharacterErrorCodes } = require('../utils/errorCodes');

exports.createCharacter = async (req, res) => {
    try {
        const result = await characterService.createCharacter(req.body, req.params.id);
        if (result.error) {
            return res.status(result.error.code === 'INVALID_ANIME_ID' || result.error.code === 'ANIME_NOT_FOUND' ? 400 : 404).json({ error: result.error });
        }
        res.status(201).json(result.data);
    } catch (err) {
        console.error('Error creating character:', err);
        res.status(500).json({ error: { ...CharacterErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};

exports.deleteCharacter = async (req, res) => {
    try {
        const result = await characterService.deleteCharacter(req.params.id);
        if (result.error) {
            return res.status(404).json({ error: result.error });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: { ...CharacterErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};

exports.editCharacter = async (req, res) => {
    try {
        const result = await characterService.editCharacter(req.params.id, req.body);
        if (result.error) {
            return res.status(result.error.code === 'INVALID_BODY' ? 400 : 404).json({ error: result.error });
        }
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: { ...CharacterErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};

exports.getCharacterById = async (req, res) => {
    try {
        const result = await characterService.getCharacterById(req.params.id);
        if (result.error) {
            return res.status(404).json({ error: result.error });
        }
        res.json(result.data);
    } catch (err) {
        console.error("Error in getCharacterById:", err);
        res.status(500).json({ error: { ...CharacterErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};
