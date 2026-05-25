import request from "supertest"
import app from "../app"
import { prisma } from "../database/prisma"
import { hash } from "bcrypt"

describe("E2E Tests", () => {

  beforeEach(async () => {
    await prisma.teamMember.deleteMany()
    await prisma.taskHistory.deleteMany()
    await prisma.task.deleteMany()
    await prisma.team.deleteMany()
    await prisma.user.deleteMany()
  })

  // CREATE USER
  describe("Create User", () => {
    it("should create a new user", async () => {
      const response = await request(app).post("/users").send({
        name: "Leonardo",
        email: "leo@test.com",
        password: "123456"
      })

      expect(response.status).toBe(201)
      expect(response.body.user).toHaveProperty("id")
    })

    it("should not create user with duplicate email", async () => {
      await request(app).post("/users").send({
        name: "Leonardo",
        email: "leo@test.com",
        password: "123456"
      })

      const response = await request(app).post("/users").send({
        name: "Leonardo",
        email: "leo@test.com",
        password: "123456"
      })

      expect(response.status).toBe(409)
    })
  })

  // LOGIN
  describe("Login User", () => {
    it("should return a token", async () => {
      await request(app).post("/users").send({
        name: "Leonardo",
        email: "leo@test.com",
        password: "123456"
      })

      const response = await request(app).post("/login").send({
        email: "leo@test.com",
        password: "123456"
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("user")
    })

    it("should not login with wrong password", async () => {
      await request(app).post("/users").send({
        name: "Leonardo",
        email: "leo@test.com",
        password: "123456"
      })

      const response = await request(app).post("/login").send({
        email: "leo@test.com",
        password: "wrongpassword"
      })

      expect(response.status).toBe(401)
    })
  })

  // TEAM
  describe("Teams", () => {

    it("should not create team without token", async () => {
      const response = await request(app).post("/team").send({
        name: "Team X",
        description: "Test team"
      })

      expect(response.status).toBe(401)
    })

    it("should not create team if user is not admin", async () => {
      await request(app).post("/users").send({
        name: "User",
        email: "user@test.com",
        password: "123456"
      })

      const login = await request(app).post("/login").send({
        email: "user@test.com",
        password: "123456"
      })

      const token = login.body.token

      const response = await request(app)
        .post("/team")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Team X",
          description: "Test"
        })

      expect(response.status).toBe(403)
    })

    it("should create team if user is admin", async () => {
      const hashedPassword = await hash("123456", 8)

      const admin = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@test.com",
          password: hashedPassword,
          role: "admin"
        }
      })

      const login = await request(app).post("/login").send({
        email: "admin@test.com",
        password: "123456"
      })

      const token = login.body.token

      const response = await request(app)
        .post("/team")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Team Admin",
          description: "Admin team"
        })

        console.log(response.body)

      expect(response.status).toBe(201)
      expect(response.body.team).toHaveProperty("id")
    })
  })

  // TASK
describe("Tasks", () => {

  it("should not create a task without token", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Task 1",
      description: "Test",
      priority: "high",
      teamId: "fake-id"
    })

    expect(response.status).toBe(401)
  })

  it("should create a task", async () => {
    const hashedPassword = await hash("123456", 8)

    // ✅ cria admin
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin"
      }
    })

    // ✅ login
    const login = await request(app).post("/login").send({
      email: "admin@test.com",
      password: "123456"
    })

    const token = login.body.token

    // ✅ cria team
    const team = await prisma.team.create({
      data: {
        name: "Team A",
        description: "Test"
      }
    })

    // ✅ cria task
    const response = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 1",
        description: "Test Task",
        status: "pending",
        priority: "high",
        teamId: team.id
      })

    expect(response.status).toBe(201)
    expect(response.body.task).toHaveProperty("id")
  })

  it("should list tasks", async () => {
    const hashedPassword = await hash("123456", 8)

    const user = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin"
      }
    })

    const login = await request(app).post("/login").send({
      email: "admin@test.com",
      password: "123456"
    })

    const token = login.body.token

    const team = await prisma.team.create({
      data: {
        name: "Team A",
        description: "Test"
      }
    })

    await prisma.task.create({
      data: {
        title: "Task 1",
        description: "Test",
        status: "pending",
        priority: "high",
        teamId: team.id,
        assignedTo: user.id
      }
    })

    const response = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.tasks).toBeInstanceOf(Array)
  })

  it("should update task status", async () => {
    const hashedPassword = await hash("123456", 8)

    const user = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin"
      }
    })

    const login = await request(app).post("/login").send({
      email: "admin@test.com",
      password: "123456"
    })

    const token = login.body.token

    const team = await prisma.team.create({
      data: {
        name: "Team A",
        description: "Test"
      }
    })

    const task = await prisma.task.create({
      data: {
        title: "Task 1",
        description: "Test",
        status: "pending",
        priority: "high",
        teamId: team.id,
        assignedTo: user.id
      }
    })

    const response = await request(app)
      .patch(`/tasks/${task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "completed"
      })

    expect(response.status).toBe(200)
  })

  it("should delete a task", async () => {
    const hashedPassword = await hash("123456", 8)

    const user = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin"
      }
    })

    const login = await request(app).post("/login").send({
      email: "admin@test.com",
      password: "123456"
    })

    const token = login.body.token

    const team = await prisma.team.create({
      data: {
        name: "Team A",
        description: "Test"
      }
    })

    const task = await prisma.task.create({
      data: {
        title: "Task 1",
        description: "Test",
        status: "pending",
        priority: "high",
        teamId: team.id,
        assignedTo: user.id
      }
    })

    const response = await request(app)
      .delete(`/tasks/${task.id}`)
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(200)
  })
})

})