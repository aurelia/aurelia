const latin1IdentifierStartCodes = [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B];

const latin1IdentifierPartCodes = latin1IdentifierStartCodes.concat(0x30, 0x3A);

const otherBMPIdentifierPartCodes = [
  65493 /*ￕ*/,
  65494 /*ￖ*/,
  65495 /*ￗ*/,
  65498 /*ￚ*/,
  65499 /*ￛ*/,
  65500 /*ￜ*/
];


function toChars(compressed: number[]): string[] {
  const chars = [];
  const rangeCount = compressed.length;
  for (let i = 0; i < rangeCount; i += 2) {
    const start = compressed[i];
    let end = compressed[i + 1];
    end = end > 0 ? end : start + 1;
    for (let j = start; j < end; ++j) {
      chars.push(String.fromCharCode(j));
    }
  }
  return chars;
}

const latin1IdentifierPartChars = toChars(latin1IdentifierPartCodes);
const latin1IdentifierStartChars = toChars(latin1IdentifierStartCodes);
const otherBMPIdentifierPartChars = toChars(otherBMPIdentifierPartCodes);

export {
  latin1IdentifierStartChars, latin1IdentifierPartChars, otherBMPIdentifierPartChars
};
