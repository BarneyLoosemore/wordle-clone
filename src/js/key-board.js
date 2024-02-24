import { Game } from "./game.js";

const game = new Game();

class Keyboard extends HTMLElement {
  static tagName = "key-board";

  #enter = "ENTER";
  #backspace = "BACKSPACE";
  #acceptedKeys = [
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    this.#enter,
    this.#backspace,
  ];

  constructor() {
    super();

    const internals = this.attachInternals();

    let shadow = internals.shadowRoot;
    if (!shadow) {
      this.attachShadow({ mode: "open" });
    }

    const keyboard = shadow.childNodes;

    for (const key of keyboard) {
      key.addEventListener("click", ({ target }) =>
        this.handleKeyPress(target.textContent.trim(""))
      );
    }
    document.addEventListener("keydown", ({ key }) =>
      this.handleKeyPress(key.toUpperCase())
    );

    this.addEventListener("updateKeys", ({ detail }) => {
      const { updatedGuess, word } = detail;
      this.handleUpdateKeys(updatedGuess, word);
    });
  }

  handleKeyPress(key) {
    if (!this.#acceptedKeys.includes(key)) return;
    if (key === this.#enter) {
      game.checkGuess();
      return;
    }
    if (key === this.#backspace) {
      game.currentGuess = game.currentGuess.slice(0, -1);
      return;
    }
    game.currentGuess = [...game.currentGuess, key];
  }

  handleUpdateKeys(updatedGuess, word) {
    for (const [index, letter] of updatedGuess.entries()) {
      if (letter === word[index]) {
        this.getKey(letter).style.backgroundColor = "green";
        continue;
      }
      if (word.includes(letter)) {
        this.getKey(letter).style.backgroundColor = "yellow";
        continue;
      }
      this.getKey(letter).style.backgroundColor = "red";
    }
  }

  getKey(letter) {
    return this.shadowRoot.childNodes[this.#acceptedKeys.indexOf(letter)];
  }
}

customElements.define(Keyboard.tagName, Keyboard);
