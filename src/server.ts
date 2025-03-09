import express,{ Express }  from "express"
const app = express();
import dotenv  from "dotenv" 
dotenv.config();
import mongoose from "mongoose"
import postRoutes from "./routes/posts_routes";
import commentsRoutes from "./routes/comments_routes"
import bodyParser from "body-parser";
import authRoutes from "./routes/auth_routes"
import swaggerUI from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
    servers: [{url: "http://localhost:"+process.env.PORT,},],

    },
    apis: ["./src/routes/*.ts"],
};
    const specs = swaggerJsDoc(options);
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})
app.use("/posts",postRoutes);
app.use("/comments",commentsRoutes);
app.use("/auth",authRoutes)

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
            resolve(app)
        })
    }
    
    })
}


export default initApp;

