
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

    async update(req: Request, res: Response): Promise<Response<any> | undefined> {
        try {
            const data = req.body;
            const updatedComment = await this.model.findByIdAndUpdate(
                req.params.id,
                { content: data.content, owner: data.owner },
                { new: true }
            );
    
            if (!updatedComment) {
                return res.status(404).json({ message: "Comment not found" });
            }
    
            return res.status(200).json(updatedComment);
        } catch (error) {
            return res.status(400).json(error);
        }
    }
}    

export default new CommentsController();