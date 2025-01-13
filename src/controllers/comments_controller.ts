
import { Request,Response } from "express";
import commentModel,{iComment} from "../models/comments_model"
import { BaseController } from "./base_controller"

class CommentsController extends BaseController<iComment>{
    constructor(){
        super(commentModel)
    }

    async create(req:Request,res:Response){
        const userId = req.params.userId
        const comment = {
            ...req.body,
            postId:userId
        }
        req.body = comment
        super.create(req,res)            
    };
    
}

export default new CommentsController();