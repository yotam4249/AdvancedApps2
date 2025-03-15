
import { Request,Response } from "express";
import mongoose, { Model } from "mongoose";


export class BaseController<T>{

    model: Model<T>
    constructor(model:Model<T>)
    {
        this.model = model
    }

    
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
        try{
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
        }catch(err){res.status(400).send(err)}

    };

    async create(req:Request,res:Response){
    const body= req.body;
    try{
        const item= await this.model.create(body);
        res.status(201).send(item);
        }catch(error){res.status(400).send(error)};     

    };

    async deleteById(req:Request,res:Response){
        try{
        await this.model.findByIdAndDelete(req.params.id)
        res.send("item deleted by id")
        }
        catch(err){res.status(400).send(err)};
    };

    async deleteAll(req:Request,res:Response){
        try{
        await this.model.deleteMany({})
        res.send("All items deleted from database")
        }
        catch(error){res.status(400).send(error)}
    }

    async update(req:Request,res:Response){
        try{
        const data = req.body
        await this.model.findByIdAndUpdate(req.params.id,{title:data.title,content:data.content,owner:data.owner})
        res.send("Item replaced")
        }
        catch(error){res.status(400).send(error)}
    }

    async like(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`❌ Invalid ObjectId format: ${id}`);
            res.status(404).send({ message: "Item not found" });
            return;
        }

        const item = await this.model.findById(id);
        if (!item) {
            console.error(`❌ Post not found: ${id}`);
            res.status(404).send({ message: "Item not found" });
            return;
        }

        if ((item as any).likes === undefined) {
            console.error(`❌ Likes not supported for this model: ${id}`);
            res.status(400).send({ message: "Likes not supported for this model" });
            return;
        }

        (item as any).likes += 1;

        // 🔥 FIX: Ensure `save()` is awaited before responding
        await item.save();

        console.log(`✅ Post ${id} liked successfully! Total likes: ${(item as any).likes}`);

        res.send({ message: "Liked successfully!", likes: (item as any).likes });
    } catch (error) {
        console.error("❌ Error in like method:", error);
        res.status(500).send({ message: "Internal server error", error });
    }
}

    
    async getLikes(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
    
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.error(`Invalid ObjectId format: ${id}`);
                res.status(404).send({ message: "Item not found" });
                return;
            }
    
            const item = await this.model.findById(id);
            if (!item) {
                console.error(`Post not found: ${id}`);
                res.status(404).send({ message: "Item not found" });
                return;
            }
    
            if ((item as any).likes === undefined) {
                console.error(`Likes not supported for this model: ${id}`);
                res.status(400).send({ message: "Likes not supported for this model" });
                return;
            }
    
            res.send({ likes: (item as any).likes });
        } catch (error) {
            console.error("❌ Error in getLikes method:", error);
            res.status(500).send({ message: "Internal server error", error });
        }
    }
    
    
    
}

const createController = <T>(model:Model<T>)=>{
    return new BaseController(model)
}

export default createController
