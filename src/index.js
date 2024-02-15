import permittedWords from "./permitted-words.js";

const WORDS_TO_GUESS = [
  "zesty",
  "yield",
  "forge",
  "greed",
  "liver",
  "sushi",
  "preen",
  "exile",
];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const ENTER_KEY = "ENTER";
const DELETE_KEY = "DELETE";
const GREEN = "#006f45";
const YELLOW = "#da8821";
const GREY = "#3a3a3c";

const WORD_TO_GUESS =
  WORDS_TO_GUESS[
    Math.floor(Math.random() * WORDS_TO_GUESS.length)
  ].toUpperCase();

let guessNumber = 1;
let guessLetterNumber = 1;
let currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);

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

document.addEventListener("keydown", (event) => {
  const letter = event.key.toLowerCase();
  handleLetterSelect(letter);
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
  const isEnterGuess = guessLetterNumber > 5 && letter === "enter";
  const isLetterDeletion = guessLetterNumber > 1 && letter === "backspace";
  const isLetterEntry = guessLetterNumber <= 5 && letter.match(/^[a-zA-Z]$/);

  console.log(
    `isEnterGuess: ${isEnterGuess}, isLetterDeletion: ${isLetterDeletion}, isLetterEntry: ${isLetterEntry}`
  );

  if (isEnterGuess) {
    handleGuess();
    return;
  }

  if (isLetterDeletion) {
    deleteLatestLetter();
    return;
  }

  if (isLetterEntry) {
    addLetterToGuess(letter);
    return;
  }
};

const updateKeyElement = (element, correct, correctPos) => {
  element.classList.remove("letter-added");
  element.style.border = "none";
  if (correctPos) {
    element.style.backgroundColor = GREEN;
  } else if (correct) {
    element.style.backgroundColor = YELLOW;
  } else {
    element.style.backgroundColor = GREY;
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
  console.log({ guessNumber });
};

const doesWordExist = (word) => {
  return permittedWords.indexOf(word) !== -1;
};

const checkGuess = (guess) => {
  const guessLetters = guess.split("");
  const wordToGuessLetters = WORD_TO_GUESS.split("");

  // This stores the status of each letter in the guess
  const playerGuessStatus = guessLetters.map((letter) => ({
    letter,
    correct: false,
    correctPos: false,
  }));

  // Check all the letters in the guess that are correct AND in the right position
  // For any matches, the letter is removed from the word to guess letter list, so as to not trigger an accidental 'partial match' in the next check
  const wordToGuessLettersLeftToCheck = guessLetters.map((letter, index) => {
    if (letter === wordToGuessLetters[index]) {
      playerGuessStatus[index].correctPos = true;
      return null;
    }
    return wordToGuessLetters[index];
  });

  // Now, check all the letters in the guess that are correct but in the wrong position
  guessLetters.forEach((letter, index) => {
    if (playerGuessStatus[index].correctPos) {
      return;
    }
    if (wordToGuessLettersLeftToCheck.includes(letter)) {
      playerGuessStatus[index].correct = true;
    }
  });

  return playerGuessStatus;
};

const displayUnpermittedWordToast = () => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<p>Not a permitted word</p>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0%";
    setTimeout(() => {
      toast.remove();
    }, 1000);
  }, 3000);
};
