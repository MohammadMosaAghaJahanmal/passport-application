

const isUnique = async (Model, type, value) =>
{
    const user = await Model.findOne({[type]: value})
    return user === null
}

module.exports = isUnique;