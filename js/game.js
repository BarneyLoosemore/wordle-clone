globalThis.requestIdleCallback =
  globalThis.requestIdleCallback || ((cb) => setTimeout(cb, 0));

export class Game {
  #word;
  #permittedWords;
  #guesses = [];
  #currentGuess = "";
  #maxGuesses = 6;

  constructor() {
    requestIdleCallback(() => {
      this.#generateWord();
      this.#loadPermittedWords();
    });
  }

  get currentGuess() {
    return this.#currentGuess.split("");
  }

  set currentGuess(updatedGuess) {
    if (updatedGuess.length > 5) return;
    this.#currentGuess = updatedGuess.join(""); // no enumerable setter
    this.#updateTiles();
  }

  get #currentTileRow() {
    return document.querySelectorAll("tile-row")[this.#guesses.length];
  }

  async #generateWord() {
    const wordList = (await import("./word-list.js")).default;
    const randomIndex = Math.floor(Math.random() * wordList.length);
    this.#word = wordList[randomIndex].split("");
  }

  async #loadPermittedWords() {
    this.#permittedWords = (await import("./permitted-words.js")).default;
  }

  #updateTiles() {
    this.#currentTileRow.dispatchEvent(
      new CustomEvent("updateGuess", {
        detail: { updatedGuess: this.#currentGuess.split("") },
      })
    );
  }

  #updateTilesAfterGuess() {
    this.#currentTileRow.dispatchEvent(
      new CustomEvent("submitGuess", {
        detail: { word: this.#word },
      })
    );
  }

  #updateKeys() {
    document.querySelector("key-board").dispatchEvent(
      new CustomEvent("updateKeys", {
        detail: {
          updatedGuess: this.#currentGuess.split(""),
          word: this.#word,
        },
      })
    );
  }

  async #renderToast(text) {
    const toast = document.createElement("div");
    toast.role = "alert";
    toast.textContent = text;
    toast.classList.add("toast");
    document.body.appendChild(toast);

    const animation = toast.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 250,
      delay: 3500,
    });
    await animation.finished;
    toast.remove();
  }

  #handleInvalidGuess(toastText) {
    this.#renderToast(toastText);
    this.#currentTileRow.dispatchEvent(new CustomEvent("invalidGuess"));
  }

  async checkGuess() {
    if (!this.#permittedWords) {
      await this.#loadPermittedWords();
    }

    if (!this.#word) {
      await this.#generateWord();
    }

    const isValidWord = this.#permittedWords.includes(this.#currentGuess);
    const isCorrectLength = this.#currentGuess.length === this.#word.length;
    const hasGuessed = this.#guesses.includes(this.#currentGuess);

    if (!isValidWord) {
      this.#handleInvalidGuess("Not in the word list :(");
      return;
    }

    if (!isCorrectLength) {
      this.#handleInvalidGuess("Guess is too short");
      return;
    }

    if (hasGuessed) {
      this.#handleInvalidGuess("You've already guessed that");
      return;
    }

    this.#updateTilesAfterGuess();
    this.#updateKeys();

    const isCorrectGuess = this.#word.join("") === this.#currentGuess;
    const isGameOver = this.#guesses.length === this.#maxGuesses - 1;

    if (isCorrectGuess) {
      this.#renderToast("You win!");
      this.#reset();
      return;
    }

    if (isGameOver) {
      this.#renderToast(`You lose! The word was ${this.#word.join("")}`);
      this.#reset();
      return;
    }

    this.#guesses.push(this.#currentGuess);
    this.#currentGuess = "";
  }

  #reset() {
    // TODO: implement reset/play again/etc. button + modal
    this.#guesses = [];
    this.#word = "HELLO".split("");
    this.#currentGuess = "";
  }
}
