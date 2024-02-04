/* eslint-disable @typescript-eslint/no-explicit-any */
import $modifyCode from 'modify-code';
import * as ModifyCode from 'modify-code';

export const modifyCode = (typeof $modifyCode === 'function'
    ? $modifyCode
    : typeof ($modifyCode as any).default === 'function'
        ? ($modifyCode as any).default
        : typeof ModifyCode === 'function'
            ? ModifyCode
            : ModifyCode.default) as typeof $modifyCode;
