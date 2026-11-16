/** So lange steht ein kurz gezeigter Satz mindestens (ms): 1,5 s und 0,4 s je Wort. @param {string} text */
export const lesezeit = (text) => 1500 + 400 * text.trim().split(/\s+/).filter(Boolean).length;
