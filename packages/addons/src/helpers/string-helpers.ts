export function capitalize(value:string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export function reverse (value:string) {
  // Reverses the order of the characters in the string and returns it
  return value.split('').reverse().join('');
};

export function truncate (value:string, maxLength:number) {
  // Truncates the string to the specified length and adds an ellipsis at the end if it is truncated
  if (value.length > maxLength) {
    return value.slice(0, maxLength - 3) + '...';
  } else {
    return value.toString();
  }
};