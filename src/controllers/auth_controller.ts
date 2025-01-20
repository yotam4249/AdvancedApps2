import { NextFunction, Request,Response } from "express"
import userModel from "../models/users_model"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const generateTokens = (_id:string):{accessToken:string,refreshToken:string}| null =>{

    if(!process.env.TOKEN_SECRET)
        {
            return null
        }
    const random = Math.floor(Math.random() * 1000000)
    const accessToken = jwt.sign({
            _id: _id,
            random: random
        },
        process.env.TOKEN_SECRET,
        { expiresIn:process.env.TOKEN_EXPIRES })

    
    const refreshToken = jwt.sign(
        {
            _id:_id , 
            random: random
        },
        process.env.TOKEN_SECRET,
        { expiresIn:process.env.REFRESH_TOKEN_EXPIRES })
        return {
            accessToken,
            refreshToken
        }
}

const register = async(req:Request,res:Response)=>{
    try{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const user = await userModel.create({
            email:req.body.email,
            password:hashedPassword
        })
        res.status(200).send(user)
    }catch(err){
        res.status(400).send(err)
    }
}

const login =  async(req:Request,res:Response)=>{
    try{
        const user = await userModel.findOne({email:req.body.email})
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

export default{
    register,
    login,
    logout,
    refresh
}