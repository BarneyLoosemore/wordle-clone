export class Game {
  #guesses = [];
  #word = "HELLO".split(""); // TODO: generate random word
  #currentGuess = "";
  #maxGuesses = 5;
  #permittedWords;

  constructor() {
    this.#idleLoadPermittedWords();
  }

  get currentGuess() {
    return this.#currentGuess.split("");
  }

  set currentGuess(updatedGuess) {
    if (updatedGuess.length > this.#word.length) return;
    this.#currentGuess = updatedGuess.join(""); // no enumerable setter
    this.#updateTiles();
  }

  get #currentTileRow() {
    return document.querySelectorAll("tile-row")[this.#guesses.length];
  }

  async #loadPermittedWords() {
    this.#permittedWords = (await import("./permitted-words.js")).default;
  }

  async #idleLoadPermittedWords() {
    if ("requestIdleCallback" in window) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      requestIdleCallback(() => {
        if (!this.#permittedWords) {
          this.#loadPermittedWords();
        }
      });
      return;
    }
    setTimeout(() => this.#loadPermittedWords(), 0);
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

  async checkGuess() {
    if (!this.#permittedWords) await this.#loadPermittedWords();

    const isValidWord = this.#permittedWords.includes(this.#currentGuess);
    const isCorrectLength = this.#currentGuess.length === this.#word.length;
    const hasGuessed = this.#guesses.includes(this.#currentGuess);

    if (!isValidWord || !isCorrectLength || hasGuessed) {
      this.#currentTileRow.dispatchEvent(new CustomEvent("invalidGuess"));
      return;
    }

    this.#updateTilesAfterGuess();
    this.#updateKeys();

    if (this.#currentGuess === this.#word.join("")) {
      setTimeout(() => alert("You win!"), 10);
      this.#reset();
    } else if (this.#guesses.length === this.#maxGuesses - 1) {
      setTimeout(() => alert("You lose!"), 10);
      this.#reset();
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
