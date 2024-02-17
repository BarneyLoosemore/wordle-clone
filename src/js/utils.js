import words from "./permitted-words.js";
import {
  GREY,
  GREEN,
  YELLOW,
  ONE_DAY_IN_MS,
  LOCAL_STORAGE_KEY,
} from "./constants.js";

export const getCurrentGuessRowElement = (guessNumber) =>
  document.getElementById(`tile-row-${guessNumber}`);

export const displayUnpermittedWordToast = () => {
  // TODO: make this of appropriate html
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

export const readyForNewWord = (timeWhenLastWordGenerated) => {
  if (!timeWhenLastWordGenerated) return true;
  const now = Date.now();
  const timeSinceLastNewWord = now - timeWhenLastWordGenerated;
  return timeSinceLastNewWord > ONE_DAY_IN_MS;
};

export const getWord = () => {
  const { timeWhenLastWordGenerated, word } =
    JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) ?? {};

  if (!word || readyForNewWord(timeWhenLastWordGenerated)) {
    const newWord = words[Math.floor(Math.random() * words.length)];
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ timeWhenLastWordGenerated: Date.now(), word: newWord })
    );
    return newWord;
  }
  return word;
};
