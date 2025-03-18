
import moongose from "mongoose"

export interface iPost {
    title:string,
    content : string,
    owner: string,
    likes?: string[],
    imgUrlPost?:string
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
    },
    likes: {
        type: [String],
        default: [],
      },
    imgUrlPost:{
        type:String,
    }
});
const postModel=moongose.model<iPost>('Post',postSchema)

export default postModel;