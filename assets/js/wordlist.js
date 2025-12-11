// Te Reo Māori Wordle - Word Lists
// This file contains the word lists in an obfuscated format

const WordList = (() => {
    // Encode/decode functions for basic obfuscation
    const encode = (str) => btoa(encodeURIComponent(str));
    const decode = (str) => decodeURIComponent(atob(str));
    
    // Encoded word lists (you should replace these with your actual encoded lists)
    const encodedAnswers = encode(JSON.stringify([
        'MAORI', 'WHANAU', 'AROHA', 'KŌURA', 'TĀHEI',
        'WHARE', 'NGAIO', 'PĀTEA', 'KĀURU', 'RĀKAU',
        'WĀHINE', 'TĀNE', 'WHENUA', 'MOANA', 'RANGI',
        'MAUNGA', 'PŪKEKO', 'KERERŪ', 'TŪPUNA', 'KŌRERO'
        // Add more words here
    ]));
    
    const encodedValid = encode(JSON.stringify([
        'MAORI', 'WHANAU', 'AROHA', 'KŌURA', 'TĀHEI',
        'WHARE', 'NGAIO', 'PĀTEA', 'KĀURU', 'RĀKAU',
        'WĀHINE', 'TĀNE', 'WHENUA', 'MOANA', 'RANGI',
        'MAUNGA', 'PŪKEKO', 'KERERŪ', 'TŪPUNA', 'KŌRERO',
        'KIWI', 'RONGO', 'TAPU', 'MANA', 'TIKA',
        'PONO', 'NOHOA', 'KAHA', 'TĪNEI', 'ĀTETE'
        // Add more valid guesses here
    ]));
    
    // Private arrays
    let answers = [];
    let validWords = [];
    
    // Initialize word lists
    const init = () => {
        try {
            answers = JSON.parse(decode(encodedAnswers));
            validWords = JSON.parse(decode(encodedValid));
            
            // Normalize all words
            answers = answers.map(w => normalizeWord(w));
            validWords = validWords.map(w => normalizeWord(w));
        } catch (e) {
            console.error('Failed to initialize word lists');
            answers = ['MAORI'];
            validWords = ['MAORI'];
        }
    };
    
    // Normalize word (remove macrons for comparison, uppercase)
    const normalizeWord = (word) => {
        return word
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };
    
    // Get random answer
    const getRandomAnswer = () => {
        const index = Math.floor(Math.random() * answers.length);
        return answers[index];
    };
    
    // Check if word is valid
    const isValidWord = (word) => {
        const normalized = normalizeWord(word);
        return validWords.includes(normalized);
    };
    
    // Get word count
    const getAnswerCount = () => answers.length;
    
    // Public API
    return {
        init,
        getRandomAnswer,
        isValidWord,
        getAnswerCount,
        normalizeWord
    };
})();

// Initialize immediately
WordList.init();
