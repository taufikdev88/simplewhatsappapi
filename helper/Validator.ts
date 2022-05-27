import Validator from 'validatorjs';

export const validator = (body: any, rules: any, customMessage: any, callback: any) => {
  const validation = new Validator(body, rules, customMessage);
  validation.passes(() => callback(null, true));
  validation.fails(() => callback(validation.errors, false));
};