const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)?.matches;

class TileRow extends HTMLElement {
  static tagName = "tile-row";

  #row;
  #styles = `
    :host {
      display: grid;
      grid-template: var(--tile-size) / repeat(5, var(--tile-size));
      gap: 5px;
      margin-bottom: 5px;
      color: white;
    }
    @keyframes flip-tile {
      0% {
        transform: rotateY(0);
      }
      100% {
        transform: rotateX(180deg);
      }
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
    div {
      display: grid;
      place-items: center;
      border: 2px solid var(--grey-2);
      font-size: var(--size-7);
      font-weight: bold;
    }
    .letter-added {
      border-color: var(--grey-3);
      animation: pop-tile 0.075s ease-in-out;
    }
  `;

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replace(this.#styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    this.#row = Array.from({ length: 5 }, () => {
      const tile = document.createElement("div");
      shadowRoot.appendChild(tile);
      return tile;
    });

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

    this.addEventListener("invalidGuess", () => {
      if (prefersReducedMotion) return;
      const shake = [
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-10px)" },
      ];
      this.animate(shake, {
        duration: 100,
        iterations: 3,
      });
    });
  }

  updateTile(tile, accuracy, index) {
    const flipAnimation = [
      { transform: `rotateX(0)` },
      {
        transform: `rotateX(90deg)`,
        backgroundColor: `var(--color-${accuracy})`,
      },
      {
        transform: `rotateX(0deg)`,
        backgroundColor: `var(--color-${accuracy})`,
        border: "none",
      },
    ];

    const animation = tile.animate(flipAnimation, {
      duration: 400,
      fill: "forwards",
      delay: index * 250,
    });

    animation.commitStyles();

    if (prefersReducedMotion) animation.finish();
  }

  determineGuessAccuracy(word) {
    const wordLetters = [...word];
    const accuracy = Array(wordLetters.length).fill("mismatch");
    const guessLetters = this.#row.map((tile) => tile.textContent);

    for (const [index, letter] of guessLetters.entries()) {
      if (!(letter === wordLetters[index])) continue;
      wordLetters[index] = null;
      accuracy[index] = "match";
    }

    for (const [index, letter] of guessLetters.entries()) {
      if (!wordLetters.includes(letter) || accuracy[index] === "match")
        continue;

      const letterIndex = wordLetters.indexOf(letter);
      wordLetters[letterIndex] = null;
      accuracy[index] = "close";
    }

    for (const [index, letterAccuracy] of accuracy.entries()) {
      this.updateTile(this.#row[index], letterAccuracy, index);
    }
  }
}

customElements.define(TileRow.tagName, TileRow);
