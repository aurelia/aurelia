import { $BuiltinFunction, } from '../types/function.js';
// http://www.ecma-international.org/ecma-262/#sec-parseint-string-radix
// 18.2.5 parseInt ( string , radix )
export class $ParseInt extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%parseInt%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let inputString be ? ToString(string).
        // 2. Let S be a newly created substring of inputString consisting of the first code unit that is not a StrWhiteSpaceChar and all code units following that code unit. (In other words, remove leading white space.) If inputString does not contain any such code unit, let S be the empty string.
        // 3. Let sign be 1.
        // 4. If S is not empty and the first code unit of S is the code unit 0x002D (HYPHEN-MINUS), set sign to -1.
        // 5. If S is not empty and the first code unit of S is the code unit 0x002B (PLUS SIGN) or the code unit 0x002D (HYPHEN-MINUS), remove the first code unit from S.
        // 6. Let R be ? ToInt32(radix).
        // 7. Let stripPrefix be true.
        // 8. If R ≠ 0, then
        // 8. a. If R < 2 or R > 36, return NaN.
        // 8. b. If R ≠ 16, set stripPrefix to false.
        // 9. Else R = 0,
        // 9. a. Set R to 10.
        // 10. If stripPrefix is true, then
        // 10. a. If the length of S is at least 2 and the first two code units of S are either "0x" or "0X", then
        // 10. a. i. Remove the first two code units from S.
        // 10. a. ii. Set R to 16.
        // 11. If S contains a code unit that is not a radix-R digit, let Z be the substring of S consisting of all code units before the first such code unit; otherwise, let Z be S.
        // 12. If Z is empty, return NaN.
        // 13. Let mathInt be the mathematical integer value that is represented by Z in radix-R notation, using the letters A-Z and a-z for digits with values 10 through 35. (However, if R is 10 and Z contains more than 20 significant digits, every significant digit after the 20th may be replaced by a 0 digit, at the option of the implementation; and if R is not 2, 4, 8, 10, 16, or 32, then mathInt may be an implementation-dependent approximation to the mathematical integer value that is represented by Z in radix-R notation.)
        // 14. If mathInt = 0, then
        // 14. a. If sign = -1, return -0.
        // 14. b. Return +0.
        // 15. Let number be the Number value for mathInt.
        // 16. Return sign × number.
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=parse-int.js.map