
const isExpired = (expiryDate, currentDate = new Date()) =>
{
  expiryDate = new Date(expiryDate);
  currentDate = new Date(currentDate);

  return (currentDate.getDate() < expiryDate.getDate())
}


module.exports = isExpired