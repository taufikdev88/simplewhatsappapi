export const makeString = (inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789', length: number = 32) : string => {
  let outString: string = '';

  for (let i = 0; i < length; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  return outString;
}