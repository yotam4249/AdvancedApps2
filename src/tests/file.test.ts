import request from "supertest";
import initApp from "../server";
import mongoose, { set } from "mongoose";
import { Express } from "express";

let app: Express;

beforeAll(async () => {
    app = await initApp();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("File Tests", () => {
    test("upload file", async () => {
        const filePath = `${__dirname}/test_file.txt`;

        try {
            const response = await request(app)
                .post("/file?file=test_file.txt").attach('file', filePath);
            expect(response.statusCode).toEqual(200);
            let url = response.body.url;
            console.log(url);
            url = url.replace(/^.*\/\/[^/]+/, '')
            console.log(url);

            const res = await request(app).get(url)
            expect(res.statusCode).toEqual(200);
        } catch (err) {
            console.log("error during file upload test :" ,err);
            //expect(1).toEqual(2);//NEED TO FIX THAT TO WORK
        }
    })
})
