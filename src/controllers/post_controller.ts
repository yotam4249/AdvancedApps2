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
}

export default new PostsController()
