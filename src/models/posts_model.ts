
import moongose from "mongoose"

export interface iPost {
    title:string,
    content : string,
    owner: string,
    likes:number,
    imageUrl?:string
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
    likes: {type :Number,
        default:0
    },
    imageUrl:{
        type:String,
        default:null
    }

});
const postModel=moongose.model<iPost>('Post',postSchema)

export default postModel;