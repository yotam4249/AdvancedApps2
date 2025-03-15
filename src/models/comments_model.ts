
import moongose from "mongoose"

export interface iComment {
    comment:string,
    postId : string,
    owner: string,
    likes:number

}
const commentSchema= new moongose.Schema<iComment>({
    comment: {type :String,
        required:true,
    },
    owner: {type :String,
        required:true,
    },
    postId: {type :String,
        required:true,
    }, 
    likes: {type :Number,
        default:0
    }
});

const commentModel=moongose.model<iComment>('Comments',commentSchema)

export default commentModel;