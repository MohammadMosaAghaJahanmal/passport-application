export default (objectData = {}) => {
  const from = new FormData();
  for (const key in objectData) {
    if (Object.hasOwnProperty.call(objectData, key)) {
      const value = objectData[key];
      if(Array.isArray(value))
      {
        from.append(key, JSON.stringify(value));
        continue;
      }
      from.append(key, value);
    }
  }

  return from;
}