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

type User=iUser & {
    accessToken?:string
    refreshToken?:string
}

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
        const accessToken = response.body.accessToken
        const refreshToken = response.body.refreshToken
        expect(accessToken).toBeDefined()
        expect(refreshToken).toBeDefined()
        expect(response.body._id).toBeDefined()
        testUser.accessToken = accessToken
        testUser.refreshToken = refreshToken
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
            {authorization: "JWT "+ testUser.accessToken}
        )
        .send({
            title:"Test register",
            content:"test content",
            owner:"Yotam"
        })
        expect(response2.statusCode).toBe(201)
    })

    test("Refresh Token", async ()=>{
        const response = await request(app).post(baseUrl+"/refresh").send({
            refreshToken:testUser.refreshToken
        })
        expect(response.statusCode).toBe(200)
        expect(response.body.accessToken).toBeDefined()
        expect(response.body.refreshToken).toBeDefined()
        testUser.accessToken = response.body.accessToken
        testUser.refreshToken = response.body.refreshToken
    })

    test("Logout", async ()=>{
        const response = await request(app).post(baseUrl+"/logout").send({
            refreshToken:testUser.refreshToken
        })
        expect(response.statusCode).toBe(200)
        
    })

    test("Auth test login after logout", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send(testUser)
        expect(response.statusCode).toBe(200)
        const accessToken = response.body.accessToken
        const refreshToken = response.body.refreshToken
        expect(accessToken).toBeDefined()
        expect(refreshToken).toBeDefined()
        expect(response.body._id).toBeDefined()
        testUser.accessToken = accessToken
        testUser.refreshToken = refreshToken
        testUser._id = response.body._id
    })

    test("Refresh token multiple times", async ()=>{
        const oldRefreshToken = testUser.refreshToken
        const response = await request(app).post(baseUrl+"/refresh").send({
            refreshToken:oldRefreshToken
        })
        testUser.accessToken = response.body.accessToken
        testUser.refreshToken = response.body.refreshToken

        expect(response.statusCode).toBe(200)
        const newRefreshToken = response.body.refreshToken

        const response2 = await request(app).post(baseUrl+"/refresh").send({
            refreshToken:oldRefreshToken
        })

        expect(response2.statusCode).not.toBe(200)

        const response3 = await request(app).post(baseUrl+"/refresh").send({
            refreshToken:newRefreshToken
        })
        expect(response3.statusCode).not.toBe(200)

    })

    jest.setTimeout(10000)
    test("Test timeout",async ()=>{
        //login
        const response = await request(app).post(baseUrl+"/login").send(testUser)
        expect(response.statusCode).toBe(200)
        const accessToken = response.body.accessToken
        const refreshToken = response.body.refreshToken
        expect(accessToken).toBeDefined()
        expect(refreshToken).toBeDefined()
        expect(response.body._id).toBeDefined()
        testUser.accessToken = accessToken
        testUser.refreshToken = refreshToken
        testUser._id = response.body._id

        //implement
        await new Promise(resolve => setTimeout(resolve,6000))

        const response2 = await request(app).post("/posts")
        .set({authorization: 'JWT ' + testUser.accessToken})
        .send({
            owner:"yotam",
            title:"testTitle",
            content:"testContent"
        })
        expect(response2.statusCode).not.toBe(201)
        expect(response2.statusCode).not.toBe(200)
    })
})
