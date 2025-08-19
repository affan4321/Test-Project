function flattenArray(arr) {
  let result = [];

  for (let item of arr) {
    if (Array.isArray(item)) {
      // recursively flatten if item is an array
      result = result.concat(flattenArray(item));
    } else {
      // otherwise push the number
      result.push(item);
    }
  }

  return result;
}
