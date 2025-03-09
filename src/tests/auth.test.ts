import request from "supertest"
import initApp from"../server"
import mongoose from "mongoose"
import postModel from "../models/posts_model"
import {Express} from "express"
import userModel, { iUser } from "../models/users_model"
import * as authController from "../controllers/auth_controller"
import jwt from "jsonwebtoken"
import { Query } from "mongoose"


let app:Express;


beforeAll(async ()=>{
    app = await initApp()
    await userModel.deleteMany()
    await postModel.deleteMany()
})

afterAll(async ()=>{
    await mongoose.connection.close()
    
})
afterEach(() => {
    jest.restoreAllMocks();
  });
  

type User=iUser & {
    accessToken?:string
    refreshToken?:string
}
let originalTokenSecret: string;

const baseUrl = "/auth"
const testUser:User = {
    email:"test@user.com",
    password:"testpassword",

}
describe("Auth tests ",()=>{
    beforeEach(() => {
        // Save the original TOKEN_SECRET
        originalTokenSecret = process.env.TOKEN_SECRET as string;
      });
    
      afterEach(() => {
        // Restore the original TOKEN_SECRET
        process.env.TOKEN_SECRET = originalTokenSecret;
      });
    test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send(testUser)
        expect(response.statusCode).toBe(200)
        expect(response.body.email).toBe(testUser.email);
        
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
    test("Auth test login bad info", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send({
            email:"",
            password:""
        })
        expect(response.statusCode).not.toBe(200)
    })

    test("Auth test login bad info pass", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send({
            email:"test@user.com",
            password:"123456",
        
        })
        expect(response.statusCode).not.toBe(200)
    })


    test("should return 400 if tokens could not be generated", async () => {
        await request(app).post(baseUrl + "/register").send(testUser);
        jest.spyOn(authController, "generateTokens").mockImplementation(() => null as any);
        jest.spyOn(authController, "generateTokens").mockImplementation(() => null);
    
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("couldnt generate tokens");
    
        // Restore the original implementation
        jest.restoreAllMocks();
      });
  
      



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
    
    test("should return 400 if refreshToken is not provided", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({});
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("bad token");
      });
    
      test("should return 400 if TOKEN_SECRET is not set", async () => {
        // Temporarily unset TOKEN_SECRET
        process.env.TOKEN_SECRET = "";
    
        const response = await request(app).post(baseUrl + "/refresh").send({
          refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("bad token");
    
        // Restore the original TOKEN_SECRET
        process.env.TOKEN_SECRET = originalTokenSecret;
      });

      
    
      test("should return 400 if jwt.verify fails", async () => {
        // Mock jwt.verify to simulate an error
        jest.spyOn(jwt, "verify").mockImplementation((token, secret, options, callback) => {
            if (typeof options === 'function') {
                callback = options;
            }
            if (callback) {
                callback(new Error("no token secret") as jwt.VerifyErrors, undefined);
            }
        });
    
        const response = await request(app).post(baseUrl + "/refresh").send({
          refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("bad token");
    
        // Restore the original implementation
        jest.restoreAllMocks();
      });

    //   test("should return 400 if user is not found", async () => {
    //     // Mock jwt.verify to simulate a successful verification
    //     jest.spyOn(jwt, "verify").mockImplementation((token, secret, optionsOrCallback, callback) => {

    //         if (typeof optionsOrCallback === 'function') {
        
    //             callback = optionsOrCallback;
        
    //         }
        
    //         if (callback) {
        
    //             callback(new Error("no token secret") as jwt.VerifyErrors, undefined);
        
    //         }
        
    //     });
    //     // Mock userModel.findOne to return null
    //     jest.spyOn(userModel, "findOne").mockReturnValue({
    //       exec: jest.fn().mockResolvedValue(null)
    //     } as unknown as Query<unknown, unknown, {}, iUser, "findOne", {}>);
    
    //     const response = await request(app).post(baseUrl + "/refresh").send({
    //       refreshToken: undefined
    //     });
    //     expect(response.statusCode).toBe(400);
    //     expect(response.text).toBe("bad token");
    
    //     // Restore the original implementation
    //     jest.restoreAllMocks();
    //   });
      
    test("should return 400 if generateTokens fails", async () => {
        // Mock jwt.verify to simulate a successful verification
        jest.spyOn(jwt, "verify").mockImplementation((token, secret, optionsOrCallback, callback) => {
                  if (typeof optionsOrCallback === 'function') {
                      callback = optionsOrCallback;
                  }
                  if (callback) {
                      callback(null, { _id: testUser._id });
                  }
                });
    
        // Mock userModel.findOne to return a valid user
        jest.spyOn(userModel, "findOne").mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: testUser._id,
            refreshTokens: ["someOldRefreshToken"],
            save: jest.fn().mockResolvedValue(null)
          })
        } as unknown as Query<unknown, unknown, {}, iUser, "findOne", {}>);
    
        // Mock generateTokens to return null
        jest.spyOn(authController, "generateTokens").mockImplementation(() => null);
    
        const response = await request(app).post(baseUrl + "/refresh").send({
          refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
       

    // Restore the original implementation
    jest.restoreAllMocks();
  });

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

    test("Logout bad token", async ()=>{
        const response = await request(app).post(baseUrl+"/logout").send({
            refreshToken:""
        })
        expect(response.statusCode).not.toBe(200)
    })
    test("no token secret", async () => {
        process.env.TOKEN_SECRET = "";
        const response = await request(app).post(baseUrl + "/logout").send({
          refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
      });
    
      
      test("should return 403 if jwt.verify fails", async () => {
        // Mock jwt.verify to simulate an error
        jest.spyOn(jwt, "verify").mockImplementation((token, secret, options, callback) => {
            if (typeof options === 'function') {
                callback = options;
            }
            if (callback) {
                callback(new Error("no token secret") as jwt.VerifyErrors, undefined);
            }
        });
        const response = await request(app).post(baseUrl + "/logout").send({
          refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("no token secret");
    
        // Restore the original implementation
        jest.restoreAllMocks();
      });

      test("no id", async () => {
        // Mock userModel.findOne to return null
        jest.spyOn(userModel, "findOne").mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);
    
        const response = await request(app).post(baseUrl + "/logout").send({
          refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
       
    
        // Restore the original implementation
        jest.restoreAllMocks();
      });

      test("no id", async () => { 
        const response = await request(app).post(baseUrl + "/logout").send({
            refreshToken: testUser.refreshToken
        });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("no id");
    }
    );

    // test("refreshTokens undefined", async () => {
    //     // Mock userModel.findOne to return a user with refreshTokens as undefined
    //     jest.spyOn(userModel, "findOne").mockReturnValue({
    //       exec: jest.fn().mockResolvedValue({
    //         _id: testUser._id,
    //         refreshTokens: undefined,
    //         save: jest.fn().mockResolvedValue(null)
    //       })
    //     } as unknown as Query<unknown, unknown, {}, iUser, "findOne", {}>);
    
    //     const response = await request(app).post(baseUrl + "/logout").send({
    //       refreshToken: testUser.refreshToken
    //     });
    //     expect(response.statusCode).toBe(400);
    //     expect(response.text).toBe("no id");
    
    //     // Restore the original implementation
    //     jest.restoreAllMocks();
    //   });
    
    
   
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
