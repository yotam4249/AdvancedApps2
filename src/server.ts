import express,{ Express }  from "express"
const app = express();
import dotenv  from "dotenv" 
dotenv.config();
import mongoose from "mongoose"
import postRoutes from "./routes/posts_routes";
import commentsRoutes from "./routes/comments_routes"
import bodyParser from "body-parser";
import authRoutes from "./routes/auth_routes"

const initApp = ()=>{
return new Promise<Express>((resolve,reject)=>{

    const db=mongoose.connection
    db.on('error',error=>{console.error(error)})
    db.once('open',()=>console.log('connected to mongo'))

    if(process.env.DATABASE_URL === undefined)
    {
        console.error("DATABASE_URL isn't set")
        reject()
    }
    else{
        mongoose.connect(process.env.DATABASE_URL).then(()=>{

            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({extended:true}));
        
            app.use("/posts",postRoutes);
            app.use("/comments",commentsRoutes);
            app.use("/auth",authRoutes)
            resolve(app)
    
        })
    }
    
    })
}


export default initApp;

