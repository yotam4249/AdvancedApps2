import { Request,Response } from "express";
import postModel ,{ iPost } from "../models/posts_model"
import {BaseController} from "./base_controller"


class PostsController extends BaseController<iPost>{
    constructor(){
        super(postModel)
    }

    async create(req:Request,res:Response){
        const userId = req.params.userId
        const post = {
            ...req.body,
            owner:userId,
            imageUrl: req.body.imageUrl || null,
        }
        req.body = post
        super.create(req,res)            
    };

    async update(req:Request,res:Response)
    {
        try{
            const data = req.body
            await this.model.findByIdAndUpdate(req.params.id,{title:data.title,content:data.content,owner:data.owner,likes:data.likes,imgUrlPost:data.imgUrlPost})
            res.send("Item replaced")
            console.log(data.imgUrlPost)
            }
            catch(error){res.status(400).send(error)}
    }
}

export default new PostsController()
