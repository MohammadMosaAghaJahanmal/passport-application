


const findAll = async (Model, key, value) => {
    const records = await Model.findAll({
        where: {
            [key]: value
        }
    });
    return records;
};

const deleteById = async (id, Model) =>
{
  try {
    // Find the record by ID
    const record = await Model.findByPk(id);

    // If the record is found, delete it
    if (record) {
      await record.destroy();
      return record;
    }
    
  } catch (error) {
    console.error('Error deleting record:', error);
  }
}



async function updateById(id, Model, data) {
  try {
    // Find the record by ID
    const record = await Model.findByPk(id);
    // If the record is found, update its attributes
    if (record) {
      // Update the attributes
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key];
          record[key] = element;
        }
      }
      // Save the changes to the database
      await record.save();
      return {...record.toJSON()};
    }
  } catch (error) {
    console.error('Error updating record:', error);
  }
}

module.exports = {deleteById, updateById, findAll};