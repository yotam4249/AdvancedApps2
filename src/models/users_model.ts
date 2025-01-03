
import moongose from "mongoose"

export interface iUser {
    email:string,
    password : string,
    _id?:string
}

const userSchema= new moongose.Schema<iUser>({
    email: {type :String,
        required:true,
        unique:true
    },
    password: {type :String,
        required:true,
    },
});
const userModel=moongose.model<iUser>('Users',userSchema)

export default userModel;