/**
 * Returns either the input value, min, max or the default value if it's not between min-max inclusive
 *
 * @param {int} inputValue
 * @param {int} min
 * @param {int} max
 * @param {int} defaultValue
 * @returns
 */
export function getValidValue(inputValue, min, max, defaultValue) {
  let validValue = inputValue;
  if (!inputValue) {
    validValue = defaultValue;
  } else if(inputValue > max) {
    validValue = max;
  } else if (inputValue < min) {
    validValue = min;
  }

  return validValue;
}

export function getEnvironmentVariable(key) {
  return process.env[key];
}
