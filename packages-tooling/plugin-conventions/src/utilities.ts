import $modifyCode from 'modify-code';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modifyCode = (($modifyCode as any).default as typeof $modifyCode) ?? $modifyCode;

export type { ModifyCodeResult } from 'modify-code';
