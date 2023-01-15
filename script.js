const shapes = ["squiggle", "oval", "diamond"];
const patterns = ["solid", "shaded", "empty"];
const colors = ["green", "purple", "red"];
const numbers = ["1", "2", "3"];
const cards = {};
let usedCards = [];
let cardsInDeck = [];
let cardsOnScreen = [];
let numCards = 12;
let index = 0;

class Card {
  constructor(shape, pattern, color, number, id) {
    this.shape = shape;
    this.pattern = pattern;
    this.color = color;
    this.number = number;
    this.id = id;
    this.imgString = `url('img/set/${this.shape}-${this.color}-${this.pattern}.svg')`;
  }
}

function replaceSet(cards) {
  cardsOnScreen.sort((a,b) => a - b);
  let cardArray = [...cards];
  let setIndices = [];
  cardArray.forEach((elem) => {
    let removeIndex = cardsOnScreen.indexOf(parseInt(elem.id.match(/\d+/)));
    cardsOnScreen.splice(removeIndex,1);
    if (elem.id.match(/13|14|15/)) {
      elem.style.display = 'none';
    } else {
      setIndices.push(parseInt(elem.id.match(/\d+/)));
    }
  })
  for (elem of document.querySelectorAll('.card')) {
    elem.classList.remove('selected');
    elem.classList.remove('hint');
  }
  updateGame(setIndices);
}

function createGameDeck() {
  for (let i = 0; i < 81; i++) {
    cardsInDeck.push(i);
  }
}

function buildDeck() {
  for (let shape of shapes) {
    for (let pattern of patterns) {
      for (let color of colors) {
        for (let number of numbers) {
          const newCard = new Card(shape, pattern, color, number, index);
          cards[`${shape}-${pattern}-${color}-${number}`] = newCard;
          index++;
        }
      }
    }
  }
}

function createCard(card, pos) {
  const newCard = document.getElementById(`card-${pos}`);
  newCard.classList.remove('back');
  newCard.setAttribute('data-number', card.number);
  newCard.setAttribute('data-id', card.id);
  newCard.setAttribute('data-pattern', card.pattern);
  newCard.setAttribute('data-color', card.color);
  newCard.setAttribute('data-shape', card.shape);
  newCard.replaceChildren();
  for (let i = 0; i < 3; i++) {
    const newSymbol = document.createElement('div');
    newSymbol.className = "symbol";
    newSymbol.style.backgroundImage = card.imgString;
    newCard.appendChild(newSymbol);
  }  
}

function runGame() {
  for (let cardPos = 1; cardPos < 13; cardPos++) {
    addCard(cardPos);
  }
  document.querySelector('#find-set').disabled = false;
}

function updateGame(positions) {
  for (let cardPos of positions) {
    addCard(cardPos);    
  }
  document.querySelector('#find-set').disabled = false;
}

function addCard(cardPos) {
  while (!cardsOnScreen.includes(cardPos)) {
    const seed = Math.floor(Math.random() * cardsInDeck.length);
    if (usedCards.includes(seed)) continue;
    usedCards.push(seed);
    createCard(cards[Object.keys(cards)[cardsInDeck[seed]]], cardPos);
    cardsOnScreen.push(cardPos);
    cardsOnScreen.sort((a,b) => a - b)
    cardsInDeck.splice(seed, 1);
  }
}

function checkForSet(cards) {
  let cardArray = [...cards];
  let shapes = cardArray.map(card => { return card.getAttribute('data-shape') })
  let colors = cardArray.map(card => { return card.getAttribute('data-color') })
  let patterns = cardArray.map(card => { return card.getAttribute('data-pattern') })
  let numbers = cardArray.map(card => { return card.getAttribute('data-number') })
  return sameOrDiff(...shapes) && sameOrDiff(...colors) && sameOrDiff(...patterns) && sameOrDiff(...numbers);
}

function sameOrDiff(a,b,c) {
  return (a === b && a === c) || !(a == b || a == c || b == c)
}

function restart() {
  usedCards = [];
  cardsInDeck = [];
  cardsOnScreen = [];
  let curCards = [...document.getElementsByClassName('card')]
  curCards.forEach((card) => {
    card.classList.remove('selected');
    card.classList.remove('hint');
    card.classList.add('back');
    card.replaceChildren();
  })
  document.querySelector('#set-message').innerText = "";
  document.querySelector('#find-set').disabled = true;
  document.querySelector('#start').disabled = false;
  document.querySelector('.extra-cards').style.display = 'none';
  document.querySelector('.extra-cards.extra').style.display = 'none';
}

function findSet() {
  let setMessage = document.getElementById('set-message');
  let currentCards = document.querySelectorAll('.card.base');
  let cardArray = [...currentCards].filter((elem) => elem.getAttribute('data-pattern') !== "");
  let sets = [];
  for (let i = 0; i < currentCards.length; i++) {
    for (let j = i+1; j < currentCards.length; j++) {
      for (let k = j+1; k < currentCards.length; k++) {
        if (checkForSet([cardArray[i], cardArray[j], cardArray[k]])) {
          sets.push([i,j,k]);
        }
      }
    }
  }
  if (!sets.length) {
    setMessage.innerText = "No possible sets!";
    setMessage.style.color = "gray";
    setMessage.style.visibility = 'visible';
    updateGame([13,14,15]);
    document.querySelector('.extra-cards').style.display = 'flex';
  } else {
    setMessage.innerText = sets.length > 1 ? `${sets.length} possible sets! Here's one.` : `One possible set. Here it is.`;
    setMessage.style.color = "gray";
    highlightSets = [cardArray[sets[0][0]], cardArray[sets[0][1]], cardArray[sets[0][2]]]
    highlightSets.forEach(card => { card.classList.add('hint') });
    setMessage.style.visibility = 'visible';
  }
}

document.addEventListener('click', (a) => {
  if (a.target.tagName === 'BUTTON') {
    switch (a.target.id) {
      case "start":
        if (a.target.disabled) break;
        buildDeck();
        createGameDeck();
        runGame();
        a.target.disabled = true;
        document.querySelector('#restart').disabled = false;
        break;
      case "restart":
        if (a.target.disabled) break;
        restart();
        a.target.disabled = true;
        document.querySelector('#start').disabled = false;
        break;
      case "find-set":
        findSet();
        document.querySelector('#set-message').style.visibility = "visible";
        a.target.disabled = true;
        break;
    }
    return;
  }
  
  if (a.target.className.includes('card') || a.target.className === 'symbol') {
    closestCard = a.target.closest('.card');
    closestCard.className.includes('selected') ? 
      closestCard.classList.remove('selected') :
      closestCard.classList.add('selected');
  }

  let setMessage = document.getElementById('set-message');
  let selectedCards = document.getElementsByClassName('selected');

  if (selectedCards.length === 3) {
    setMessage.style.visibility = 'visible';
    if (checkForSet(selectedCards)) {
      setMessage.innerText = 'Set!';
      setMessage.style.color = 'green';
      selectedCards = document.querySelectorAll('.selected')
      replaceSet(selectedCards);
    } else {
      setMessage.innerText = 'Not a set!'
      setMessage.style.color= 'red';
      
      for (elem of document.querySelectorAll('.selected')) {
        elem.classList.remove('selected');
      }

    }

  } else {
    setMessage.style.visibility = 'hidden';
  }
})