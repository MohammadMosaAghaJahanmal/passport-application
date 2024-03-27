export default function generateRandomString(length, type) {
  let characters = '';

  if (type === 'en') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  } else if (type === 'ps') {
    characters = 'پبتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
  } else if (type === 'num') {
    characters = '0123456789';
  } else {
    throw new Error('Invalid type. Type must be "en" for English, "ps" for Pashto, or "num" for numbers.');
  }

  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}