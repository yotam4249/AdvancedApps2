
import { Request,Response } from "express";
import { Model } from "mongoose";


export class BaseController<T>{

    model: Model<T>
    constructor(model:Model<T>)
    {
        this.model = model
    }

    async getAll(req:Request,res:Response){
        const ownerFilter = req.query.owner;
    try {
      if (ownerFilter) {
        const posts = await this.model.find({ owner: ownerFilter });
        res.status(200).send(posts);
      } else {
        const posts = await this.model.find();
        res.status(200).send(posts);
      }
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  };
    
    async getById(req: Request, res: Response) {
        try {
            const item = await this.model.findById(req.params.id);
            if (item != null) {
                res.status(200).send(item);
            } else {
                res.status(404).send("not found");
            }
        } catch (error) {
            res.status(400).send(error);
        }
    };

    async getBySender(req:Request,res:Response){
        const { owner } = req.query;
        if(!owner){
            const data = await this.model.find()
            res.status(200).send(data)
        }
        else
        {
            const data = await this.model.find({owner:owner})
            res.status(200).send(data)
        }

    };

    async create(req:Request,res:Response){
    const body= req.body;
    try{
        const item= await this.model.create(body);
        res.status(201).send(item);
        }catch(error){res.status(400).send(error)};     

    };

    async deleteById(req:Request,res:Response){
        await this.model.findByIdAndDelete(req.params.id)
        res.send("item deleted by id")
    };

    async deleteAll(req:Request,res:Response){
        await this.model.deleteMany({})
        res.send("All items deleted from database")
    }

    async update(req:Request,res:Response){
        const data = req.body
        await this.model.findByIdAndUpdate(req.params.id,{title:data.title,content:data.content,owner:data.owner})
        res.send("Item replaced")
    }
}

const createController = <T>(model:Model<T>)=>{
    return new BaseController(model)
}

export default createController
