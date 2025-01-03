import { NextFunction, Request,Response } from "express"
import userModel from "../models/users_model"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
        if(!process.env.TOKEN_SECRET)
        {
            res.status(500).send('bad token')
            return
        }
        const token = jwt.sign({ _id: user.id },
            process.env.TOKEN_SECRET,
            { expiresIn:process.env.TOKEN_EXPIRES })
            res.status(200).send({token:token,_id:user._id})

    }catch(err){
        res.status(400).send(err)
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

export default{
    register,
    login
}