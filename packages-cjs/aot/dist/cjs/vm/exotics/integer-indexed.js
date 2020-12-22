"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$SetValueInBuffer = exports.$GetValueFromBuffer = exports.$IsDetachedBuffer = exports.$IntegerIndexedExoticObject = void 0;
const object_js_1 = require("../types/object.js");
// http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects
class $IntegerIndexedExoticObject extends object_js_1.$Object {
    // http://www.ecma-international.org/ecma-262/#sec-integerindexedobjectcreate
    // 9.4.5.7 IntegerIndexedObjectCreate ( prototype , internalSlotsList )
    constructor(realm, proto) {
        super(realm, 'IntegerIndexedExoticObject', proto, 1 /* normal */, realm['[[Intrinsics]]'].empty);
        // 1. Assert: internalSlotsList contains the names [[ViewedArrayBuffer]], [[ArrayLength]], [[ByteOffset]], and [[TypedArrayName]].
        // 2. Let A be a newly created object with an internal slot for each name in internalSlotsList.
        // 3. Set A's essential internal methods to the default ordinary object definitions specified in 9.1.
        // 4. Set A.[[GetOwnProperty]] as specified in 9.4.5.1.
        // 5. Set A.[[HasProperty]] as specified in 9.4.5.2.
        // 6. Set A.[[DefineOwnProperty]] as specified in 9.4.5.3.
        // 7. Set A.[[Get]] as specified in 9.4.5.4.
        // 8. Set A.[[Set]] as specified in 9.4.5.5.
        // 9. Set A.[[OwnPropertyKeys]] as specified in 9.4.5.6.
        // 10. Set A.[[Prototype]] to prototype.
        // 11. Set A.[[Extensible]] to true.
        // 12. Return A.
    }
    // http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects-getownproperty-p
    // 9.4.5.1 [[GetOwnProperty]] ( P )
    '[[GetOwnProperty]]'(ctx, P) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        return null; // TODO
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Assert: O is an Object that has a [[ViewedArrayBuffer]] internal slot.
        // 3. If Type(P) is String, then
        // 3. a. Let numericIndex be ! CanonicalNumericIndexString(P).
        // 3. b. If numericIndex is not undefined, then
        // 3. b. i. Let value be ? IntegerIndexedElementGet(O, numericIndex).
        // 3. b. ii. If value is undefined, return undefined.
        // 3. b. iii. Return a PropertyDescriptor { [[Value]]: value, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: false }.
        // 4. Return OrdinaryGetOwnProperty(O, P).
    }
    // http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects-hasproperty-p
    // 9.4.5.2 [[HasProperty]] ( P )
    '[[HasProperty]]'(ctx, P) {
        const intrinsics = this.realm['[[Intrinsics]]'];
        return null; // TODO
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Assert: O is an Object that has a [[ViewedArrayBuffer]] internal slot.
        // 3. If Type(P) is String, then
        // 3. a. Let numericIndex be ! CanonicalNumericIndexString(P).
        // 3. b. If numericIndex is not undefined, then
        // 3. b. i. Let buffer be O.[[ViewedArrayBuffer]].
        // 3. b. ii. If IsDetachedBuffer(buffer) is true, throw a TypeError exception.
        // 3. b. iii. If IsInteger(numericIndex) is false, return false.
        // 3. b. iv. If numericIndex = -0, return false.
        // 3. b. v. If numericIndex < 0, return false.
        // 3. b. vi. If numericIndex ≥ O.[[ArrayLength]], return false.
        // 3. b. vii. Return true.
        // 4. Return ? OrdinaryHasProperty(O, P).
    }
    // http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects-defineownproperty-p-desc
    // 9.4.5.3 [[DefineOwnProperty]] ( P , Desc )
    '[[DefineOwnProperty]]'(ctx, P, Desc) {
        return null; // TODO
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Assert: O is an Object that has a [[ViewedArrayBuffer]] internal slot.
        // 3. If Type(P) is String, then
        // 3. a. Let numericIndex be ! CanonicalNumericIndexString(P).
        // 3. b. If numericIndex is not undefined, then
        // 3. b. i. If IsInteger(numericIndex) is false, return false.
        // 3. b. ii. If numericIndex = -0, return false.
        // 3. b. iii. If numericIndex < 0, return false.
        // 3. b. iv. Let length be O.[[ArrayLength]].
        // 3. b. v. If numericIndex ≥ length, return false.
        // 3. b. vi. If IsAccessorDescriptor(Desc) is true, return false.
        // 3. b. vii. If Desc has a [[Configurable]] field and if Desc.[[Configurable]] is true, return false.
        // 3. b. viii. If Desc has an [[Enumerable]] field and if Desc.[[Enumerable]] is false, return false.
        // 3. b. ix. If Desc has a [[Writable]] field and if Desc.[[Writable]] is false, return false.
        // 3. b. x. If Desc has a [[Value]] field, then
        // 3. b. x. 1. Let value be Desc.[[Value]].
        // 3. b. x. 2. Return ? IntegerIndexedElementSet(O, numericIndex, value).
        // 3. b. undefined. Return true.
        // 4. Return ! OrdinaryDefineOwnProperty(O, P, Desc).
    }
    // http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects-get-p-receiver
    // 9.4.5.4 [[Get]] ( P , Receiver )
    '[[Get]]'(ctx, P, Receiver) {
        const intrinsics = this.realm['[[Intrinsics]]'];
        return null; // TODO
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. If Type(P) is String, then
        // 2. a. Let numericIndex be ! CanonicalNumericIndexString(P).
        // 2. b. If numericIndex is not undefined, then
        // 2. b. i. Return ? IntegerIndexedElementGet(O, numericIndex).
        // 3. Return ? OrdinaryGet(O, P, Receiver).
    }
    // http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects-set-p-v-receiver
    // 9.4.5.5 [[Set]] ( P , V , Receiver )
    '[[Set]]'(ctx, P, V, Receiver) {
        return null; // TODO
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. If Type(P) is String, then
        // 2. a. Let numericIndex be ! CanonicalNumericIndexString(P).
        // 2. b. If numericIndex is not undefined, then
        // 2. b. i. Return ? IntegerIndexedElementSet(O, numericIndex, V).
        // 3. Return ? OrdinarySet(O, P, V, Receiver).
    }
    // http://www.ecma-international.org/ecma-262/#sec-integer-indexed-exotic-objects-ownpropertykeys
    // 9.4.5.6 [[OwnPropertyKeys]] ( )
    '[[OwnPropertyKeys]]'(ctx) {
        return null; // TODO
        // 1. Let keys be a new empty List.
        // 2. Assert: O is an Object that has [[ViewedArrayBuffer]], [[ArrayLength]], [[ByteOffset]], and [[TypedArrayName]] internal slots.
        // 3. Let len be O.[[ArrayLength]].
        // 4. For each integer i starting with 0 such that i < len, in ascending order, do
        // 4. a. Add ! ToString(i) as the last element of keys.
        // 5. For each own property key P of O such that Type(P) is String and P is not an integer index, in ascending chronological order of property creation, do
        // 5. a. Add P as the last element of keys.
        // 6. For each own property key P of O such that Type(P) is Symbol, in ascending chronological order of property creation, do
        // 6. a. Add P as the last element of keys.
        // 7. Return keys.
    }
    // http://www.ecma-international.org/ecma-262/#sec-integerindexedelementget
    // 9.4.5.8 IntegerIndexedElementGet ( O , index )
    ElementGet(index) {
        return null; // TODO
        // 1. Assert: Type(index) is Number.
        // 2. Assert: O is an Object that has [[ViewedArrayBuffer]], [[ArrayLength]], [[ByteOffset]], and [[TypedArrayName]] internal slots.
        // 3. Let buffer be O.[[ViewedArrayBuffer]].
        // 4. If IsDetachedBuffer(buffer) is true, throw a TypeError exception.
        // 5. If IsInteger(index) is false, return undefined.
        // 6. If index = -0, return undefined.
        // 7. Let length be O.[[ArrayLength]].
        // 8. If index < 0 or index ≥ length, return undefined.
        // 9. Let offset be O.[[ByteOffset]].
        // 10. Let arrayTypeName be the String value of O.[[TypedArrayName]].
        // 11. Let elementSize be the Number value of the Element Size value specified in Table 59 for arrayTypeName.
        // 12. Let indexedPosition be (index × elementSize) + offset.
        // 13. Let elementType be the String value of the Element Type value in Table 59 for arrayTypeName.
        // 14. Return GetValueFromBuffer(buffer, indexedPosition, elementType, true, "Unordered").
    }
    // http://www.ecma-international.org/ecma-262/#sec-integerindexedelementset
    // 9.4.5.9 IntegerIndexedElementSet ( O , index , value )
    ElementSet(index, value) {
        return null; // TODO
        // 1. Assert: Type(index) is Number.
        // 2. Assert: O is an Object that has [[ViewedArrayBuffer]], [[ArrayLength]], [[ByteOffset]], and [[TypedArrayName]] internal slots.
        // 3. Let numValue be ? ToNumber(value).
        // 4. Let buffer be O.[[ViewedArrayBuffer]].
        // 5. If IsDetachedBuffer(buffer) is true, throw a TypeError exception.
        // 6. If IsInteger(index) is false, return false.
        // 7. If index = -0, return false.
        // 8. Let length be O.[[ArrayLength]].
        // 9. If index < 0 or index ≥ length, return false.
        // 10. Let offset be O.[[ByteOffset]].
        // 11. Let arrayTypeName be the String value of O.[[TypedArrayName]].
        // 12. Let elementSize be the Number value of the Element Size value specified in Table 59 for arrayTypeName.
        // 13. Let indexedPosition be (index × elementSize) + offset.
        // 14. Let elementType be the String value of the Element Type value in Table 59 for arrayTypeName.
        // 15. Perform SetValueInBuffer(buffer, indexedPosition, elementType, numValue, true, "Unordered").
        // 16. Return true.
    }
}
exports.$IntegerIndexedExoticObject = $IntegerIndexedExoticObject;
// http://www.ecma-international.org/ecma-262/#sec-isdetachedbuffer
function $IsDetachedBuffer(arrayBuffer) {
    return null; // TODO
    // 1. Assert: Type(arrayBuffer) is Object and it has an [[ArrayBufferData]] internal slot.
    // 2. If arrayBuffer.[[ArrayBufferData]] is null, return true.
    // 3. Return false.
}
exports.$IsDetachedBuffer = $IsDetachedBuffer;
// http://www.ecma-international.org/ecma-262/#sec-getvaluefrombuffer
function $GetValueFromBuffer(arrayBuffer, byteIndex, type, isTypedArray, order, isLittleEndian) {
    return null; // TODO
    // 1. Assert: IsDetachedBuffer(arrayBuffer) is false.
    // 2. Assert: There are sufficient bytes in arrayBuffer starting at byteIndex to represent a value of type.
    // 3. Assert: byteIndex is an integer value ≥ 0.
    // 4. Let block be arrayBuffer.[[ArrayBufferData]].
    // 5. Let elementSize be the Number value of the Element Size value specified in Table 59 for Element Type type.
    // 6. If IsSharedArrayBuffer(arrayBuffer) is true, then
    // 6. a. Let execution be the [[CandidateExecution]] field of the surrounding agent's Agent Record.
    // 6. b. Let eventList be the [[EventList]] field of the element in execution.[[EventsRecords]] whose [[AgentSignifier]] is AgentSignifier().
    // 6. c. If isTypedArray is true and type is "Int8", "Uint8", "Int16", "Uint16", "Int32", or "Uint32", let noTear be true; otherwise let noTear be false.
    // 6. d. Let rawValue be a List of length elementSize of nondeterministically chosen byte values.
    // 6. e. NOTE: In implementations, rawValue is the result of a non-atomic or atomic read instruction on the underlying hardware. The nondeterminism is a semantic prescription of the memory model to describe observable behaviour of hardware with weak consistency.
    // 6. f. Let readEvent be ReadSharedMemory { [[Order]]: order, [[NoTear]]: noTear, [[Block]]: block, [[ByteIndex]]: byteIndex, [[ElementSize]]: elementSize }.
    // 6. g. Append readEvent to eventList.
    // 6. h. Append Chosen Value Record { [[Event]]: readEvent, [[ChosenValue]]: rawValue } to execution.[[ChosenValues]].
    // 7. Else, let rawValue be a List of elementSize containing, in order, the elementSize sequence of bytes starting with block[byteIndex].
    // 8. If isLittleEndian is not present, set isLittleEndian to the value of the [[LittleEndian]] field of the surrounding agent's Agent Record.
    // 9. Return RawBytesToNumber(type, rawValue, isLittleEndian).
}
exports.$GetValueFromBuffer = $GetValueFromBuffer;
// http://www.ecma-international.org/ecma-262/#sec-setvalueinbuffer
function $SetValueInBuffer(arrayBuffer, byteIndex, type, value, isTypedArray, order, isLittleEndian) {
    // TODO
    // 1. Assert: IsDetachedBuffer(arrayBuffer) is false.
    // 2. Assert: There are sufficient bytes in arrayBuffer starting at byteIndex to represent a value of type.
    // 3. Assert: byteIndex is an integer value ≥ 0.
    // 4. Assert: Type(value) is Number.
    // 5. Let block be arrayBuffer.[[ArrayBufferData]].
    // 6. Let elementSize be the Number value of the Element Size value specified in Table 59 for Element Type type.
    // 7. If isLittleEndian is not present, set isLittleEndian to the value of the [[LittleEndian]] field of the surrounding agent's Agent Record.
    // 8. Let rawBytes be NumberToRawBytes(type, value, isLittleEndian).
    // 9. If IsSharedArrayBuffer(arrayBuffer) is true, then
    // 9. a. Let execution be the [[CandidateExecution]] field of the surrounding agent's Agent Record.
    // 9. b. Let eventList be the [[EventList]] field of the element in execution.[[EventsRecords]] whose [[AgentSignifier]] is AgentSignifier().
    // 9. c. If isTypedArray is true and type is "Int8", "Uint8", "Int16", "Uint16", "Int32", or "Uint32", let noTear be true; otherwise let noTear be false.
    // 9. d. Append WriteSharedMemory { [[Order]]: order, [[NoTear]]: noTear, [[Block]]: block, [[ByteIndex]]: byteIndex, [[ElementSize]]: elementSize, [[Payload]]: rawBytes } to eventList.
    // 10. Else, store the individual bytes of rawBytes into block, in order, starting at block[byteIndex].
    // 11. Return NormalCompletion(undefined).
}
exports.$SetValueInBuffer = $SetValueInBuffer;
//# sourceMappingURL=integer-indexed.js.map