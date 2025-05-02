import jwt from "jsonwebtoken"

// const auth = (req, res, next) => {
//     const authHeader = req.header("Authorization")
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ error: "No token provided" })
//     }

//     const token = authHeader.replace("Bearer ", "").trim()
//      if(!token)
//         return res.status(401).json({ msg: "No token, auth denied" })

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_TOKEN)
//         console.log(decoded)
//         req.user = decoded

//         next()
//     } catch (error) {
//         res.status(401).json({ msg: "Invalid Token" })
//     }
// }

const auth = (req, res, next) => {
    const authHeader = req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No token provided")
        return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.replace("Bearer ", "").trim()
    console.log("Received token:", token)

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Decoded token:", decoded)
        req.user = decoded
        next()
    } catch (error) {
        console.error("Token verification failed:", error.message)
        res.status(401).json({ msg: "Invalid Token" })
    }
}


export default auth