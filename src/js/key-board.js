import { Game } from "./game.js";

const game = new Game();

class Keyboard extends HTMLElement {
  static tagName = "key-board";

  #enter = "ENTER";
  #backspace = "BACKSPACE";
  #firstRow = [..."QWERTYUIOP"];
  #secondRow = [..."ASDFGHJKL"];
  #thirdRow = [this.#enter, ..."ZXCVBNM", this.#backspace];
  #acceptedKeys = [...this.#firstRow, ...this.#secondRow, ...this.#thirdRow];
  #styles = `
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 500px;
    width: 100%;
    padding: 0 var(--size-2);
    gap: var(--size-2);
  }

  div {
    display: flex;
    width: 100%;
    height: 60px;
    gap: var(--size-2);
    touch-action: manipulation;
    &:nth-child(2) {
      width: 90%;
    }
    &:last-child {
      & button:first-child {
        flex: 1.5;
        font-size: var(--size-3);
        font-weight: normal;
      }
      & button:last-child {
        flex: 1.5;
        font-size: var(--size-5);
        font-weight: normal;
      }
    }
  }

  button {
    flex: 1;
    border: 0;
    padding: 0;
    border-radius: 5px;
    background-color: var(--grey-4);
    color: white;
    font-size: var(--size-5);
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.1s;
    &:hover {
      background-color: var(--grey-3);
    }
  }
  `;
  #keyboard;

  createRow(letters) {
    const row = document.createElement("div");
    this.shadowRoot.appendChild(row);
    return letters.map((letter) => {
      const button = document.createElement("button");
      button.textContent = letter === "BACKSPACE" ? "⌫" : letter;
      row.appendChild(button);
      return button;
    });
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replace(this.#styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    this.#keyboard = [
      ...this.createRow(this.#firstRow),
      ...this.createRow(this.#secondRow),
      ...this.createRow(this.#thirdRow),
    ];

    this.bindEvents();
  }

  bindEvents() {
    for (const key of this.#keyboard) {
      key.addEventListener("click", ({ target }) => {
        if (target.textContent === "⌫")
          return this.handleKeyPress(this.#backspace);
        this.handleKeyPress(target.textContent.trim(""));
      });
    }
    document.addEventListener("keydown", (event) => {
      if (document.activeElement.tagName === "KEY-BOARD") return;
      this.handleKeyPress(event.key.toUpperCase());
    });

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
        this.getKey(letter).style.backgroundColor = "var(--color-match)";
        continue;
      }
      if (word.includes(letter)) {
        this.getKey(letter).style.backgroundColor = "var(--color-close)";
        continue;
      }
      this.getKey(letter).style.backgroundColor = "var(--color-mismatch)";
    }
  }

  getKey(letter) {
    return this.#keyboard[this.#acceptedKeys.indexOf(letter)];
  }
}

customElements.define(Keyboard.tagName, Keyboard);
