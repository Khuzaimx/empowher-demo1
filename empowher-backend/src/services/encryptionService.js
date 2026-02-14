const { encrypt, decrypt } = require('../config/encryption');

/**
 * Encryption Service
 * Handles encryption and decryption of sensitive user data
 */

/**
 * Encrypt journal entry before storing
 * @param {string} text - Plain text journal entry
 * @returns {object|null} - Encrypted data object or null
 */
function encryptJournal(text) {
    if (!text || text.trim() === '') {
        return null;
    }

    return encrypt(text);
}

/**
 * Decrypt journal entry for display
 * @param {object} encryptedData - Object with encrypted, iv, and authTag
 * @returns {string|null} - Decrypted text or null
 */
function decryptJournal(encryptedData) {
    if (!encryptedData) {
        return null;
    }

    // Handle both object format and separate fields
    if (typeof encryptedData === 'string') {
        return null; // Invalid format
    }

    return decrypt(encryptedData);
}

/**
 * Prepare journal data for database storage
 * @param {string} journalText - Plain text journal
 * @returns {object} - Object with encrypted fields for database
 */
function prepareJournalForStorage(journalText) {
    if (!journalText || journalText.trim() === '') {
        return {
            journal_encrypted: null,
            journal_iv: null,
            journal_auth_tag: null
        };
    }

    const encrypted = encryptJournal(journalText);

    return {
        journal_encrypted: encrypted.encrypted,
        journal_iv: encrypted.iv,
        journal_auth_tag: encrypted.authTag
    };
}

/**
 * Reconstruct encrypted data from database fields
 * @param {object} dbRow - Database row with encrypted fields
 * @returns {object|null} - Encrypted data object or null
 */
function reconstructEncryptedData(dbRow) {
    if (!dbRow.journal_encrypted) {
        return null;
    }

    return {
        encrypted: dbRow.journal_encrypted,
        iv: dbRow.journal_iv,
        authTag: dbRow.journal_auth_tag
    };
}

module.exports = {
    encryptJournal,
    decryptJournal,
    prepareJournalForStorage,
    reconstructEncryptedData
};
