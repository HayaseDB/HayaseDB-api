const Character = require('../models/characterModel');
const Anime = require('../models/animeModel');
const { CharacterErrorCodes } = require('../utils/errorCodes');
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

        if (!animeId || !isValidObjectId(animeId)) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.INVALID_ANIME_ID };
        }

        const uniqueFields = getUniqueFields('character');
        for (const field of uniqueFields) {
            if (sanitizedData[field]) {
                const existingDocument = await checkUniqueField(Character, field, sanitizedData[field]);
                if (existingDocument) {
                    await session.abortTransaction();
                    await session.endSession();
                    return { error: CharacterErrorCodes.DUPLICATE };
                }
            }
        }

        const character = new Character(sanitizedData);
        await character.save();

        const anime = await Anime.findById(animeId);
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

    const session = await startSession();
    session.startTransaction();

    try {
        const sanitizedData = sanitization.sanitizeData(data, 'character');

        if (sanitizedData.anime && !isValidObjectId(sanitizedData.anime)) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.INVALID_ANIME_ID };
        }

        const existingCharacter = await Character.findById(characterId);
        if (!existingCharacter) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }

        const updatedCharacter = await Character.findByIdAndUpdate(characterId, sanitizedData, { new: true });
        if (!updatedCharacter) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }

        const uniqueFields = getUniqueFields('character');
        for (const field of uniqueFields) {
            if (sanitizedData[field] && sanitizedData[field] !== existingCharacter[field]) {
                const existingDocument = await checkUniqueField(Character, field, sanitizedData[field]);
                if (existingDocument) {
                    await session.abortTransaction();
                    await session.endSession();
                    return { error: CharacterErrorCodes.DUPLICATE };
                }
            }
        }

        if (sanitizedData.anime) {
            const anime = await Anime.findById(sanitizedData.anime);
            if (anime) {
                if (!anime.characters.includes(updatedCharacter._id)) {
                    anime.characters.push(updatedCharacter._id);
                    await anime.save();
                }
            } else {
                await session.abortTransaction();
                await session.endSession();
                return { error: CharacterErrorCodes.ANIME_NOT_FOUND };
            }
        }

        if (existingCharacter.anime && existingCharacter.anime.toString() !== sanitizedData.anime) {
            const oldAnime = await Anime.findById(existingCharacter.anime);
            if (oldAnime) {
                oldAnime.characters.pull(existingCharacter._id);
                await oldAnime.save();
            }
        }

        await session.commitTransaction();
        await session.endSession();
        return { data: updatedCharacter };
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        if (error.code === 11000) {
            return { error: CharacterErrorCodes.DUPLICATE_FIELD };
        }
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
        const result = await Character.findByIdAndDelete(characterId);
        if (!result) {
            await session.abortTransaction();
            await session.endSession();
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }

        await Anime.updateMany(
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
        const character = await Character.findById(characterId);
        if (!character) {
            return { error: CharacterErrorCodes.CHARACTER_NOT_FOUND };
        }
        return { data: character };
    } catch (error) {
        return handleDatabaseError(error);
    }
};
