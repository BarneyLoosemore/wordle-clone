/* Constants */
const WORDS_TO_GUESS = ["zesty", "yield", "forge", "greed", "liver", "sushi"];
const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const LETTERS = Object.fromEntries(
  ALPHABET.split("").map((letter) => [letter.toUpperCase(), {}])
);
const ENTER_KEY = "ENTER";
const DELETE_KEY = "DELETE";
const GREEN = "#006f45";
const YELLOW = "#da8821";
const RED = "#8b1e1e";

const WORD_TO_GUESS =
  WORDS_TO_GUESS[
    Math.floor(Math.random() * WORDS_TO_GUESS.length)
  ].toUpperCase();

/* Variables / game state */
let guessNumber = 1;
let guessLetterNumber = 1;
let currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);

/* Bind event listeners */
ALPHABET.split("").forEach((letter) => {
  const keyboardLetterElement = document.getElementById(letter.toUpperCase());
  keyboardLetterElement.addEventListener("click", () => {
    handleLetterSelect(letter);
  });
});

document.getElementById(ENTER_KEY).addEventListener("click", () => {
  if (guessLetterNumber > 5) {
    handleGuess();
  }
});

document.getElementById(DELETE_KEY).addEventListener("click", () => {
  if (guessLetterNumber > 1) {
    deleteLatestLetter();
  }
});

const deleteLatestLetter = () => {
  currentGuessRowElement.querySelector(
    `div:nth-child(${guessLetterNumber - 1})`
  ).innerHTML = "";
  guessLetterNumber--;
};

document.addEventListener("keydown", (event) => {
  const letter = event.key.toLowerCase();
  handleLetterSelect(letter);
});

/* Handler functions */
const handleLetterSelect = (letter) => {
  if (guessLetterNumber > 5 && letter === "enter") {
    handleGuess();
  }
  // Allow player to add letters if they are A-Z
  if (guessLetterNumber <= 5 && letter.match(/^[a-zA-Z]$/)) {
    currentGuessRowElement.querySelector(
      `div:nth-child(${guessLetterNumber})`
    ).textContent = letter.toUpperCase();
    guessLetterNumber++;
  }
  if (letter === "backspace" && guessLetterNumber > 1) {
    deleteLatestLetter();
  }
};

const handleGuess = async () => {
  const letterElements = Array.from(currentGuessRowElement.children);
  const guessWord = letterElements
    .map((letterElement) => letterElement.textContent)
    .join("");

  const wordExists = await doesWordExist(guessWord);

  // If word does not exist in dictionary, do nothing
  if (!wordExists) {
    alert("Word does not exist!");
    return;
  }

  // If the guess is correct, player wins!
  if (guessWord === WORD_TO_GUESS) {
    await letterElements.forEach((child) => {
      child.style.backgroundColor = GREEN;
      const letter = child.textContent;
      LETTERS[letter] = {
        used: true,
        correct: true,
        correctPos: true,
      };
    });
    await updateKeyboard();
    setTimeout(() => alert("You win!"), 0);
  }
  // Else, asses what letters the player got right/wrong
  // ⚠️ TODO: fix instance where guess has letter more than once, but answer only has it once ⚠️
  else {
    letterElements.forEach((child, index) => {
      const letter = child.textContent;

      if (letter === WORD_TO_GUESS[index]) {
        LETTERS[letter] = {
          used: true,
          correct: true,
          correctPos: true,
        };
        child.style.backgroundColor = GREEN;
      } else if (WORD_TO_GUESS.includes(letter)) {
        LETTERS[letter] = {
          used: true,
          correct: true,
          correctPos: false,
        };
        child.style.backgroundColor = YELLOW;
      } else {
        LETTERS[letter] = {
          used: true,
          correct: false,
          correctPos: false,
        };
        child.style.backgroundColor = RED;
      }
    });

    // If user guesses wrong, go to next guess row and update the keyboard
    updateKeyboard();
    guessLetterNumber = 1;
    guessNumber++;
    currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);
  }
};

const doesWordExist = async (word) => {
  try {
    const res = await fetch(`${DICTIONARY_API_URL}${word}`);
    return !(res.status === 404);
  } catch (_e) {
    return true;
  }
};

const updateKeyboard = () => {
  Object.entries(LETTERS).forEach(([letter, letterData]) => {
    if (letterData.used) {
      const letterElement = document.getElementById(letter);
      letterElement.style.backgroundColor = letterData.correct
        ? letterData.correctPos
          ? GREEN
          : YELLOW
        : RED;
    }
  });
};
