
import moongose from "mongoose"

export interface iPost {
    title:string,
    content : string,
    owner: string
}

const postSchema= new moongose.Schema<iPost>({
    title: {type :String,
        required:true,
    },
    content: {type :String,
        required:true,
    },
    owner: {type :String,
        required:true,
    }
});
const postModel=moongose.model<iPost>('Post',postSchema)

export default postModel;