/*! (c) Andrea Giammarchi - MIT */
export const escaper = (function (O) {'use strict';
  var
    reEscape = /[&<>'"]/g,
    reUnescape = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g,
    oEscape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    },
    oUnescape = {
      '&amp;': '&',
      '&#38;': '&',
      '&lt;': '<',
      '&#60;': '<',
      '&gt;': '>',
      '&#62;': '>',
      '&apos;': "'",
      '&#39;': "'",
      '&quot;': '"',
      '&#34;': '"'
    },
    fnEscape = function (m) {
      return oEscape[m];
    },
    fnUnescape = function (m) {
      return oUnescape[m];
    },
    replace = ''.replace;
  return O.freeze({
    escape: function escape(s: string): string {
      return replace.call(s, reEscape, fnEscape);
    },
    unescape: function unescape(s: string): string {
      return replace.call(s, reUnescape, fnUnescape);
    }
  });
}(Object));
