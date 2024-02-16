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
  updateKeyElement,
  displayUnpermittedWordToast,
  getWord,
} from "./utils.js";

let guessNumber = 1;
let guessLetterNumber = 1;
let currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);
const WORD_TO_GUESS = getWord();

const canDeleteLetter = () => guessLetterNumber > 1;
const canEnterGuess = () => guessLetterNumber > 5;
const canAddLetter = () => guessLetterNumber <= 5;

ALPHABET.split("").forEach((letter) => {
  const keyboardLetterElement = document.getElementById(letter.toUpperCase());
  keyboardLetterElement.addEventListener("click", () => {
    handleLetterSelect(letter);
  });
});
document.addEventListener("keydown", (event) => handleLetterSelect(event.key));
document.getElementById(ENTER_KEY).addEventListener("click", () => {
  if (canEnterGuess()) {
    handleGuess();
  }
});
document.getElementById(DELETE_KEY).addEventListener("click", () => {
  if (guessLetterNumber > 1) {
    deleteLatestLetter();
  }
});

const deleteLatestLetter = () => {
  const tile = currentGuessRowElement.querySelector(
    `div:nth-child(${guessLetterNumber - 1})`
  );
  tile.innerHTML = "";
  tile.classList.remove("letter-added");
  guessLetterNumber--;
};

const addLetterToGuess = (letter) => {
  const tile = currentGuessRowElement.querySelector(
    `div:nth-child(${guessLetterNumber})`
  );
  tile.textContent = letter.toUpperCase();
  tile.classList.add("letter-added");
  guessLetterNumber++;
};

const handleLetterSelect = (letter) => {
  if (canEnterGuess() && letter === ENTER) {
    handleGuess();
    return;
  }

  if (canDeleteLetter() && letter === BACKSPACE) {
    deleteLatestLetter();
    return;
  }

  if (canAddLetter() && letter.match(/^[a-zA-Z]$/)) {
    addLetterToGuess(letter.toLowerCase());
    return;
  }
};

const handleGuess = () => {
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
    updateKeyElement(el, correct, correctPos);
  }

  for (const { letter, correct, correctPos } of guessStatus) {
    const el = document.getElementById(letter);
    updateKeyElement(el, correct, correctPos);
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
