const CharacterModel = require('../models/characterModel');
const AnimeModel = require('../models/animeModel');
const { CharacterErrorCodes, AnimeErrorCodes} = require('../utils/errorCodes');
const { Types, startSession } = require('mongoose');
const sanitization = require('../utils/sanitization');
const {getUniqueFields, checkUniqueField} = require("../utils/uniqueCheck");

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

const handleDatabaseError = (error) => ({ error: { ...CharacterErrorCodes.DATABASE_ERROR, details: error.message } });

exports.createCharacter = async (data, animeId) => {
    const session = await startSession();
    session.startTransaction();

    try {
        const sanitizedData = sanitization.sanitizeData(data, 'character');

        if (!sanitizedData.name) {
            return { error: AnimeErrorCodes.INVALID_BODY };
        }

        if (!animeId || !isValidObjectId(animeId)) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.INVALID_ANIME_ID };
        }

        const uniqueFields = getUniqueFields('character');
        for (const field of uniqueFields) {
            if (sanitizedData[field]) {
                const existingDocument = await checkUniqueField(CharacterModel, field, sanitizedData[field]);
                if (existingDocument) {
                    await session.abortTransaction();
                    await session.endSession();
                    return { error: CharacterErrorCodes.DUPLICATE };
                }
            }
        }

        const character = new CharacterModel(sanitizedData);
        await character.save();

        const anime = await AnimeModel.findById(animeId);
        if (!anime) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.INVALID_ANIME_ID };
        }

        if (!anime.characters.includes(character._id)) {
            anime.characters.push(character._id);
            await anime.save();
        }

        await session.commitTransaction();
        await session.endSession();
        return { data: character };
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        if (error.code === 11000) {
            return { error: CharacterErrorCodes.DUPLICATE };
        }
        return handleDatabaseError(error);
    }
};



exports.editCharacter = async (characterId, data) => {
    if (!isValidObjectId(characterId)) {
        return { error: CharacterErrorCodes.INVALID_ID };
    }
    try {
        const sanitizedData = sanitization.sanitizeData(data, 'character');
        const existingCharacter = await CharacterModel.findById(characterId);

        if (!existingCharacter) {
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }

        const uniqueFields = getUniqueFields('character');
        for (const field of uniqueFields) {
            if (sanitizedData[field] && sanitizedData[field] !== existingCharacter[field]) {
                const existingDocument = await checkUniqueField(CharacterModel, field, sanitizedData[field], characterId);
                if (existingDocument) {
                    return { error: CharacterErrorCodes.DUPLICATE };
                }
            }
        }

        const updatedCharacter = await CharacterModel.findByIdAndUpdate(characterId, sanitizedData, { new: true });
        return { data: updatedCharacter };
    } catch (error) {
        return handleDatabaseError(error);
    }
};
exports.deleteCharacter = async (characterId) => {
    if (!isValidObjectId(characterId)) {
        return { error: CharacterErrorCodes.INVALID_ID };
    }

    const session = await startSession();
    session.startTransaction();

    try {
        const result = await CharacterModel.findByIdAndDelete(characterId);
        if (!result) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }

        await AnimeModel.updateMany(
            { characters: characterId },
            { $pull: { characters: characterId } }
        );

        await session.commitTransaction();
        await session.endSession();
        return {};
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return handleDatabaseError(error);
    }
};

exports.getCharacterById = async (characterId) => {
    if (!isValidObjectId(characterId)) {
        return { error: CharacterErrorCodes.INVALID_ID };
    }

    try {
        const character = await CharacterModel.findById(characterId);
        if (!character) {
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }
        return { data: character };
    } catch (error) {
        return handleDatabaseError(error);
    }
};
