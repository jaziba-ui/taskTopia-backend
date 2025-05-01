const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
    const token = req.header("Authorization")
    if(!token)
        return res.status(401).json({ msg: "No token, auth denied" })

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_TOKEN)
        req.user = decoded

        next()
    } catch (error) {
        res.status(401).json({ msg: "Invalid Token" })
    }
}

module.exports = auth