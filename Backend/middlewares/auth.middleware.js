import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

const auth = async (req,res,next)=>{
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            return res.status(401).json({
                message: 'unauthorized!',
                success: false
            })
        }

        const decodeToken = jwt.verify(token,process.env.SECRETE_KEY)
        
        const user = await User.findById(decodeToken?.userId).select("-password ")
    
        if (!user) {
            return res.status(401).json({
                decodeToken,
                user,
                message: 'Suspicious request!',
                success: false
            })
        }
        req.user = decodeToken.userId

        next()
    } catch (err) {
        console.log(err)
    }
}

export default auth