
import { Request,Response } from "express";
import commentModel,{iComment} from "../models/comments_model"
import { BaseController } from "./base_controller"

class CommentsController extends BaseController<iComment>{
    constructor(){
        super(commentModel)
    }

    async create(req:Request,res:Response){
        const userId = req.body.postId
        const comment = {
            ...req.body,
            postId:userId
        }
        req.body = comment
        super.create(req,res)            
    };

    async update(req:Request,res:Response){
        const data = req.body
        await this.model.findByIdAndUpdate(req.params.id,{comment:data.comment})
        res.send("Item replaced")
    }
    
}

export default new CommentsController();