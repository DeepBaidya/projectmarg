import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./db/index.js"


dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`server running at port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log(`server not running!`);
})
