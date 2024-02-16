const errorHandler = async (error, res) =>
{
    const {details} = error;
    const err = {
        // error: {
            message: details[0].message,
            // input: details[0].path[0],
            // value: details[0].context.value,
        // },
        status: "failure"
    };
    return res.json(err)
};

module.exports = errorHandler;