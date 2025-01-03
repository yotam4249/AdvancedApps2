
import moongose from "mongoose"

export interface iComment {
    comment:string,
    postId : string,
    owner: string
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
    }
});

const commentModel=moongose.model<iComment>('Comments',commentSchema)

export default commentModel;