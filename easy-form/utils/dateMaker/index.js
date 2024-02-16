

function dateMaker (date)
{
    const newDate = new Date(date);

    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();
    const fullDate = year + "-" + (month < 9 ? "0" + (month + 1) : (month + 1)) + "-" + (day < 9 ? "0" + day : day);

    return fullDate;
};

export default dateMaker;
