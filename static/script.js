// Default global variable for highlight color
var highlight_color = localStorage.getItem('highlight_color') || '#FFF380'; // Initialize from localStorage or default value
localStorage.setItem('highlight_color', highlight_color);

//Global color dictionary
let color_dict = {
    yellow: '#FFF380',
    orange: '#FF7900',
    red: '#F67280',
    green: '#54C571',
    blue: '#82CAFF',
    indigo: '#4B0082',
    purple: '#6F2DA8',
    lilac: '#B666D2',
    pink: '#FFC0CB'
};

function ChangeColor(color_choice) {
    highlight_color = color_dict[color_choice];
    localStorage.setItem('highlight_color', highlight_color);
}

function validateInput(input) {
    // Only allow digits 1-9
    input.value = input.value.replace(/[^1-9]/g, '');
}

function submitValues() {
    const inputs = document.querySelectorAll('input');
    let values = [];
    inputs.forEach(input => values.push(input.value || ''));
    const params = new URLSearchParams();
    params.set('sudoku', values.join(','));
    window.location.href = 'solution.html?' + params.toString();
}

function valid_state(sudoku) {
    sudoku = sudoku.flat()
    // Check rows
    for (let r = 0; r < 9; r++) {
        let row = sudoku.slice(r * 9, (r + 1) * 9).filter(n => n !== 0);
        if (new Set(row).size < row.length) {
            return false;
        }
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
        let col = [];
        for (let r = 0; r < 9; r++) {
            if (sudoku[r * 9 + c] !== 0) {
                col.push(sudoku[r * 9 + c]);
            }
        }
        if (new Set(col).size < col.length) {
            return false;
        }
    }

    // Check 3x3 squares
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let square = [];
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    let value = sudoku[(i * 3 + x) * 9 + (j * 3 + y)];
                    if (value !== 0) {
                        square.push(value);
                    }
                }
            }
            if (new Set(square).size < square.length) {
                return false;
            }
        }
    }
    return true;
}

function solved(sudoku) {
    for (let row of sudoku) {
        for (let n of row) {
            if (n === 0) {
                return false;
            }
        }
    }
    return true;
}

function get_square(sudoku, i, j) {
    let xs, js;
    if (i < 3) {
        xs = [0, 1, 2];
    } else if (i > 5) {
        xs = [6, 7, 8];
    } else {
        xs = [3, 4, 5];
    }
    if (j < 3) {
        js = [0, 1, 2];
    } else if (j > 5) {
        js = [6, 7, 8];
    } else {
        js = [3, 4, 5];
    }

    let square = [];
    for (let x of xs) {
        for (let y of js) {
            square.push(sudoku[x][y]);
        }
    }
    return square;
}

function generate_guesses(sudoku, i, j) {
    let guesses = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let row = sudoku[i];
    let column = sudoku.map(row => row[j]);
    let square = get_square(sudoku, i, j);
    let combined = new Set([...row, ...column, ...square]);
    for (let n of combined) {
        guesses = guesses.filter(num => num !== n);
    }
    return guesses;
}

function safe_moves(sudoku) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudoku[i][j] === 0) {
                let guesses = generate_guesses(sudoku, i, j);
                if (guesses.length === 1) {
                    sudoku[i][j] = guesses[0];
                }
            }
        }
    }
    return sudoku;
}

function get_solution(sudoku) {
    if (valid_state(sudoku) === false) {
        return false
    }
    while (!solved(sudoku)) {
        let new_sudoku = safe_moves(sudoku);
        while (JSON.stringify(new_sudoku) !== JSON.stringify(sudoku)) {
            sudoku = new_sudoku.map(row => [...row]);
            new_sudoku = safe_moves(sudoku);
        }
        // Try a random guess and see if it is a dead end
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (sudoku[i][j] === 0) {
                    let guesses = generate_guesses(sudoku, i, j);
                    if (guesses.length === 0) {
                        return null;
                    }
                    for (let g of guesses) {
                        let alt_sudoku = JSON.parse(JSON.stringify(sudoku));
                        alt_sudoku[i][j] = g;
                        let sol = get_solution(alt_sudoku);
                        if (sol !== null) {
                            return sol;
                        }
                    }
                    return null; // dead end
                }
            }
        }
    }
    return sudoku
}

function shuffleArray(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFullBoard() {
    let board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

    let square1 = shuffleArray([...Array(9).keys()].map(x => x + 1));
    let square2 = shuffleArray([...Array(9).keys()].map(x => x + 1));
    let square3 = shuffleArray([...Array(9).keys()].map(x => x + 1));

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[i][j] = square1.shift();
        }
    }
    for (let i = 3; i < 6; i++) {
        for (let j = 3; j < 6; j++) {
            board[i][j] = square2.shift();
        }
    }
    for (let i = 6; i < 9; i++) {
        for (let j = 6; j < 9; j++) {
            board[i][j] = square3.shift();
        }
    }
    return get_solution(board)
}

function generatePuzzle(level) {
    if (level === 'Easy') {
        holes = getRandomInt(36, 45)
    }
    else if (level === 'Intermediate') {
        holes = getRandomInt(46, 54)
    }
    else {
        holes = getRandomInt(55, 64)
    }
    let board = generateFullBoard();
    let holeCoords = [];
    while (holeCoords.length < holes) {
        let newHole = [getRandomInt(0, 8), getRandomInt(0, 8)];
        while (holeCoords.some(coord => coord[0] === newHole[0] && coord[1] === newHole[1])) {
            newHole = [getRandomInt(0, 8), getRandomInt(0, 8)];
        }
        holeCoords.push(newHole);
    }
    holeCoords.forEach(coord => {
        board[coord[0]][coord[1]] = 0;
    });
    return board.flat();
}

function fillPuzzle(level) {
    const params = generatePuzzle(level);
    params.forEach((value, index) => {
        const cell = document.getElementById(`cell-${index}`);
        if (cell && value !== 0) {
            cell.value = value;
            cell.setAttribute('readonly', 'true');
            cell.style = "font-weight: bold";
        }
    });
    }

function clearTable() {
    let inputs = document.querySelectorAll('#Table input');
    inputs.forEach(function (input) {
        input.value = ''; // Clear the value of each input field
    });
}

function clearColors() {
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        const input = cell.querySelector('input');
        input.style.backgroundColor = 'white'
        });
}

function EasyPuzzle() {
    window.location.href = 'puzzle.html?level=Easy'
}
    
function IntermediatePuzzle() {
    window.location.href = 'puzzle.html?level=Intermediate'
}

function HardPuzzle() {
    window.location.href = 'puzzle.html?level=Hard'
}

function Solver() {
    window.location.href = 'solver.html'
}

function Settings() {
    window.location.href = 'settings.html'
}

function Home() {
    highlight_color = localStorage.getItem('highlight_color');
    localStorage.clear();
    localStorage.setItem('highlight_color',highlight_color);
    window.location.href = 'index.html'
}

function Settings() {
    window.location.href = 'settings.html'
}

function get_unsolved() {
    let params = new URLSearchParams(window.location.search);
    let sudokuParam = params.get('sudoku'); // Retrieve the encoded sudoku parameter
    let sudoku = [];

    if (sudokuParam) {
        let values = sudokuParam.split(','); // Split the parameter into individual values

        // Check if we have exactly 81 values (assuming a standard 9x9 Sudoku grid)
        if (values.includes('')) {
            for (let i = 0; i < 9; i++) {
                let row = [];
                for (let j = 0; j < 9; j++) {
                    let value = parseInt(values[i * 9 + j], 10);
                    if (!isNaN(value) && value >= 0 && value <= 9) {
                        row.push(value);
                    } else {
                        row.push(0); // Default to 0 for invalid or missing values
                    }
                }
                sudoku.push(row);
            }
        } else {
            console.error('Invalid number of values in sudoku parameter.');
        }
    } else {
        console.error('Sudoku parameter not found in URL.');
    }
    return sudoku;
}

function populateValues() {
    const params = get_solution(sudoku=get_unsolved()).flat();
    if (params !== null && params !== false) {
        params.forEach((value, index) => {
            const cell = document.getElementById(`cell-${index}`);
            if (cell) {
                cell.value = value;
                cell.setAttribute('readonly', 'true');
            }
        });
    }
    else if (params === false) {
        let params = Array(28).fill('').concat(['I','N','V','A','L','I','D'],Array(12).fill(''),['I','N','P','U','T'],Array(29).fill(''))
        params.forEach((value, index) => {
            const cell = document.getElementById(`cell-${index}`);
            if (cell) {
                cell.value = value;
            }
        });
    }
    else {
        let params = Array(30).fill('').concat(['N','O','T'], Array(12).fill(''), ['S','O','L','V','A','B','L','E','!'], Array(27).fill(''))
        params.forEach((value, index) => {
            const cell = document.getElementById(`cell-${index}`);
            if (cell) {
                cell.value = value;
            }
        });
    }
    }

function ShowCheckButton() {
    const clear_colors = document.getElementById("clear_colors")
    const give_up = document.getElementById("give_up")
    clear_colors.style.display = 'none';
    give_up.style.display = 'none';
    if (document.getElementById("check_solution") === null) {
        let button_div = document.getElementById("button_div");
        let solution_button = document.createElement("button");
        solution_button.id = "check_solution";
        solution_button.className = "puzzlebutton";
        solution_button.title = "Check if your solution is valid";
        solution_button.onclick = checkSudoku;
        solution_button.innerText = "Did I do it right?";
        button_div.appendChild(solution_button)
    } else {
       const check = document.getElementById("check_solution")
        check.style.display = 'block'; 
    }   
}

function ShowRegularButtons() {
    const check = document.getElementById("check_solution")
    check.style.display = 'none';
    const clear_colors = document.getElementById("clear_colors")
    const give_up = document.getElementById("give_up")
    clear_colors.style.display = 'block';
    give_up.style.display = 'block';
    }

function ButtonHandler() {
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.addEventListener('input', function (event) {
            const cells = document.querySelectorAll('td');
            let filled = true;

            cells.forEach(cell => {
                const input = cell.querySelector('input');

                if (input) {
                    const value = parseInt(input.value);
                    if (isNaN(value)) {
                        filled = false;
                    }
                }
            });

            if (filled) {
                ShowCheckButton();
            } else if (document.getElementById("check_solution")) {
                ShowRegularButtons();
            }
        });
    }
)}

function HighlightCells() {
    highlight_color = localStorage.getItem('highlight_color');
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });
        cell.addEventListener('mousedown', function (event) {
            if (event.button === 2) {
                event.preventDefault();
            const input = cell.querySelector('input');
                
                if (event.shiftKey && input.value !== '') {
                    const number = input.value;
                    let highlight = false;

                    if (input.style.backgroundColor === '') {
                        highlight = true;
                    }

                    cells.forEach(cell => {
                        const cell_input = cell.querySelector('input');
                        if (cell_input.value === number) {
                            cell_input.style.backgroundColor = highlight ? highlight_color : '';
                        }
                    });

                } else {
                    if (input.style.backgroundColor === '') {
                        input.style.backgroundColor = highlight_color;
                    } else {
                        input.style.backgroundColor = '';
                    }
                }
            }
        });
    });
}

function GaveUp() {
    let message = document.getElementById("message");
    message.innerHTML = 'You gave up, here is the solution:';

    const clear_colors = document.getElementById("clear_colors");
    const give_up = document.getElementById("give_up");
    clear_colors.remove();
    give_up.remove();

    const cells = document.querySelectorAll('td');
    const inputs = document.querySelectorAll('input');

    let values = [];
    inputs.forEach(input => values.push(parseInt(input.value) || 0));

    let initial_values_flat = [];
    for (let i = 0; i < 81; i++) {
        const input = cells[i].querySelector('input');
        const cell = document.getElementById(`cell-${i}`);
        if (cell.style.fontWeight === 'bold') {
            initial_values_flat.push(parseInt(input.value) || 0);
        } else {
            initial_values_flat.push(0)
        }
    };
    const initial_values = [];
    for (let i = 0; i < initial_values_flat.length; i += 9) {
        initial_values.push(initial_values_flat.slice(i, i + 9));
    }

    solution = get_solution(initial_values).flat()

    for (let i = 0; i < 81; i++) {
        const input = cells[i].querySelector('input');
        const cell = document.getElementById(`cell-${i}`);
        if (initial_values_flat[i] === 0) {
            input.value = solution[i];
            cell.setAttribute('readonly', 'true');
            if (values[i] === solution[i]) {
                input.style.color = '#3EB489';
            } else {
                input.style.color = '#F67280';
            }      
        }
    };
}

function checkSudoku() {
    
    const inputs = document.querySelectorAll('input');
    let values = [];
    inputs.forEach(input => values.push(parseInt(input.value) || 0));
    if (valid_state(values) === true) {
        let message = document.getElementById("message");
        message.innerHTML = 'You correctly solved the sudoku puzzle!';
    } else {
        let message = document.getElementById("message");
        message.innerHTML = 'Your solution is incorrect.';
    }

    const check = document.getElementById("check_solution");
    check.remove();
    let button_div = document.getElementById("button_div");
    let home_button = document.createElement("button");
    home_button.id = "back_home";
    home_button.className = "puzzlebutton";
    home_button.title = "Go back to home page";
    home_button.onclick = Back_to_home;
    home_button.innerText = "Back to home";
    button_div.appendChild(home_button)
}
