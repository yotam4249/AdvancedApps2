
import moongose from "mongoose"

export interface iUser {
    email:string,
    password : string,
    _id?:string
    refreshTokens?:string[]
    imgUrl?:string
}

const userSchema= new moongose.Schema<iUser>({
    email: {type :String,
        required:true,
        unique:true
    },
    password: {type :String,
        required:true,
    },
    //////////aded IMGurl
    imgUrl:{
        type:String,
    },
    refreshTokens:{
        type:[String],
        default:[]
    }
});
const userModel=moongose.model<iUser>('Users',userSchema)

export default userModel;