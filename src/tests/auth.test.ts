import request from "supertest"
import initApp from"../server"
import mongoose from "mongoose"
import postModel from "../models/posts_model"
import {Express} from "express"
import userModel, { iUser } from "../models/users_model"

let app:Express;


beforeAll(async ()=>{
    app = await initApp()
    await userModel.deleteMany()
    await postModel.deleteMany()
})

afterAll(async ()=>{
    await mongoose.connection.close()
    
})

type User=iUser & {token?:string}

const baseUrl = "/auth"
const testUser:User = {
    email:"test@user.com",
    password:"testpassword",


}
describe("Auth tests ",()=>{
    test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send(testUser)
        expect(response.statusCode).toBe(200)
    })

    test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send({
            email:"jkashlfk"
        })
        expect(response.statusCode).not.toBe(200)
    })
    test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send(testUser)
        expect(response.statusCode).not.toBe(200)
    })

    test("Auth test login", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send(testUser)
        expect(response.statusCode).toBe(200)
        const token = response.body.token
        expect(token).toBeDefined()
        expect(response.body._id).toBeDefined()
        testUser.token = token
        testUser._id = response.body._id
    })

    test("Auth test me", async ()=>{
        const response = await request(app).post("/posts").send({
            title:"Test register",
            content:"test content",
            owner:"Yotam"
        })
        expect(response.statusCode).not.toBe(201)

        const response2 = await request(app).post("/posts").set(
            {authorization: "JWT "+ testUser.token}
        )
        .send({
            title:"Test register",
            content:"test content",
            owner:"Yotam"
        })
        expect(response2.statusCode).toBe(201)
    })
})