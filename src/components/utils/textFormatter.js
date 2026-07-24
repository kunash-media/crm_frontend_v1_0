import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model);

/**
 * Cleans up free-text input: proper sentence casing + trailing punctuation.
 * Runs fully offline via winkNLP — no external calls.
 */
export function formatSentences(text) {
  if (!text || !text.trim()) return "";

  const doc = nlp.readDoc(text.trim());
  const sentences = doc.sentences().out();

  return sentences
    .map((s) => {
      let t = s.trim().replace(/\s+/g, " ");
      if (!t) return "";
      t = t.charAt(0).toUpperCase() + t.slice(1);
      if (!/[.!?]$/.test(t)) t += ".";
      return t;
    })
    .filter(Boolean)
    .join(" ");
}