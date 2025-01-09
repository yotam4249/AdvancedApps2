import request from "supertest"
import initApp from"../server"
import mongoose from "mongoose"
import commentModel from "../models/comments_model"
import {Express} from "express"
import userModel, { iUser } from "../models/users_model";

let app:Express;

type User=iUser & {
    accessToken?:string
    refreshToken?:string
}
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
}

beforeAll(async ()=>{
    app = await initApp()
    await commentModel.deleteMany()
    await userModel.deleteMany();
    await request(app).post("/auth/register").send(testUser);
    const res = await request(app).post("/auth/login").send({
        email:testUser.email,
        password:testUser.password
    });
    testUser.accessToken = res.body.accessToken;
    testUser._id = res.body._id;
    expect(testUser.accessToken).toBeDefined();
})

afterAll(async ()=>{
    await mongoose.connection.close()
})

const testComment = {
    comment:"Comment title",
    owner:"Yotam",  
    postId:"546a4sdasd"
}

const invalidComment ={
    comment:"asdasd"
}

let commentId = ""

describe("Comments test ",()=>{
    test("Get all comments 1", async ()=>{
        const response = await request(app).get("/comments")
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveLength(0)
    })

    test("Add new comment", async()=>{
        const response = await request(app).post("/comments")
        .set({ authorization: "JWT " + testUser.accessToken })
        .send(testComment)
        expect(response.statusCode).toBe(201)
        expect(response.body.comment).toBe("Comment title")
        expect(response.body.owner).toBe("Yotam")
        commentId = response.body._id
    })

    test("Adding invalid comment",async()=>{
        const response = await request(app).post("/comments").send(invalidComment)
        expect(response.statusCode).not.toBe(201)
    })

    test("Get comment by owner",async ()=>{
        const response = await request(app).get("/comments?ower="+testComment.owner)
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveLength(1)
        expect(response.body[0].owner).toBe(testComment.owner)
    })

    test("Get comment by ID",async ()=>{
        const response = await request(app).get("/comments/"+commentId)
        expect(response.statusCode).toBe(200)
        expect(response.body._id).toBe(commentId)
    })
    
})