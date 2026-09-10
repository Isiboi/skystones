let playerHand = [];
let enemyHand = [];
let gameBoard = [];
let choosenCard = null;
let currentTurn = "e";
let gameOver = false;
let computerDifficultyLevel = 1;

function generateHand(whoOwnsIt) {
    let newHand = [];
    for (let i = 0; i < 5; i++) {
        const template = card_database[Math.floor(Math.random() * card_database.length)];
        const card = { ...template, owner: whoOwnsIt };
        newHand.push(card);
    };
    console.log(newHand);
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

/* Ritar kort handen */
function renderHand(arr, conSelect, target) {
    const container = document.querySelector(conSelect);
    container.innerHTML = "";

    if (target === "player") {
        arr.forEach(function (card, index) {
            const box = document.createElement('div');
            box.className = `hand-box color-${card.owner}`;
            box.innerHTML = renderCard(card);
            box.addEventListener('click', function () { selectCard(box, index); });
            container.appendChild(box);
        });
    } else if (target === "enemy") {
        arr.forEach(function (card, index) {
            const box = document.createElement('div');
            box.className = `hand-box color-${card.owner}`;
            container.appendChild(box);
        });
    }

}

function renderGamefield(arr, conSelect) {
    const container = document.querySelector(conSelect);
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
    if (currentTurn === "e") { return; }
    if (choosenCard === arrIndex) { element.classList.remove('selected'); choosenCard = null; return; }
    document.querySelectorAll('#player-hand .hand-box').forEach(box => box.classList.remove('selected'));
    element.classList.add('selected');
    choosenCard = arrIndex;
}

function selectBox(arrIndex) {
    if (currentTurn !== "p") { return; }; if (choosenCard === null) { return; }; if (!getEmptyTiles().includes(arrIndex)) { return; }; if (gameOver === true) { return; };
    playCard(choosenCard, arrIndex, playerHand);
    choosenCard = null;
    renderHand(playerHand, "#player-hand", "player");
    flipTurn();
}

function flipTurn() {
    currentTurn = (currentTurn === "p") ? "e" : "p";
    if (currentTurn === "e") { computerTurn(); }
}

function playCard(cardIndex, tileIndex, hand) {
    let cardsDefeatedIndexes = targetNeighbors(hand[cardIndex], tileIndex);
    for (let i = 0; i < cardsDefeatedIndexes.length; i++) { gameBoard[cardsDefeatedIndexes[i]].owner = hand[cardIndex].owner; }
    gameBoard[tileIndex] = hand[cardIndex];
    hand.splice(cardIndex, 1);
    renderGamefield(gameBoard, "#game-field");
    if (getEmptyTiles().length === 0) { gameOver = true; }
}

function getEmptyTiles() {
    const emptyIndex = [];
    gameBoard.forEach((tile, index) => { if (tile === null) emptyIndex.push(index); });
    return emptyIndex;
}

function computerTurn() {
    if (gameOver === true) { return; };
    let decision = {};
    if (computerDifficultyLevel == 0) {
        decision = computerDecisionsZero();
    }
    else if (computerDifficultyLevel == 1) {
        decision = computerDecisionsOne(computerDecisionsZero());
    }
    playCard(decision.cardIndex, decision.tileIndex, enemyHand);
    renderHand(enemyHand, "#enemy-hand", "enemy");
    flipTurn();
}

function computerDecisionsZero() {
    let randomMove = {};
    randomMove.cardIndex = Math.floor(Math.random() * enemyHand.length);
    const emptyTiles = getEmptyTiles();
    randomMove.tileIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    randomMove.flips = 0;
    return randomMove;
}

function computerDecisionsOne(defaultPick) {
    const emptyTiles = getEmptyTiles();
    let bestMove = defaultPick;

    enemyHand.forEach((card, cardIndex) => {
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
        if (gameBoard[neighbors[atkDir]] != null
            && gameBoard[neighbors[atkDir]].owner !== card.owner
            && card[atkDir] > gameBoard[neighbors[atkDir]][opposite[atkDir]]) {
            cardsDeafetedIndexes.push(neighbors[atkDir]);
        }


    });
    return cardsDeafetedIndexes;
}

function matchStart() {
    playerHand = generateHand("p");
    renderHand(playerHand, "#player-hand", "player");
    enemyHand = generateHand("e");
    renderHand(enemyHand, "#enemy-hand", "enemy");
    for (let i = 0; i < 9; i++) { gameBoard.push(null); }
    renderGamefield(gameBoard, "#game-field");
    computerTurn();
}

matchStart();