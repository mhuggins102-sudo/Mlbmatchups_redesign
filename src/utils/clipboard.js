/**
 * Copy text to clipboard with fallback for older browsers.
 * Ported from original MLB Matchups vanilla JS (~line 1838).
 *
 * @param {string} text - The text to copy to clipboard.
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(function () {});
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      // silently fail
    }
    document.body.removeChild(ta);
  }
}
