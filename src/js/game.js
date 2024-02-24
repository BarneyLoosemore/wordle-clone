const generateWord = () => "HELLO";

export class Game {
  #guesses = [];
  #word = generateWord().split("");
  #currentGuess = "";

  get currentGuess() {
    return this.#currentGuess.split("");
  }

  get currentRow() {
    return this.#guesses.length;
  }

  getCurrentTileRow() {
    return document.querySelectorAll("tile-row")[this.#guesses.length];
  }

  set currentGuess(updatedGuess) {
    if (updatedGuess.length > this.#word.length) return;

    this.#currentGuess = updatedGuess.join("");
    this.getCurrentTileRow().dispatchEvent(
      new CustomEvent("updateGuess", {
        detail: { updatedGuess },
      })
    );
  }

  checkGuess() {
    if (this.#currentGuess.length !== this.#word.length) return;

    this.getCurrentTileRow().dispatchEvent(
      new CustomEvent("submitGuess", {
        detail: { word: this.#word },
      })
    );

    const keyboard = document.querySelector("key-board");
    keyboard.dispatchEvent(
      new CustomEvent("updateKeys", {
        detail: {
          updatedGuess: this.#currentGuess.split(""),
          word: this.#word,
        },
      })
    );

    this.#guesses.push(this.#currentGuess);

    if (this.#currentGuess === this.#word.join("")) {
      setTimeout(() => alert("You win!"), 0);
      return;
    }

    if (this.#guesses.length === 5) {
      setTimeout(() => alert("You lose!"), 0);
      return;
    }
  }
}
