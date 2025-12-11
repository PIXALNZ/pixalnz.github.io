// Te Reo Māori Wordle - UI Manager

const UI = (() => {
    let gameBoard, keyboard, message;
    let helpModal, statsModal;
  // Initialize UI elements
    const init = () => {
        gameBoard = document.getElementById('gameBoard');
        keyboard = document.getElementById('keyboard');
        message = document.getElementById('message');
        helpModal = document.getElementById('helpModal');
        statsModal = document.getElementById('statsModal');
        
        createBoard();
        createKeyboard();
        setupEventListeners();
    };
    
    // Create game board
    const createBoard = () => {
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.dataset.row = i;
            
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.col = j;
                row.appendChild(tile);
            }
            
            gameBoard.appendChild(row);
        }
    };
    
    // Create keyboard
    const createKeyboard = () => {
        const rows = [
            ['W', 'H', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
        ];
        
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(key => {
                const button = document.createElement('button');
                button.className = 'key';
                button.dataset.key = key;
                
                if (key === 'ENTER' || key === '←') {
                    button.classList.add('wide');
                }
                
                if (key === '←') {
                    button.innerHTML = '⌫';
                } else {
                    button.textContent = key;
                }
                
                rowDiv.appendChild(button);
            });
            
            keyboard.appendChild(rowDiv);
        });
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Keyboard clicks
        keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                const key = e.target.dataset.key;
                handleKeyPress(key);
            }
        });
        
        // Physical keyboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            
            const key = e.key.toUpperCase();
            
            if (key === 'ENTER') {
                handleKeyPress('ENTER');
            } else if (key === 'BACKSPACE') {
                handleKeyPress('←');
            } else if (/^[A-Z]$/.test(key)) {
                handleKeyPress(key);
            }
        });
        
        // Help button
        document.getElementById('helpBtn').addEventListener('click', () => {
            showModal('help');
        });
        
        // Stats button
        document.getElementById('statsBtn').addEventListener('click', () => {
            showModal('stats');
        });
        
        // Share button
        document.getElementById('shareBtn').addEventListener('click', () => {
            Game.shareResults();
        });
        
        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            Game.startNewGame();
            hideModal('stats');
        });
        
        // Close modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        });
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        });
        
        // Escape key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                });
            }
        });
    };
    
    // Handle key press (to be connected to game logic)
    let keyPressCallback = null;
    const handleKeyPress = (key) => {
        if (keyPressCallback) {
            keyPressCallback(key);
        }
    };
    
    const setKeyPressCallback = (callback) => {
        keyPressCallback = callback;
    };
    
    // Update tile
    const updateTile = (row, col, letter) => {
        const rowElement = gameBoard.querySelector(`[data-row="${row}"]`);
        const tile = rowElement.querySelector(`[data-col="${col}"]`);
        tile.textContent = letter;
        
        if (letter) {
            tile.classList.add('filled');
        } else {
            tile.classList.remove('filled');
        }
    };
    
    // Reveal tile with animation
    const revealTile = (row, col, state) => {
        const rowElement = gameBoard.querySelector(`[data-row="${row}"]`);
        const tile = rowElement.querySelector(`[data-col="${col}"]`);
        
        setTimeout(() => {
            tile.classList.add('flip', `flip-${col}`);
            
            setTimeout(() => {
                tile.classList.remove('empty', 'filled');
                tile.classList.add(state);
                
                setTimeout(() => {
                    tile.classList.remove('flip', `flip-${col}`);
                }, 300);
            }, 300);
        }, col * 100);
    };
    
    // Shake row animation
    const shakeRow = (row) => {
        const rowElement = gameBoard.querySelector(`[data-row="${row}"]`);
        rowElement.classList.add('shake');
        setTimeout(() => {
            rowElement.classList.remove('shake');
        }, 500);
    };
    
    // Bounce row animation (for win)
    const bounceRow = (row) => {
        const rowElement = gameBoard.querySelector(`[data-row="${row}"]`);
        const tiles = rowElement.querySelectorAll('.tile');
        
        tiles.forEach((tile, i) => {
            tile.classList.add('bounce', `bounce-${i}`);
            setTimeout(() => {
                tile.classList.remove('bounce', `bounce-${i}`);
            }, 1000);
        });
    };
    
    // Update keyboard key state
    const updateKeyState = (letter, state) => {
        const key = keyboard.querySelector(`[data-key="${letter}"]`);
        if (!key) return;
        
        // Don't downgrade from correct/present to absent
        if (key.classList.contains('correct')) return;
        if (key.classList.contains('present') && state === 'absent') return;
        
        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(state);
    };
    
    // Show message
    const showMessage = (text, duration = 2000) => {
        message.textContent = text;
        message.classList.add('show');
        
        setTimeout(() => {
            message.classList.remove('show');
        }, duration);
    };
    
    // Show modal
    const showModal = (type) => {
        let modal;
        if (type === 'help') {
            modal = helpModal;
        } else if (type === 'stats') {
            modal = statsModal;
        }
        
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    };
    
    // Hide modal
    const hideModal = (type) => {
        let modal;
        if (type === 'help') {
            modal = helpModal;
        } else if (type === 'stats') {
            modal = statsModal;
        }
        
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    };
    
    // Update statistics display
    const updateStats = (stats) => {
        document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
        document.getElementById('winPercentage').textContent = stats.winPercentage;
        document.getElementById('currentStreak').textContent = stats.currentStreak;
        document.getElementById('maxStreak').textContent = stats.maxStreak;
        
        // Update guess distribution
        const distContainer = document.getElementById('guessDistribution');
        distContainer.innerHTML = '';
        
        const maxGuesses = Math.max(...Object.values(stats.guessDistribution), 1);
        
        for (let i = 1; i <= 6; i++) {
            const count = stats.guessDistribution[i] || 0;
            const percentage = maxGuesses > 0 ? (count / maxGuesses) * 100 : 0;
            
            const row = document.createElement('div');
            row.className = 'dist-row';
            
            const label = document.createElement('div');
            label.className = 'dist-label';
            label.textContent = i;
            
            const bar = document.createElement('div');
            bar.className = 'dist-bar';
            bar.textContent = count;
            bar.style.width = `${Math.max(percentage, 5)}%`;
            
            if (stats.lastWin === i) {
                bar.classList.add('highlight');
            }
            
            row.appendChild(label);
            row.appendChild(bar);
            distContainer.appendChild(row);
        }
    };
    
    // Clear board
    const clearBoard = () => {
        const tiles = gameBoard.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.className = 'tile';
        });
        
        const keys = keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
    };
    
    // Public API
    return {
        init,
        setKeyPressCallback,
        updateTile,
        revealTile,
        shakeRow,
        bounceRow,
        updateKeyState,
        showMessage,
        showModal,
        hideModal,
        updateStats,
        clearBoard
    };
})();
