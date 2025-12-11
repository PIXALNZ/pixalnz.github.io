// Te Reo Māori Wordle - Game Logic

const Game = (() => {
    // Game state
    let targetWord = '';
    let currentRow = 0;
    let currentGuess = '';
    let gameOver = false;
    let statistics = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        lastWin: null
    };
    
    // Storage keys with prefix for security
    const STORAGE_PREFIX = 'tereo_wordle_';
    const STATS_KEY = STORAGE_PREFIX + 'stats';
    const GAME_STATE_KEY = STORAGE_PREFIX + 'game';
    
    // Initialize game
    const init = () => {
        UI.init();
        loadStatistics();
        
        // Check for saved game
        const savedGame = loadGameState();
        if (savedGame && !savedGame.gameOver) {
            restoreGame(savedGame);
        } else {
            startNewGame();
        }
        
        // Set up key press handler
        UI.setKeyPressCallback(handleKeyPress);
        
        // Show help on first visit
        if (!localStorage.getItem(STORAGE_PREFIX + 'visited')) {
            setTimeout(() => {
                UI.showModal('help');
                localStorage.setItem(STORAGE_PREFIX + 'visited', 'true');
            }, 500);
        }
    };
    
    // Start new game
    const startNewGame = () => {
        targetWord = WordList.getRandomAnswer();
        currentRow = 0;
        currentGuess = '';
        gameOver = false;
        
        UI.clearBoard();
        saveGameState();
        
        console.log('New game started'); // For debugging
        // SECURITY: Remove this in production or add: console.log('Target:', targetWord);
    };
    
    // Handle key press
    const handleKeyPress = (key) => {
        if (gameOver) return;
        
        if (key === 'ENTER') {
            submitGuess();
        } else if (key === '←') {
            deleteLetter();
        } else if (currentGuess.length < 5) {
            addLetter(key);
        }
    };
    
    // Add letter to current guess
    const addLetter = (letter) => {
        if (currentGuess.length < 5) {
            currentGuess += letter;
            UI.updateTile(currentRow, currentGuess.length - 1, letter);
            saveGameState();
        }
    };
    
    // Delete letter from current guess
    const deleteLetter = () => {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            UI.updateTile(currentRow, currentGuess.length, '');
            saveGameState();
        }
    };
    
    // Submit guess
    const submitGuess = () => {
        if (currentGuess.length !== 5) {
            UI.showMessage('Not enough letters');
            UI.shakeRow(currentRow);
            return;
        }
        
        // Validate word
        if (!WordList.isValidWord(currentGuess)) {
            UI.showMessage('Not in word list');
            UI.shakeRow(currentRow);
            return;
        }
        
        // Check guess
        const result = checkGuess(currentGuess, targetWord);
        
        // Reveal tiles with animation
        result.forEach((state, i) => {
            UI.revealTile(currentRow, i, state);
            UI.updateKeyState(currentGuess[i], state);
        });
        
        // Check for win or loss
        setTimeout(() => {
            if (currentGuess === targetWord) {
                handleWin();
            } else if (currentRow === 5) {
                handleLoss();
            } else {
                currentRow++;
                currentGuess = '';
                saveGameState();
            }
        }, 2000);
    };
    
    // Check guess against target word
    const checkGuess = (guess, target) => {
        const result = Array(5).fill('absent');
        const targetLetters = target.split('');
        const guessLetters = guess.split('');
        
        // First pass: mark correct letters
        guessLetters.forEach((letter, i) => {
            if (letter === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null; // Mark as used
            }
        });
        
        // Second pass: mark present letters
        guessLetters.forEach((letter, i) => {
            if (result[i] === 'correct') return;
            
            const targetIndex = targetLetters.indexOf(letter);
            if (targetIndex !== -1) {
                result[i] = 'present';
                targetLetters[targetIndex] = null; // Mark as used
            }
        });
        
        return result;
    };
    
    // Handle win
    const handleWin = () => {
        gameOver = true;
        UI.bounceRow(currentRow);
        
        const messages = [
            'Tino pai! Excellent!',
            'Ka rawe! Awesome!',
            'Ka mau te wehi! Amazing!',
            'Kia kaha! Well done!',
            'Tino pai rawa atu! Outstanding!'
        ];
        
        setTimeout(() => {
            UI.showMessage(messages[Math.floor(Math.random() * messages.length)], 2000);
        }, 1000);
        
        // Update statistics
        statistics.gamesPlayed++;
        statistics.gamesWon++;
        statistics.currentStreak++;
        statistics.maxStreak = Math.max(statistics.maxStreak, statistics.currentStreak);
        statistics.guessDistribution[currentRow + 1]++;
        statistics.lastWin = currentRow + 1;
        
        saveStatistics();
        saveGameState();
        
        // Show stats after delay
        setTimeout(() => {
            UI.updateStats({
                ...statistics,
                winPercentage: Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100)
            });
            UI.showModal('stats');
        }, 2500);
    };
    
    // Handle loss
    const handleLoss = () => {
        gameOver = true;
        
        setTimeout(() => {
            UI.showMessage(`The word was: ${targetWord}`, 3000);
        }, 1000);
        
        // Update statistics
        statistics.gamesPlayed++;
        statistics.currentStreak = 0;
        statistics.lastWin = null;
        
        saveStatistics();
        saveGameState();
        
        // Show stats after delay
        setTimeout(() => {
            UI.updateStats({
                ...statistics,
                winPercentage: Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100)
            });
            UI.showModal('stats');
        }, 3000);
    };
    
    // Share results
    const shareResults = () => {
        const emoji = gameOver && currentGuess === targetWord;
        let text = `Ngā Kupu ${emoji ? currentRow + 1 : 'X'}/6\n\n`;
        
        // Get the board state up to current row
        const rows = document.querySelectorAll('.row');
        for (let i = 0; i <= (emoji ? currentRow : 5); i++) {
            const tiles = rows[i].querySelectorAll('.tile');
            tiles.forEach(tile => {
                if (tile.classList.contains('correct')) {
                    text += '🟩';
                } else if (tile.classList.contains('present')) {
                    text += '🟨';
                } else if (tile.classList.contains('absent')) {
                    text += '⬛';
                }
            });
            text += '\n';
        }
        
        // Try to share or copy to clipboard
        if (navigator.share) {
            navigator.share({
                text: text
            }).catch(() => {
                copyToClipboard(text);
            });
        } else {
            copyToClipboard(text);
        }
    };
    
    // Copy to clipboard
    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                UI.showMessage('Results copied to clipboard!');
            }).catch(() => {
                UI.showMessage('Failed to copy results');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                UI.showMessage('Results copied to clipboard!');
            } catch (err) {
                UI.showMessage('Failed to copy results');
            }
            
            document.body.removeChild(textarea);
        }
    };
    
    // Save game state
    const saveGameState = () => {
        const state = {
            targetWord: btoa(targetWord), // Basic encoding
            currentRow,
            currentGuess,
            gameOver,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save game state:', e);
        }
    };
    
    // Load game state
    const loadGameState = () => {
        try {
            const saved = localStorage.getItem(GAME_STATE_KEY);
            if (!saved) return null;
            
            const state = JSON.parse(saved);
            
            // Validate timestamp (expire after 24 hours)
            const age = Date.now() - state.timestamp;
            if (age > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(GAME_STATE_KEY);
                return null;
            }
            
            return state;
        } catch (e) {
            console.error('Failed to load game state:', e);
            return null;
        }
    };
    
    // Restore game from saved state
    const restoreGame = (state) => {
        try {
            targetWord = atob(state.targetWord);
            currentRow = state.currentRow;
            currentGuess = state.currentGuess;
            gameOver = state.gameOver;
            
            // Restore would require additional logic to replay moves
            // For simplicity, just start new game if restoration fails
            startNewGame();
        } catch (e) {
            console.error('Failed to restore game:', e);
            startNewGame();
        }
    };
    
    // Save statistics
    const saveStatistics = () => {
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(statistics));
        } catch (e) {
            console.error('Failed to save statistics:', e);
        }
    };
    
    // Load statistics
    const loadStatistics = () => {
        try {
            const saved = localStorage.getItem(STATS_KEY);
            if (saved) {
                const loaded = JSON.parse(saved);
                statistics = { ...statistics, ...loaded };
            }
        } catch (e) {
            console.error('Failed to load statistics:', e);
        }
    };
    
    // Public API
    return {
        init,
        startNewGame,
        shareResults
    };
})();

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Game.init);
} else {
    Game.init();
}
