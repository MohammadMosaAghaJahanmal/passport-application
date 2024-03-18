const NewForm = require("../../model/NewForm");

const createNewForm = async (req, res) => {
    try {
        const newForm = await NewForm.create(req.body);
        res.json({ status: "success", data: newForm });
    } catch (err) {
        res.json({ status: "failure", message: err.message });
    }
};

const getAllNewForms = async (req, res) => {
    try {
        const allNewForms = await NewForm.findAll();
        res.json({ status: "success", data: allNewForms });
    } catch (err) {
        res.json({ status: "failure", message: err.message });
    }
};

const updateNewForm = async (req, res) => {
    const { uxCode } = req.params;
    try {
        const [updatedRowsCount] = await NewForm.update(req.body, {
            where: { uxCode },
        });
        if (updatedRowsCount > 0) {
            res.json({ status: "success", message: "Form updated successfully" });
        } else {
            res.json({ status: "failure", message: "Form not found or already up to date" });
        }
    } catch (err) {
        res.json({ status: "failure", message: err.message });
    }
};

const deleteNewForm = async (req, res) => {
    const { uxCode } = req.params;
    try {
        const deletedRowCount = await NewForm.destroy({
            where: { uxCode },
        });
        if (deletedRowCount > 0) {
            res.json({ status: "success", message: "Form deleted successfully" });
        } else {
            res.json({ status: "failure", message: "Form not found" });
        }
    } catch (err) {
        res.json({ status: "failure", message: err.message });
    }
};

module.exports = { createNewForm, getAllNewForms, updateNewForm, deleteNewForm };
