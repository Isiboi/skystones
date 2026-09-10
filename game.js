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

function computerTurn() {
    if (gameOver === true) { return; };
    let decision = computerDecisionsZero();
    if (computerDifficultyLevel == 1) {
        decision = computerDecisionsOne();
    }
    playCard(decision[0], decision[1], enemyHand);
    renderHand(enemyHand, "#enemy-hand", "enemy");
    flipTurn();
}

function computerDecisionsZero() {
    const emptyTiles = getEmptyTiles();
    const chosenIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const randomCardIndex = Math.floor(Math.random() * enemyHand.length);
    return [randomCardIndex, chosenIndex];
}

function computerDecisionsOne() {
    const emptyTiles = getEmptyTiles();
    const chosenIndex = 0;
    const randomCardIndex = 0;
    return [randomCardIndex, chosenIndex];
}

function playCard(card, gamePos, hand) {
    gameBoard[gamePos] = hand[card];
    hand.splice(card, 1);
    attackNeighbors(gamePos);
    renderGamefield(gameBoard, "#game-field");
    if (getEmptyTiles().length === 0) { gameOver = true; }
}

function getEmptyTiles() {
    const emptyIndex = [];
    gameBoard.forEach((tile, index) => { if (tile === null) emptyIndex.push(index); });
    return emptyIndex;
}


function getNeighbors(index) {
    let neighbors = {};
    if (index > 2) { neighbors['top'] = index - 3; };
    if (index < 6) { neighbors['bottom'] = index + 3; };
    if (index % 3 != 0) { neighbors['left'] = index - 1; };
    if ((index + 1) % 3 != 0) { neighbors['right'] = index + 1; }
    return neighbors;
}

function attackNeighbors(cardIndex) {
    const opposite = {
        top: "bottom",
        left: "right",
        right: "left",
        bottom: "top",
    }
    const neighbors = getNeighbors(cardIndex);

    Object.keys(neighbors).forEach(function (keyName) {
        if (gameBoard[neighbors[keyName]] != null
            && gameBoard[neighbors[keyName]].owner !== gameBoard[cardIndex].owner
            && gameBoard[cardIndex][keyName] > gameBoard[neighbors[keyName]][opposite[keyName]]) {
            console.log(`${gameBoard[cardIndex].owner} has taken a card from ${gameBoard[neighbors[keyName]].owner}`)
            gameBoard[neighbors[keyName]].owner = gameBoard[cardIndex].owner;
        }
    });
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