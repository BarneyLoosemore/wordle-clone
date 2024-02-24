import { Game } from "./game.js";

const game = new Game();

class Keyboard extends HTMLElement {
  static tagName = "key-board";

  #enter = "ENTER";
  #backspace = "BACKSPACE";
  #acceptedKeys = [
    ..."QWERTYUIOPASDFGHJKL".split(""),
    this.#enter,
    ..."ZXCVBNM".split(""),
    this.#backspace,
  ];
  #styles = ``;
  #keyboard;

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replace(this.#styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    this.#keyboard = this.#acceptedKeys.map((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      shadowRoot.appendChild(button);
      return button;
    });
    this.bindEvents();
  }

  bindEvents() {
    for (const key of this.#keyboard) {
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
    return this.#keyboard[this.#acceptedKeys.indexOf(letter)];
  }
}

customElements.define(Keyboard.tagName, Keyboard);
