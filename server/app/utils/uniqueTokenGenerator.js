function generateUniqueCode(length) {
  // const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charset = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      code += charset[randomIndex];
  }
  return code;
}

// const uniqueCode = generateUniqueCode(10);







function generateUniqueCodes(count, howLong, objData) {
  const uniqueNumbers = new Set();
  while (uniqueNumbers.size < count) {
      const number = generateUniqueCode(howLong)
      uniqueNumbers.add({...objData,token: number});
  }
  return Array.from(uniqueNumbers);
}


module.exports = generateUniqueCodes;