import express,{ Express,NextFunction,Request,Response}  from "express"
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
import fileRouter from "./routes/file_routes"
import cors from "cors";
import path from "path";


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Content-Security-Policy",
        "frame-ancestors 'self' https://accounts.google.com");
    credentials: true;
    next();
})
// app.use((req: Request, res: Response, next: NextFunction): void => {
//     res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ Allow all origins
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"); // ✅ Explicitly allow PATCH
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     if (req.method === "OPTIONS") {
//         res.sendStatus(200); // ✅ Correct way to handle preflight requests
//     } else {
//         next(); // ✅ Ensure `next()` is called for other requests
//     }
// });
app.use(cors());
const storagePath = "C:\\Users\\eliav\\myapp1\\Task2EY\\AdvancedApps2\\storage"; 

//  app.use(cors({
//      origin: "http://localhost:5173", // Allow frontend access
//      methods: "GET,POST,PUT,DELETE", // Allow common HTTP methods
//      allowedHeaders: "Content-Type,Authorization", // Allow necessary headers
//      credentials: true // Needed if using authentication (JWT, cookies, etc.)
//  }));
const delay = (req: Request, res: Response, next: NextFunction) => {
    // const d = new Promise<void>((r) => setTimeout(() => r(), 2000));
    // d.then(() => next());
     next();
  };
//   app.use((req, res, next) => {
//     res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//     res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//     next();
// });
app.use("/posts",delay,postRoutes);
app.use("/comments",delay,commentsRoutes);
app.use("/auth",delay,authRoutes)
app.use("/file",fileRouter)
app.use("/public",express.static("public"));
app.use(express.static("/front"));
app.use('/storage', express.static(storagePath));


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

