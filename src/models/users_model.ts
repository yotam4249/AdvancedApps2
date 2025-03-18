
import moongose from "mongoose"

export interface iUser {
    username:string,
    email:string,
    password : string,
    _id?:string,
    refreshTokens?:string[],
    imgUrl?:string,
    
}

const userSchema= new moongose.Schema<iUser>({
    email: {type :String,
        required:true,
        unique:true
    },
    password: {type :String,
        default:""
    },
    refreshTokens:{
        type:[String],
        default:[]
    },
    imgUrl:{
        type:String,
    },
    username:{
        type:String,
        required:true
    }
});
const userModel=moongose.model<iUser>('Users',userSchema)

export default userModel;