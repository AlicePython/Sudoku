import copy,numpy,random

'''print('SUDOKU SOLVER')
print('Type the sudoku you wish to solve row by row, write numbers separated by a space and write 0 for empty cells.\nExample: 1 2 3 4 5 0 0 0 9')
row1 = [int(n) for n in input('Row 1: ').split(sep=' ')]
row2 = [int(n) for n in input('Row 2: ').split(sep=' ')]
row3 = [int(n) for n in input('Row 3: ').split(sep=' ')]
row4 = [int(n) for n in input('Row 4: ').split(sep=' ')]
row5 = [int(n) for n in input('Row 5: ').split(sep=' ')]
row6 = [int(n) for n in input('Row 6: ').split(sep=' ')]
row7 = [int(n) for n in input('Row 7: ').split(sep=' ')]
row8 = [int(n) for n in input('Row 8: ').split(sep=' ')]
row9 = [int(n) for n in input('Row 9: ').split(sep=' ')]
unsolved = [row1,row2,row3,row4,row5,row6,row7,row8,row9]'''

def valid_state(sudoku:list) -> bool : # if len decreases -> duplicates were eliminated in set
    for row in sudoku : # rows
        row = [n for n in row if n!=0]
        if len(set(row)) < len(row) :
            return False
    for c in range(0,9) : # columns
        col = [row[c] for row in sudoku if row[c]!=0]
        if len(set(col)) < len(col) :
            return False
    for i in range(0,3) : # squares
        for j in range(0,3) :
            square = [sudoku[x+i*2][y+j*2] for x in range(1,4) for y in range(1,4) if sudoku[x+i*2][y+j*2]!=0]
            if len(set(square)) < len(square) :
                return False
    return True

def solved(sudoku:list) -> bool : # assumes that sudoku is in a valid state
    for row in sudoku :
        for n in row :
            if n == 0 :
                return False
    return True

def get_square(sudoku:list,i:int,j:int) -> list :
    if i < 3 :
        xs = [0,1,2]
    elif i > 5 :
        xs = [6,7,8]
    else :
        xs = [3,4,5]
    if j < 3 :
        js = [0,1,2]
    elif j > 5 :
        js = [6,7,8]
    else :
        js = [3,4,5]

    return [sudoku[x][y] for x in xs for y in js]

def generate_guesses(sudoku:list,i:int,j:int) -> list :
    guesses = [1,2,3,4,5,6,7,8,9]
    row = sudoku[i]
    column = [sudoku[r][j] for r in range(0,9)]
    square = get_square(sudoku,i,j)
    for n in set(row+column+square) :
        if n in guesses :
            guesses.remove(n)
    return guesses

def safe_moves(sudoku:list) -> list :
    for i in range(0,9) :
        for j in range(0,9) :
            if sudoku[i][j] == 0 :
                guesses = generate_guesses(sudoku,i,j)
                if len(guesses) == 1 :
                    sudoku[i][j] = guesses[0]
    return sudoku

def solve(sudoku:list) -> list :
    while solved(sudoku) != True :
        new_sudoku = safe_moves(sudoku)
        while new_sudoku != sudoku : # safe moves loop
            sudoku = new_sudoku
            new_sudoku = safe_moves(sudoku)
        # try a random guess and see if it is a dead end
        for i in range(0,9) :
            for j in range(0,9) :
                if sudoku[i][j] == 0 :
                    guesses = generate_guesses(sudoku,i,j)
                    if guesses == [] :
                        return None
                    for g in guesses :
                        alt_sudoku = copy.deepcopy(sudoku)
                        alt_sudoku[i][j] = g
                        sol = solve(alt_sudoku)
                        if sol != None :
                            return sol
                        else : # dead end
                            continue
    return sudoku

def generate_full_board() -> list :
    board = [[0 for _ in range(9)] for _ in range(9)]
    square1 = random.sample(range(1, 10), 9)
    square2 = random.sample(range(1, 10), 9)
    square3 = random.sample(range(1, 10), 9)
    for i in range(0,3) :
        for j in range(0,3) :
            board[i][j] = square1[0]
            square1 = square1[1:]
    for i in range(3,6) :
        for j in range(3,6) :
            board[i][j] = square2[0]
            square2 = square2[1:]
    for i in range(6,9) :
        for j in range(6,9) :
            board[i][j] = square3[0]
            square3 = square3[1:]
    return solve(board)

def generate_sudoku_puzzle(holes:int) :
    board = generate_full_board()
    hole_coords = []
    while len(hole_coords) < holes :
        new_hole = random.randint(0,8),random.randint(0,8)
        while new_hole in hole_coords :
            new_hole = random.randint(0,8),random.randint(0,8)
        hole_coords.append(new_hole)
    for hc in hole_coords :
        board[hc[0]][hc[1]] = 0
    return board
        
        
puzzle = generate_sudoku_puzzle(30)
print(numpy.matrix(solve(puzzle)))
#print(numpy.matrix(solve(sudoku=generate_full_board())))