import permittedWords from "../permittedWords.json" assert { type: "json" };

/* Constants */
const WORDS_TO_GUESS = [
  "zesty",
  "yield",
  "forge",
  "greed",
  "liver",
  "sushi",
  "farty",
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
  const tile = currentGuessRowElement.querySelector(
    `div:nth-child(${guessLetterNumber - 1})`
  );
  tile.innerHTML = "";
  tile.classList.remove("letter-added");
  guessLetterNumber--;
};

document.addEventListener("keydown", (event) => {
  const letter = event.key.toLowerCase();
  handleLetterSelect(letter);
});

/* Handler functions */
const handleLetterSelect = (letter) => {
  if (
    guessLetterNumber > 5 &&
    letter === "enter" &&
    !(document.activeElement === document.getElementById("source-code"))
  ) {
    handleGuess();
  }
  // Allow player to add letters if they are A-Z
  if (guessLetterNumber <= 5 && letter.match(/^[a-zA-Z]$/)) {
    const tile = currentGuessRowElement.querySelector(
      `div:nth-child(${guessLetterNumber})`
    );
    tile.textContent = letter.toUpperCase();
    tile.classList.add("letter-added");
    guessLetterNumber++;
  }
  if (letter === "backspace" && guessLetterNumber > 1) {
    deleteLatestLetter();
  }
};

const handleGuess = () => {
  const letterElements = Array.from(currentGuessRowElement.children);
  const playerGuessWord = letterElements
    .map((letterElement) => letterElement.textContent)
    .join("");

  const wordExists = doesWordExist(playerGuessWord);

  // If word does not exist in dictionary, do nothing
  if (!wordExists) {
    displayUnpermittedWordToast();
    return;
  }

  // If the guess is correct, player wins!
  if (playerGuessWord === WORD_TO_GUESS) {
    letterElements.forEach((child) => {
      child.classList.remove("letter-added");
      child.style.border = "none";
      child.style.backgroundColor = GREEN;
    });
    WORD_TO_GUESS.split("").forEach((letter) => {
      document.getElementById(letter).style.backgroundColor = GREEN;
    });
    setTimeout(() => alert("You win!"), 0);
  } else {
    // Else, assess what letters of the guess the player got right/wrong
    const guessStatus = checkGuess(playerGuessWord);

    letterElements.forEach((child, index) => {
      const { correct, correctPos } = guessStatus[index];

      child.classList.remove("letter-added");
      child.style.border = "none";
      child.style.backgroundColor = correctPos
        ? GREEN
        : correct
        ? YELLOW
        : GREY;
    });

    // If user guesses wrong, go to next guess row and update the keyboard
    updateKeyboard(guessStatus);
    guessLetterNumber = 1;
    guessNumber++;
    currentGuessRowElement = document.getElementById(`tile-row-${guessNumber}`);
  }
};

const updateKeyboard = (guessStatus) => {
  guessStatus.forEach(({ letter, correct, correctPos }) => {
    const letterElement = document.getElementById(letter);
    letterElement.classList.remove("letter-added");
    letterElement.style.border = "none";
    letterElement.style.backgroundColor = correctPos
      ? GREEN
      : correct
      ? YELLOW
      : GREY;
  });
};

const doesWordExist = (word) => {
  return permittedWords.indexOf(word) !== -1;
};

// Bit of a hacky solution, but it works
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
