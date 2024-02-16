export default function uniqueId(value = 1000) {
  return ((Math.random() * value) + "").replace(".", "");
}