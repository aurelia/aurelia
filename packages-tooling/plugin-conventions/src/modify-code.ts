import $modifyCode from 'modify-code';
import * as ModifyCode from 'modify-code';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const modifyCode = (typeof $modifyCode === 'function'
    ? $modifyCode
    : typeof ModifyCode === 'function'
        ? ModifyCode
        : ModifyCode.default) as typeof $modifyCode;
