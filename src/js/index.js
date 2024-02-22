import permittedWords from "./permitted-words.js";
import {
  ALPHABET,
  DELETE_KEY,
  ENTER_KEY,
  ENTER,
  BACKSPACE,
  GREEN,
} from "./constants.js";
import {
  // updateKeyElement,
  displayUnpermittedWordToast,
  getWord,
} from "./utils.js";

let guessNumber = 1;
let guessLetterNumber = 1;
let currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);
const gameState = {
  GUESS_NUMBER: 1,
  GUESS_LETTER_NUMBER: 1,
  CURRENT_GUESS_ROW_ELEMENT: document.getElementById(`tile-row-1`),
};

const WORD_TO_GUESS = getWord();

const canDeleteLetter = () => gameState.GUESS_LETTER_NUMBER > 1;
const canEnterGuess = () => gameState.GUESS_LETTER_NUMBER > 5;
const canAddLetter = () => gameState.GUESS_LETTER_NUMBER <= 5;

[...ALPHABET, ENTER, BACKSPACE].forEach((key) => {
  const keyboardElement = document.getElementById(key);
  keyboardElement.addEventListener("click", () => handleLetterSelect(key));
});
document.addEventListener("keydown", ({ key }) => handleLetterSelect(key));

const getCurrentTile = () => {
  const row = document.getElementById(`tile-row-${gameState.GUESS_NUMBER}`);
  const tile = row.querySelector(
    `div:nth-child(${gameState.GUESS_LETTER_NUMBER})`
  );
  return tile;
};

const deleteLatestLetter = () => {
  gameState.GUESS_LETTER_NUMBER - 1;
  const tile = getCurrentTile();
  tile.innerHTML = "";
  tile.classList.remove("letter-added");
};

const addLetterToGuess = (letter) => {
  if (!canAddLetter()) return;
  const tile = getCurrentTile();
  tile.textContent = letter.toUpperCase();
  tile.classList.add("letter-added");
  gameState.GUESS_LETTER_NUMBER++;
};

const handleLetterSelect = (letter) => {
  if (letter === ENTER) {
    handleGuess();
    return;
  }

  if (letter === BACKSPACE && canDeleteLetter()) {
    deleteLatestLetter();
    return;
  }

  if (letter.match(/^[a-zA-Z]$/)) {
    addLetterToGuess(letter.toLowerCase());
    return;
  }
};

const handleGuess = () => {
  if (!canEnterGuess()) return;

  const letterElements = Array.from(currentGuessRowElement.children);
  const playerGuessWord = letterElements
    .map((letterElement) => letterElement.textContent)
    .join("");

  const wordExists = doesWordExist(playerGuessWord);

  if (!wordExists) {
    displayUnpermittedWordToast();
    return;
  }

  const isCorrectGuess = playerGuessWord === WORD_TO_GUESS;

  if (isCorrectGuess) {
    for (const el of letterElements) {
      el.classList.remove("letter-added");
      el.style.border = "none";
      el.style.backgroundColor = GREEN;
    }

    for (const letter of WORD_TO_GUESS.split("")) {
      const el = document.getElementById(letter);
      el.style.backgroundColor = GREEN;
    }

    setTimeout(() => alert("You win!"), 10);
    return;
  }
  const guessStatus = checkGuess(playerGuessWord);

  for (const [index, el] of letterElements.entries()) {
    const { correct, correctPos } = guessStatus[index];
    // updateKeyElement(el, correct, correctPos);
  }

  for (const { letter, correct, correctPos } of guessStatus) {
    const el = document.getElementById(letter);
    // updateKeyElement(el, correct, correctPos);
  }

  guessLetterNumber = 1;
  guessNumber++;
  currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);
};

const doesWordExist = (word) => {
  return permittedWords.indexOf(word) !== -1;
};

const checkGuess = (guess) => {
  const guessLetters = guess.split("");
  const wordToGuessLetters = WORD_TO_GUESS.split("");

  const playerGuessStatus = guessLetters.map((letter) => ({
    letter,
    correct: false,
    correctPos: false,
  }));

  const wordToGuessLettersLeftToCheck = guessLetters.map((letter, index) => {
    if (letter === wordToGuessLetters[index]) {
      playerGuessStatus[index].correctPos = true;
      return null;
    }
    return wordToGuessLetters[index];
  });

  for (const [index, letter] of guessLetters.entries()) {
    if (playerGuessStatus[index].correctPos) {
      continue;
    }
    if (wordToGuessLettersLeftToCheck.includes(letter)) {
      playerGuessStatus[index].correct = true;
    }
  }
  return playerGuessStatus;
};

const proxyFor = (obj, handler) => new Proxy(obj, handler);

const gameStateProxy = proxyFor(gameState, {
  set: (obj, prop, value) => {
    if (prop === "GUESS_LETTER_NUMBER") {
      const tile = obj.CURRENT_GUESS_ROW_ELEMENT.querySelector(
        `div:nth-child(${value})`
      );
      tile.innerHTML = letter;
      tile.classList.add(type);
    }
    return true;
  },
});

class GameObject extends EventTarget {
  constructor() {
    super();
  }

  get score() {
    return this._score;
  }

  set score(value) {
    this._score = value;
    this.dispatchEvent(new CustomEvent("scoreChange", { detail: value }));
  }
}
