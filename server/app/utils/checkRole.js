const checkRole = (isPageAllowed = 'controllerName.create') => async (req, res, next) =>
{
    const {id, role} = req.auth.userId;
    try {
        const userRole = JSON.parse(role)
        if(!userRole)
            return res.json({
                status: "failure",
                message: "Access Denied For This User To Use This Feature"
            });

        if(userRole.pages === "*")
            return next();

        

        return  next()
    } catch (error) {
        return res.json({
            status: "failure",
            message: "Access Denied For This User To Use This Feature"
        });
    }
}



module.exports = checkRole