document.addEventListener('DOMContentLoaded', init);

let selectedCell = null;
let board = Array(9).fill().map(() => Array(9).fill(0));
let solution = Array(9).fill().map(() => Array(9).fill(0));
let fixed = Array(9).fill().map(() => Array(9).fill(false));

function init() {
    createBoard();
    generateNewGame();
    setupEventListeners();
}

function createBoard() {
    const sudoku = document.getElementById('sudoku');
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            if ((i < 3 || i > 5) && (j < 3 || j > 5) || (i >= 3 && i <= 5) && (j >= 3 && j <= 5)) {
                cell.style.background = 'rgba(0, 0, 0, 0.98)';
            }
            sudoku.appendChild(cell);
        }
    }
}

function generateNewGame() {
    // Generate solution
    generateSolution();
    // Create puzzle by removing numbers
    createPuzzle();
    // Update display
    updateDisplay();
}

function generateSolution() {
    // Clear the board
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            solution[i][j] = 0;
        }
    }

    // Fill diagonals first
    for (let i = 0; i < 9; i += 3) {
        fillBox(i, i);
    }

    // Fill remaining
    solveSudoku(solution);

    // Copy solution to board
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            board[i][j] = solution[i][j];
        }
    }
}

function fillBox(row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeInBox(row, col, num));
            solution[row + i][col + j] = num;
        }
    }
}

function isSafeInBox(row, col, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (solution[row + i][col + j] === num) return false;
        }
    }
    return true;
}

function solveSudoku(grid) {
    let row = 0;
    let col = 0;
    let isEmpty = true;
    
    for (let i = 0; i < 81; i++) {
        row = Math.floor(i / 9);
        col = i % 9;
        
        if (grid[row][col] === 0) {
            isEmpty = false;
            break;
        }
    }
    
    if (isEmpty) return true;
    
    for (let num = 1; num <= 9; num++) {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
        }
    }
    return false;
}

function isSafe(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }
    
    // Check box
    let startRow = row - row % 3;
    let startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
        }
    }
    
    return true;
}

function createPuzzle() {
    // Reset fixed cells
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            fixed[i][j] = false;
        }
    }

    // Remove numbers to create puzzle
    let cellsToRemove = 45; // Adjust difficulty by changing this number
    while (cellsToRemove > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            cellsToRemove--;
        }
    }

    // Mark remaining numbers as fixed
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== 0) {
                fixed[i][j] = true;
            }
        }
    }
}

function updateDisplay() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const i = parseInt(cell.dataset.row);
        const j = parseInt(cell.dataset.col);
        cell.textContent = board[i][j] || '';
        cell.className = 'cell' + (fixed[i][j] ? ' fixed' : '') + (cell === selectedCell ? ' selected' : '');
    });
}

function setupEventListeners() {
    // Cell click
    document.getElementById('sudoku').addEventListener('click', (e) => {
        if (e.target.classList.contains('cell')) {
            if (selectedCell) selectedCell.classList.remove('selected');
            selectedCell = e.target;
            selectedCell.classList.add('selected');
        }
    });

    // Number input
    document.addEventListener('keydown', (e) => {
        if (selectedCell && !fixed[selectedCell.dataset.row][selectedCell.dataset.col]) {
            if (e.key >= '1' && e.key <= '9') {
                const row = parseInt(selectedCell.dataset.row);
                const col = parseInt(selectedCell.dataset.col);
                board[row][col] = parseInt(e.key);
                updateDisplay();
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                const row = parseInt(selectedCell.dataset.row);
                const col = parseInt(selectedCell.dataset.col);
                board[row][col] = 0;
                updateDisplay();
            }
        }
    });

    // Buttons
    document.getElementById('newGame').addEventListener('click', () => {
        generateNewGame();
    });

    document.getElementById('check').addEventListener('click', () => {
        checkSolution();
    });

    document.getElementById('solve').addEventListener('click', () => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                board[i][j] = solution[i][j];
            }
        }
        updateDisplay();
    });
}

function checkSolution() {
    let isComplete = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            if (board[i][j] === 0) {
                isComplete = false;
            } else if (board[i][j] !== solution[i][j]) {
                cell.classList.add('error');
                setTimeout(() => cell.classList.remove('error'), 1000);
                isComplete = false;
            }
        }
    }
    if (isComplete) {
        alert('Congratulations! You solved the puzzle!');
    }
}