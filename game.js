const difficulties = ["random", "greedy"];

const selectors = {
    player_hand: "player-hand",
    enemy_hand: "enemy-hand",
    game_board: "game-field",
    title_text: "main-text",
    difficulty: "difficulty-text",
    score_counter: "score-text",
    score_player: "score-player",
    score_enemy: "score-enemy",
    player_wins: "win-player",
};

const gameState = {
    playerHand: [],
    enemyHand: [],
    gameBoard: [],
    playerTurn: false,
    gameOver: true,
    choosenCard: null,
    difficulty: 0,
    playerWins: 0,
}

function generateHand(whoOwnsIt) {
    let newHand = [];
    for (let i = 0; i < 5; i++) {
        const template = card_database[Math.floor(Math.random() * card_database.length)];
        const card = { ...template, owner: whoOwnsIt };
        newHand.push(card);
    };
    return newHand;
}

function renderCard(card) {
    return `
            <p class="name">${card.name}</p>
            <p class="top">${card.top}</p>
            <p class="bottom">${card.bottom}</p>
            <p class="left">${card.left}</p>
            <p class="right">${card.right}</p>
        `;
}

function renderHand(arr, conSelect) {
    const container = document.getElementById(conSelect);
    container.innerHTML = "";

    if (arr === gameState.playerHand) {
        arr.forEach(function (card, index) {
            const box = document.createElement('div');
            box.className = `hand-box color-${card.owner}`;
            box.innerHTML = renderCard(card);
            box.addEventListener('click', function () { selectCard(box, index); });
            container.appendChild(box);
        });
    } else if (arr === gameState.enemyHand) {
        arr.forEach(function (card, index) {
            const box = document.createElement('div');
            box.className = `hand-box color-${card.owner}`;
            container.appendChild(box);
        });
    }
}

function renderGamefield(arr, conSelect) {
    const container = document.getElementById(conSelect);
    container.innerHTML = ''; // wipe it clean

    arr.forEach(function (card, index) {
        const box = document.createElement('div');
        box.className = 'field-box';
        if (card === null) { ; } else { box.innerHTML = renderCard(card); box.classList.add(`color-${card.owner}`) }

        box.addEventListener('click', function () { selectBox(index); });
        container.appendChild(box);
    });
}

function selectCard(element, arrIndex) {
    if (!gameState.playerTurn) { return; }
    if (gameState.choosenCard === arrIndex) { element.classList.remove('selected'); gameState.choosenCard = null; return; }
    document.querySelectorAll('#player-hand .hand-box').forEach(box => box.classList.remove('selected'));
    element.classList.add('selected');
    gameState.choosenCard = arrIndex;
}

function selectBox(arrIndex) {
    if (!gameState.playerTurn) { return; }; if (gameState.choosenCard === null) { return; }; if (!getEmptyTiles().includes(arrIndex)) { return; }; if (gameState.gameOver === true) { return; };
    flipTurn();
    playCard(gameState.choosenCard, arrIndex, gameState.playerHand);
    gameState.choosenCard = null;
    renderHand(gameState.playerHand, selectors.player_hand);

}

function flipTurn() {
    gameState.playerTurn = (gameState.playerTurn) ? false : true;
    if (!gameState.playerTurn) { setTimeout(function () { computerTurn(); }, 2000); }
}

function playCard(cardIndex, tileIndex, hand) {
    let cardsDefeatedIndexes = targetNeighbors(hand[cardIndex], tileIndex);
    gameState.gameBoard[tileIndex] = hand[cardIndex];
    hand.splice(cardIndex, 1);
    renderGamefield(gameState.gameBoard, selectors.game_board);
    let scores = calcScore();
    document.getElementById(selectors.score_player).innerHTML = scores.playerIndex.length;
    document.getElementById(selectors.score_enemy).innerHTML = scores.enemyIndex.length;

    for (let i = 0; i < cardsDefeatedIndexes.length; i++) { gameState.gameBoard[cardsDefeatedIndexes[i]].owner = gameState.gameBoard[tileIndex].owner; }
    setTimeout(function () {
        renderGamefield(gameState.gameBoard, selectors.game_board);
        scores = calcScore();
        document.getElementById(selectors.score_player).innerHTML = scores.playerIndex.length;
        document.getElementById(selectors.score_enemy).innerHTML = scores.enemyIndex.length;
    }, 300);
    if (getEmptyTiles().length === 0) { endGame(); }
}

function endGame() {
    gameState.gameOver = true;
    let score = calcScore();
    let didPlayerWin = score.playerIndex.length > score.enemyIndex.length;
    if (didPlayerWin) {
        document.getElementById(selectors.title_text).innerHTML = "You Won (click to restart)";
        gameState.playerWins++;
        document.getElementById(selectors.player_wins).innerHTML = gameState.playerWins;
    } else {
        document.getElementById(selectors.title_text).innerHTML = "You lost (click to restart)";
    }
}

function getEmptyTiles() {
    const emptyIndex = [];
    gameState.gameBoard.forEach((tile, index) => { if (tile === null) emptyIndex.push(index); });
    return emptyIndex;
}

function computerTurn() {
    if (gameState.gameOver === true) { return; };
    let decision = {};
    if (gameState.difficulty == 0) {
        decision = decisionRandom();
    }
    else if (gameState.difficulty == 1) {
        decision = decisionGreedy(decisionRandom());
    }
    playCard(decision.cardIndex, decision.tileIndex, gameState.enemyHand);
    setTimeout(function () { flipTurn();; }, 400);
}

function decisionRandom() {
    let randomMove = {};
    randomMove.cardIndex = Math.floor(Math.random() * gameState.enemyHand.length);
    const emptyTiles = getEmptyTiles();
    randomMove.tileIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    randomMove.flips = 0;
    return randomMove;
}

function decisionGreedy(defaultPick) {
    const emptyTiles = getEmptyTiles();
    let bestMove = defaultPick;

    gameState.enemyHand.forEach((card, cardIndex) => {
        emptyTiles.forEach((tileIndex) => {
            const flips = targetNeighbors(card, tileIndex).length;
            if (flips > bestMove.flips) {
                bestMove = { cardIndex, tileIndex, flips };
            }
        });
    });
    return bestMove;
}

function getNeighbors(index) {
    let neighbors = {};
    if (index > 2) { neighbors['top'] = index - 3; };
    if (index < 6) { neighbors['bottom'] = index + 3; };
    if (index % 3 != 0) { neighbors['left'] = index - 1; };
    if ((index + 1) % 3 != 0) { neighbors['right'] = index + 1; }
    return neighbors;
}

function targetNeighbors(card, tileIndex) {
    let cardsDeafetedIndexes = [];
    const opposite = {
        top: "bottom",
        left: "right",
        right: "left",
        bottom: "top",
    }
    const neighbors = getNeighbors(tileIndex);

    Object.keys(neighbors).forEach(function (atkDir) {
        if (gameState.gameBoard[neighbors[atkDir]] != null
            && gameState.gameBoard[neighbors[atkDir]].owner !== card.owner
            && card[atkDir] > gameState.gameBoard[neighbors[atkDir]][opposite[atkDir]]) {
            cardsDeafetedIndexes.push(neighbors[atkDir]);
        }
    });
    return cardsDeafetedIndexes;
}

function matchStart() {
    if (!gameState.gameOver) { return; }
    gameState.playerTurn = false;
    gameState.gameOver = false;
    gameState.playerHand = generateHand("p");
    renderHand(gameState.playerHand, selectors.player_hand);
    gameState.enemyHand = generateHand("e");
    gameState.gameBoard = [];
    for (let i = 0; i < 9; i++) { gameState.gameBoard.push(null); }
    renderGamefield(gameState.gameBoard, selectors.game_board);
    computerTurn();
    document.getElementById(selectors.title_text).innerHTML = ``
}

function difficultyIncrease() { if (gameState.difficulty + 1 < difficulties.length) { gameState.difficulty++; document.getElementById(selectors.difficulty).innerHTML = `Difficulty ${gameState.difficulty}`; } }
function difficultyDecrease() { if (gameState.difficulty > 0) { gameState.difficulty--; document.getElementById(selectors.difficulty).innerHTML = `Difficulty ${gameState.difficulty}`; } }

function calcScore() {
    const scoreIndex = { playerIndex: [], enemyIndex: [] }
    gameState.gameBoard.forEach(function (tile, index) { if (tile == null) { return; } if (tile.owner === "e") { scoreIndex.enemyIndex.push(index) } else if (tile.owner === "p") { scoreIndex.playerIndex.push(index) } })
    return scoreIndex;
}