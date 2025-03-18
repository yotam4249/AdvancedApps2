import { NextFunction, Request,Response } from "express"
import userModel from "../models/users_model"
import bcrypt from 'bcrypt'
import jwt , {SignOptions} from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { get } from "mongoose"

const client = new OAuth2Client();


 export const  generateTokens = (_id:string):{accessToken:string,refreshToken:string}| null =>{

    const JWT_SECRET = process.env.TOKEN_SECRET;
    const ACCESS_TOKEN_EXPIRES = process.env.TOKEN_EXPIRES ? process.env.TOKEN_EXPIRES.trim() : "15m";
    const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES ? process.env.REFRESH_TOKEN_EXPIRES.trim() : "7d"; 

    if (!JWT_SECRET) {
        console.error("Missing TOKEN_SECRET in .env file");
        return null;
    }
    const random = Math.floor(Math.random() * 1000000);
    const accessTokenOptions: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"] };
    const refreshTokenOptions: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"] };
    const accessToken = jwt.sign(
        { _id, random }, 
        JWT_SECRET, 
        accessTokenOptions
    );

    const refreshToken = jwt.sign(
        { _id, random }, 
        JWT_SECRET, 
        refreshTokenOptions
    );

    return { accessToken, refreshToken };
}

const register = async(req:Request,res:Response)=>{
    try{
        console.log("2")
        let flag = true;
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        if(!req.body.imgUrl)
        {
            req.body.imgUrl = "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
        }
        
        const existingUsername = await userModel.findOne({username:req.body.username})
        const existingEmail = await userModel.findOne({email:req.body.email})
        
        console.log("3")
        let user = {
            username:"",
                email:"",
        };
        if(existingEmail== null || existingUsername == null)
        {
            console.log("3.1")
            user = await userModel.create({
                username:req.body.username,
                email:req.body.email,
                password:hashedPassword,
                imgUrl:req.body.imgUrl
            })
             
            console.log("4")
        }
        else{
            user.email = ""
            user.username = ""
            console.log("5")
        }
        console.log(user)
        res.status(200).send(user)
    }catch(err){
        res.status(400).send(err)
    }
}

const googleRegister = async(req:Request,res:Response) =>{
    try{
        console.log('3')
        const {credential} = req.body
        if(!credential){
             res.status(400).send('no credential')
        }
        const ticket = await client.verifyIdToken({
            idToken:credential,
            audience:process.env.GOOGLE_CLIENT_ID
        })
        const payload =  ticket.getPayload()
        if(!payload?.email){
            res.status(400).send('Missing email from google')
        }
        else{
            let user = await userModel.findOne({email:payload.email})
            if(user == null){
                let username = payload.name; 
                let existingUser = await userModel.findOne({ username });
                let counter = 1;
                while (existingUser) {
                    username = `${payload.name}${counter}`;
                    existingUser = await userModel.findOne({ username });
                    counter++;
                }
                user = await userModel.create({
                    username:payload.name,
                    email: payload.email,
                    password: "", 
                    imgUrl: payload.picture || "",
                });
                const tokens = generateTokens(user._id.toString());
                res.json({
                    username:user.username,
                    email: user.email,
                    id: user._id,
                    imgUrl: "",    
                    ...tokens,
                });
            }
            else{
                res.json({
                    username:"",
                    email:"",
                    id: "",
                    imgUrl: "", 
                    
                })
            }
            
        }
    }catch(err){
        console.error("Google Sign-In Error:", err);
        res.status(400).json({ message: "Authentication failed" });
    }
}

const login =  async(req:Request,res:Response)=>{
    try{
        const user = await userModel.findOne({username:req.body.username})
        if(!user){
            res.status(400).send('bad info')
            return
        }
        const validPassword = await bcrypt.compare(req.body.password,user.password)
        if(!validPassword)
        {
            res.status(400).send('bad info')
            return
        }
        
        const tokens = generateTokens(user._id.toString())

        if(!tokens){
            res.status(400).send('couldnt generate tokens')
            return
        }

        if(user.refreshTokens == undefined || user.refreshTokens == null )
        {
            user.refreshTokens = [""];
            await user.save()
        }
        user.refreshTokens.push(tokens.refreshToken)
        await user.save()

        res.status(200).send({
                refreshToken:tokens.refreshToken,
                accessToken:tokens.accessToken,
                _id:user._id
            })
    }catch(err){
        res.status(400).send(err)
    }
}

const googleLogIn=async(req:Request,res:Response) =>{
    try{
        const {credential} = req.body
        if(!credential){
             res.status(400).send('no credential')
        }
        const ticket = await client.verifyIdToken({
            idToken:credential,
            audience:process.env.GOOGLE_CLIENT_ID
        })
        const payload =  ticket.getPayload()
        if(!payload?.email){
            res.status(400).send('Missing email from google')
        }
        else{
            let user = await userModel.findOne({email:payload.email})
            if(user != null){
                const tokens = generateTokens(user._id.toString());
                res.json({
                    username:user.username,
                    email:user.email,
                    id:user._id,
                    imgUrl:user.imgUrl,
                    ...tokens
                })
            }
            else{
                res.json({
                    username:"",
                    email:"",
                    id: "",
                    imgUrl: "", 
                    tokens:""
            })
            }
        }
    }catch(err){
        console.error("Google Sign-In Error:", err);
        res.status(400).json({ message: "Authentication failed" });
    }
}

const logout = async(req:Request,res:Response)=>{
    const refreshToken = req.body.refreshToken
    if(!refreshToken)
    {
        res.status(400).send("no token")
        return
    }

    if(!process.env.TOKEN_SECRET)
    {
        res.status(400).send("no token secret")
        return
    }
    jwt.verify(refreshToken,process.env.TOKEN_SECRET,async (err:any,data:any)=>{
        if(err){
            res.status(400).send("no token secret")
            return
        }
        try{
            const payload = data as Payload
            const user = await userModel.findOne({_id:payload._id})
            if(!user){
                res.status(400).send("no id")
                return
            }
            if(!user.refreshTokens){
                user.refreshTokens = undefined
                await user.save()
                res.status(400).send("no id")
                return
            }
            if(!user.refreshTokens.includes(refreshToken))
            {
                user.refreshTokens = undefined
                await user.save()
                res.status(400).send("no id")
                return
            }
            user.refreshTokens = user.refreshTokens.filter((token)=> token !== refreshToken)
            await user.save()
            res.status(200).send("logged out")
        }catch(err){
            res.status(400).send(err)
            return
        }
    })
}

const refresh = async(req:Request,res:Response)=>{
    const refreshToken = req.body.refreshToken
    if(!refreshToken)
    {
        res.status(400).send("bad token")
        return
    }
    if(!process.env.TOKEN_SECRET)
    {
        res.status(400).send("bad token")
        return
    }

    jwt.verify(refreshToken,process.env.TOKEN_SECRET, async (err:any,data:any)=>{
        if(err){
            res.status(400).send("bad token")
            return
        }
        try{
            const payload = data as Payload
            const user = await userModel.findOne({_id:payload._id})
            if(!user){
                res.status(400).send("bad token")
                return
            }
            if(!user.refreshTokens || !user.refreshTokens.includes(refreshToken)|| user.refreshTokens == undefined){
                user.refreshTokens = undefined
                await user.save()
                res.status(400).send("bad token")
                return
            }
            const newTokens = generateTokens(user._id.toString())
            if(!newTokens){
                user.refreshTokens = undefined
                await user.save()
                res.status(400).send("bad token")
                return
            }
            if(user.refreshTokens == undefined){
                res.status(400).send("bad token")
                return
            }
            user.refreshTokens = user.refreshTokens.filter((token)=> token !== refreshToken)
            user.refreshTokens.push(newTokens.refreshToken)
            await user.save()
            res.status(200).send({
                accessToken:newTokens.accessToken,
                refreshToken:newTokens.refreshToken
            })
        }catch(err){
            res.status(400).send(err)
            return
        }
    })
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).send("Internal server error");
    }
}

const getUserByUsername = async (req: Request, res: Response) => {
    try {
        const user = await userModel.find({username:req.query.username});
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).send("Internal server error");
    }
}

type Payload = {
    _id:string
}

export const authMiddleware = (req:Request,res:Response,next:NextFunction)=>{
    const authorization = req.header('authorization')
    const token = authorization && authorization.split(' ')[1]
    if(!token)
    {
        res.status(401).send('Access denied')
        return
    }
    if(!process.env.TOKEN_SECRET)
    {
        res.status(500).send('BAD SECRET')
        return
    }
    jwt.verify(token,process.env.TOKEN_SECRET,(err,payload)=>{
        if(err){
            res.status(401).send('Access denied')
            return
        }
        req.params.userId = (payload as Payload)._id 
        next()
    })


}

const updateUser = async (req:Request,res:Response)=>{
    try{
        const data = req.body.user
        const response = await userModel.findByIdAndUpdate(data._id,
            {
                email:data.email,
                password:data.password,
                username:data.username
            })
        res.status(200).send()
    }
    catch (err) {
    res.status(400).send("Internal server error");
    }
}

export default{
    updateUser,
    getUserByUsername,
    googleLogIn,
    googleRegister,
    register,
    login,
    logout,
    getUserById,
    refresh
}