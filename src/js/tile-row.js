class TileRow extends HTMLElement {
  static tagName = "tile-row";

  #row;
  #styles = `
    div {
      background-color: white;
    }
    :host {
      display: grid;
      grid-template: 50px / repeat(5, 50px);
      gap: 5px;
      margin-bottom: 5px;
    }
    @keyframes pop-tile {
      0% {
        transform: scale(1);
      }
      60% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
    .letter-added {
      border-color: #767676;
      animation: pop-tile 0.075s ease-in-out;
    }
  `;

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replace(this.#styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    Array.from({ length: 5 }, () => {
      const tile = document.createElement("div");
      shadowRoot.appendChild(tile);
    });

    this.#row = shadowRoot.childNodes;
    this.bindEvents();
  }

  bindEvents() {
    this.addEventListener("updateGuess", ({ detail: { updatedGuess } }) => {
      for (const tile of this.#row) {
        const letter = updatedGuess.shift();
        if (!letter) {
          tile.textContent = "";
          tile.classList.remove("letter-added");
          continue;
        }
        tile.textContent = letter;
        tile.classList.add("letter-added");
      }
    });

    this.addEventListener("submitGuess", ({ detail: { word } }) =>
      this.determineGuessAccuracy(word)
    );
  }

  determineGuessAccuracy(word) {
    const row = [...this.shadowRoot.childNodes].filter(
      (node) => node.nodeName === "DIV"
    ); // TODO

    // TODO: Refactor this to be more functional?
    const wordLettersLeft = row.map((tile, index) => {
      if (tile.textContent === word[index]) {
        tile.style.backgroundColor = "green";
        return null;
      }
      tile.style.backgroundColor = "red";
      return word[index];
    });

    const tilesLeftToCheck = row.filter(
      (tile) => tile.style.backgroundColor !== "green"
    );

    for (const [index, tile] of tilesLeftToCheck.entries()) {
      if (wordLettersLeft.includes(tile.textContent)) {
        tile.style.backgroundColor = "yellow";
        wordLettersLeft[wordLettersLeft.indexOf(tile.textContent)] = null;
      }
    }
  }
}

customElements.define(TileRow.tagName, TileRow);
