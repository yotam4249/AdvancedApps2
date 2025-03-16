import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import { Express } from "express";
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

let accessToken: string;

const testPost = {
  title: "Test Post",
  content: "Test Content",
  owner: "TestOwner",
  likes: 0,
};
beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany();
  const response = await request(app).post("/auth/register").send(testUser);
  const response2 = await request(app).post("/auth/login").send(testUser);
  expect(response2.statusCode).toBe(200);
  accessToken = response2.body.token;
  testPost.owner = response2.body._id;
  testUser.accessToken = response2.body.accessToken;
  testUser._id = response2.body._id;
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});
let postId = "";
describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
    expect(response.statusCode).not.toBe(400)
  });

  test("Test Create Post", async () => {
    const response = await request(app).post("/posts").set({
      authorization: "JWT " + testUser.accessToken,/////////need to change to accessToken
    }).send(testPost);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    expect(response.body.title).toBe(testPost.title);
    expect(response.body.content).toBe(testPost.content);
    postId = response.body._id;
  });

  test("Test get post by owner", async () => {
    const response = await request(app).get("/posts/?owner=" + testUser._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Test Post");
    expect(response.body[0].content).toBe("Test Content");
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
  });

  test("Test Create Post 2", async () => {
    const response = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "Test Post 2",
        content: "Test Content 2",
        owner: "TestOwner2",
      });
    expect(response.statusCode).toBe(201);
  });

  test("Posts test get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete Post", async () => {
    const response = await request(app).delete("/posts/" + postId)
      .set({ authorization: "JWT " + testUser.accessToken });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).get("/posts/" + postId);
    expect(response2.statusCode).toBe(404);
  });

  test("Delete Post by id",async ()=>{
    jest.spyOn(postModel, "findByIdAndDelete").mockRejectedValue(new Error("Database error"));
  const response = await request(app)
      .delete("/posts/"+postId)
      .set({ authorization: "JWT " + testUser.accessToken })
      .send(testPost);
  expect(response.statusCode).toBe(400);
  jest.restoreAllMocks();
})

  test("Test Create Post fail", async () => {
    const response = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        content: "Test Content 2",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Update Post by id",async ()=>{
          const response = await request(app).put("/posts/"+postId)
          .set({ authorization: "JWT " + testUser.accessToken })
          .send(testPost)
          expect(response.statusCode).toBe(200)
  })
  test("Update Post by id",async ()=>{
    jest.spyOn(postModel, "findByIdAndUpdate").mockRejectedValue(new Error("Database error"));
  const response = await request(app)
      .put("/posts/"+postId)
      .set({ authorization: "JWT " + testUser.accessToken })
      .send(testPost);
  expect(response.statusCode).toBe(400);
  jest.restoreAllMocks();
})

  test("Delete all Posts",async ()=>{
    const response = await request(app).delete("/posts/")
    .set({ authorization: "JWT " + testUser.accessToken })
    .send(testPost)
    expect(response.statusCode).toBe(200)
})

test("Delete all Posts - force error", async () => {
  jest.spyOn(postModel, "deleteMany").mockRejectedValue(new Error("Database error"));
  const response = await request(app)
      .delete("/posts/")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send(testPost);
  expect(response.statusCode).toBe(400);
  jest.restoreAllMocks();
  });

  test("Force error in getAll and trigger catch block", async () => {
    // Mock the model's find method to throw an error
    jest.spyOn(postModel, "find").mockRejectedValue(new Error("Database error"));
    const response = await request(app)
      .get("/posts/") // Assuming your endpoint is '/posts'
      .set({ authorization: "JWT " + testUser.accessToken })
      .send();
  
    // Test that the response status code is 400 (or the error status you want)
    expect(response.statusCode).toBe(400);
  });


test("Get item by ID - not found", async () => {
  jest.spyOn(postModel, "findById").mockResolvedValue(null);

  const response = await request(app)
      .get("/posts/12345")
      .set({ authorization: "JWT " + testUser.accessToken });

  expect(response.statusCode).toBe(404);
  expect(response.text).toBe("not found");

  jest.restoreAllMocks();
});

test("Get item by ID - Force catch block to trigger (400 error)", async () => {
  const invalidId = "invalid_id"; 
  jest.spyOn(postModel, 'findById').mockRejectedValue(new Error("Database error"));
  const response = await request(app)
    .get(`/posts/${invalidId}`) 
    .set({ authorization: "JWT " + testUser.accessToken }) 
    .send();
  expect(response.statusCode).toBe(400);
});

test("Like a post", async () => {
  
  const response = await request(app)
      .patch(`/posts/${postId}/like`)
      .set({ authorization: "JWT " + testUser.accessToken });

  expect(response.statusCode).toBe(200);
  expect(response.body.likes).toBe(1); // First like
});

test("Like a post again", async () => {
  const response = await request(app)
      .patch(`/posts/${postId}/like`)
      .set({ authorization: "JWT " + testUser.accessToken });

  expect(response.statusCode).toBe(200);
  expect(response.body.likes).toBe(2); // Second like
});

test("Get post likes", async () => {
  const response = await request(app)
      .get(`/posts/${postId}/likes`);

  expect(response.statusCode).toBe(200);
  expect(response.body.likes).toBe(2); // Should match previous test
});

test("Like a non-existent post", async () => {
  const response = await request(app)
      .patch(`/posts/64a5d1c2f4e4b8e3f1a3f6b6/like`) // Random valid ObjectId
      .set({ authorization: "JWT " + testUser.accessToken });

  expect(response.statusCode).toBe(404);
});

test("Get likes for a non-existent post", async () => {
  const response = await request(app)
      .get(`/posts/64a5d1c2f4e4b8e3f1a3f6b6/likes`); // Random valid ObjectId

  expect(response.statusCode).toBe(404);
});

test("Like a post with an invalid ID", async () => {
  const response = await request(app)
      .patch(`/posts/invalidPostId/like`) // Invalid ObjectId format
      .set({ authorization: "JWT " + testUser.accessToken });

  expect(response.statusCode).toBe(404); // Expect 404 (not 400)
});

test("Get likes for a post with an invalid ID", async () => {
  const response = await request(app)
      .get(`/posts/invalidPostId/likes`); // Invalid ObjectId format

  expect(response.statusCode).toBe(404); // Expect 404 (not 400)
});

  
});

