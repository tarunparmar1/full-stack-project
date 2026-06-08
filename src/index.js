import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path:'./env'
})
connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is runging at PORT : ${ PORT }`);
    })
})
.catch((error) =>{
    console.log("DB conection faild",error);
})