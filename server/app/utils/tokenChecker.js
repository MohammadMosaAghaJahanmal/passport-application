const tokenChecker = async (req, res, next) =>
{
    let { userId } = req.auth;
    if (userId?.admin)
        return next()

    if (userId?.tokenId && (req?.auth?.exp > Date.now() / 1000))
        return next()
        
    return res.json({
        status: "failure",
        message: "You Are Not Authorized"
    })
}

module.exports = tokenChecker