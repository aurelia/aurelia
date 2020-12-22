import { $BuiltinFunction, } from '../types/function.js';
// http://www.ecma-international.org/ecma-262/#sec-uri-handling-functions
// 18.2.6 URI Handling Functions
// http://www.ecma-international.org/ecma-262/#sec-uri-syntax-and-semantics
// 18.2.6.1 URI Syntax and Semantics
// uri :::
//     uriCharacters opt
// uriCharacters :::
//     uriCharacter uriCharacters opt
// uriCharacter :::
//     uriReserved
//     uriUnescaped
//     uriEscaped
// uriReserved ::: one of
//     ; / ? : @ & = + $ ,
// uriUnescaped :::
//     uriAlpha
//     DecimalDigit
//     uriMark
// uriEscaped :::
//     % HexDigit HexDigit
// uriAlpha ::: one of
//     a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
// uriMark ::: one of
//     - _ . ! ~ * ' ( )
// http://www.ecma-international.org/ecma-262/#sec-encode
// 18.2.6.1.1 Runtime Semantics: Encode ( string , unescapedSet )
export function $Encode(ctx, string, unescapedSet) {
    // 1. Let strLen be the number of code units in string.
    // 2. Let R be the empty String.
    // 3. Let k be 0.
    // 4. Repeat,
    // 4. a. If k equals strLen, return R.
    // 4. b. Let C be the code unit at index k within string.
    // 4. c. If C is in unescapedSet, then
    // 4. c. i. Let S be the String value containing only the code unit C.
    // 4. c. ii. Set R to the string-concatenation of the previous value of R and S.
    // 4. d. Else C is not in unescapedSet,
    // 4. d. i. If C is a trailing surrogate, throw a URIError exception.
    // 4. d. ii. If C is not a leading surrogate, then
    // 4. d. ii. 1. Let V be the code point with the same numeric value as code unit C.
    // 4. d. iii. Else,
    // 4. d. iii. 1. Increase k by 1.
    // 4. d. iii. 2. If k equals strLen, throw a URIError exception.
    // 4. d. iii. 3. Let kChar be the code unit at index k within string.
    // 4. d. iii. 4. If kChar is not a trailing surrogate, throw a URIError exception.
    // 4. d. iii. 5. Let V be UTF16Decode(C, kChar).
    // 4. d. iv. Let Octets be the List of octets resulting by applying the UTF-8 transformation to V.
    // 4. d. v. For each element octet of Octets in List order, do
    // 4. d. v. 1. Let S be the string-concatenation of:"%"the String representation of octet, formatted as a two-digit uppercase hexadecimal number, padded to the left with a zero if necessary
    // 4. d. v. 2. Set R to the string-concatenation of the previous value of R and S.
    // 4. e. Increase k by 1.
    throw new Error('Method not implemented.');
}
// http://www.ecma-international.org/ecma-262/#sec-decode
// 18.2.6.1.2 Runtime Semantics: Decode ( string , reservedSet )
export function $Decode(ctx, string, reservedSet) {
    // 1. Let strLen be the number of code units in string.
    // 2. Let R be the empty String.
    // 3. Let k be 0.
    // 4. Repeat,
    // 4. a. If k equals strLen, return R.
    // 4. b. Let C be the code unit at index k within string.
    // 4. c. If C is not the code unit 0x0025 (PERCENT SIGN), then
    // 4. c. i. Let S be the String value containing only the code unit C.
    // 4. d. Else C is the code unit 0x0025 (PERCENT SIGN),
    // 4. d. i. Let start be k.
    // 4. d. ii. If k + 2 is greater than or equal to strLen, throw a URIError exception.
    // 4. d. iii. If the code units at index (k + 1) and (k + 2) within string do not represent hexadecimal digits, throw a URIError exception.
    // 4. d. iv. Let B be the 8-bit value represented by the two hexadecimal digits at index (k + 1) and (k + 2).
    // 4. d. v. Increment k by 2.
    // 4. d. vi. If the most significant bit in B is 0, then
    // 4. d. vi. 1. Let C be the code unit whose value is B.
    // 4. d. vi. 2. If C is not in reservedSet, then
    // 4. d. vi. 2. a. Let S be the String value containing only the code unit C.
    // 4. d. vi. 3. Else C is in reservedSet,
    // 4. d. vi. 3. a. Let S be the substring of string from index start to index k inclusive.
    // 4. d. vii. Else the most significant bit in B is 1,
    // 4. d. vii. 1. Let n be the smallest nonnegative integer such that (B << n) & 0x80 is equal to 0.
    // 4. d. vii. 2. If n equals 1 or n is greater than 4, throw a URIError exception.
    // 4. d. vii. 3. Let Octets be a List of 8-bit integers of size n.
    // 4. d. vii. 4. Set Octets[0] to B.
    // 4. d. vii. 5. If k + (3 × (n - 1)) is greater than or equal to strLen, throw a URIError exception.
    // 4. d. vii. 6. Let j be 1.
    // 4. d. vii. 7. Repeat, while j < n
    // 4. d. vii. 7. a. Increment k by 1.
    // 4. d. vii. 7. b. If the code unit at index k within string is not the code unit 0x0025 (PERCENT SIGN), throw a URIError exception.
    // 4. d. vii. 7. c. If the code units at index (k + 1) and (k + 2) within string do not represent hexadecimal digits, throw a URIError exception.
    // 4. d. vii. 7. d. Let B be the 8-bit value represented by the two hexadecimal digits at index (k + 1) and (k + 2).
    // 4. d. vii. 7. e. If the two most significant bits in B are not 10, throw a URIError exception.
    // 4. d. vii. 7. f. Increment k by 2.
    // 4. d. vii. 7. g. Set Octets[j] to B.
    // 4. d. vii. 7. h. Increment j by 1.
    // 4. d. vii. 8. If Octets does not contain a valid UTF-8 encoding of a Unicode code point, throw a URIError exception.
    // 4. d. vii. 9. Let V be the value obtained by applying the UTF-8 transformation to Octets, that is, from a List of octets into a 21-bit value.
    // 4. d. vii. 10. Let S be the String value whose code units are, in order, the elements in UTF16Encoding(V).
    // 4. e. Set R to the string-concatenation of the previous value of R and S.
    // 4. f. Increase k by 1.
    throw new Error('Method not implemented.');
}
// http://www.ecma-international.org/ecma-262/#sec-decodeuri-encodeduri
// 18.2.6.2 decodeURI ( encodedURI )
export class $DecodeURI extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%decodeURI%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let uriString be ? ToString(encodedURI).
        // 2. Let reservedURISet be a String containing one instance of each code unit valid in uriReserved plus "#".
        // 3. Return ? Decode(uriString, reservedURISet).
        throw new Error('Method not implemented.');
    }
}
// http://www.ecma-international.org/ecma-262/#sec-decodeuricomponent-encodeduricomponent
// 18.2.6.3 decodeURIComponent ( encodedURIComponent )
export class $DecodeURIComponent extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%decodeURIComponent%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let componentString be ? ToString(encodedURIComponent).
        // 2. Let reservedURIComponentSet be the empty String.
        // 3. Return ? Decode(componentString, reservedURIComponentSet).
        throw new Error('Method not implemented.');
    }
}
// http://www.ecma-international.org/ecma-262/#sec-encodeuri-uri
// 18.2.6.4 encodeURI ( uri )
export class $EncodeURI extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%encodeURI%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let uriString be ? ToString(uri).
        // 2. Let unescapedURISet be a String containing one instance of each code unit valid in uriReserved and uriUnescaped plus "#".
        // 3. Return ? Encode(uriString, unescapedURISet).
        throw new Error('Method not implemented.');
    }
}
// http://www.ecma-international.org/ecma-262/#sec-encodeuricomponent-uricomponent
// 18.2.6.5 encodeURIComponent ( uriComponent )
export class $EncodeURIComponent extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%encodeURIComponent%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let componentString be ? ToString(uriComponent).
        // 2. Let unescapedURIComponentSet be a String containing one instance of each code unit valid in uriUnescaped.
        // 3. Return ? Encode(componentString, unescapedURIComponentSet).
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=uri-handling.js.map