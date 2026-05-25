"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../database/prisma");
const bcrypt_1 = require("bcrypt");
describe("E2E Tests", () => {
    beforeEach(async () => {
        await prisma_1.prisma.teamMember.deleteMany();
        await prisma_1.prisma.taskHistory.deleteMany();
        await prisma_1.prisma.task.deleteMany();
        await prisma_1.prisma.team.deleteMany();
        await prisma_1.prisma.user.deleteMany();
    });
    // CREATE USER
    describe("Create User", () => {
        it("should create a new user", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Leonardo",
                email: "leo@test.com",
                password: "123456"
            });
            expect(response.status).toBe(201);
            expect(response.body.user).toHaveProperty("id");
        });
        it("should not create user with duplicate email", async () => {
            await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Leonardo",
                email: "leo@test.com",
                password: "123456"
            });
            const response = await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Leonardo",
                email: "leo@test.com",
                password: "123456"
            });
            expect(response.status).toBe(409);
        });
    });
    // LOGIN
    describe("Login User", () => {
        it("should return a token", async () => {
            await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Leonardo",
                email: "leo@test.com",
                password: "123456"
            });
            const response = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "leo@test.com",
                password: "123456"
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("user");
        });
        it("should not login with wrong password", async () => {
            await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Leonardo",
                email: "leo@test.com",
                password: "123456"
            });
            const response = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "leo@test.com",
                password: "wrongpassword"
            });
            expect(response.status).toBe(401);
        });
    });
    // TEAM
    describe("Teams", () => {
        it("should not create team without token", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/team").send({
                name: "Team X",
                description: "Test team"
            });
            expect(response.status).toBe(401);
        });
        it("should not create team if user is not admin", async () => {
            await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "User",
                email: "user@test.com",
                password: "123456"
            });
            const login = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "user@test.com",
                password: "123456"
            });
            const token = login.body.token;
            const response = await (0, supertest_1.default)(app_1.default)
                .post("/team")
                .set("Authorization", `Bearer ${token}`)
                .send({
                name: "Team X",
                description: "Test"
            });
            expect(response.status).toBe(403);
        });
        it("should create team if user is admin", async () => {
            const hashedPassword = await (0, bcrypt_1.hash)("123456", 8);
            const admin = await prisma_1.prisma.user.create({
                data: {
                    name: "Admin",
                    email: "admin@test.com",
                    password: hashedPassword,
                    role: "admin"
                }
            });
            const login = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "admin@test.com",
                password: "123456"
            });
            const token = login.body.token;
            const response = await (0, supertest_1.default)(app_1.default)
                .post("/team")
                .set("Authorization", `Bearer ${token}`)
                .send({
                name: "Team Admin",
                description: "Admin team"
            });
            console.log(response.body);
            expect(response.status).toBe(201);
            expect(response.body.team).toHaveProperty("id");
        });
    });
    // TASK
    describe("Tasks", () => {
        it("should not create a task without token", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/tasks").send({
                title: "Task 1",
                description: "Test",
                priority: "high",
                teamId: "fake-id"
            });
            expect(response.status).toBe(401);
        });
        it("should create a task", async () => {
            const hashedPassword = await (0, bcrypt_1.hash)("123456", 8);
            // ✅ cria admin
            await prisma_1.prisma.user.create({
                data: {
                    name: "Admin",
                    email: "admin@test.com",
                    password: hashedPassword,
                    role: "admin"
                }
            });
            // ✅ login
            const login = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "admin@test.com",
                password: "123456"
            });
            const token = login.body.token;
            // ✅ cria team
            const team = await prisma_1.prisma.team.create({
                data: {
                    name: "Team A",
                    description: "Test"
                }
            });
            // ✅ cria task
            const response = await (0, supertest_1.default)(app_1.default)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                title: "Task 1",
                description: "Test Task",
                status: "pending",
                priority: "high",
                teamId: team.id
            });
            expect(response.status).toBe(201);
            expect(response.body.task).toHaveProperty("id");
        });
        it("should list tasks", async () => {
            const hashedPassword = await (0, bcrypt_1.hash)("123456", 8);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: "Admin",
                    email: "admin@test.com",
                    password: hashedPassword,
                    role: "admin"
                }
            });
            const login = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "admin@test.com",
                password: "123456"
            });
            const token = login.body.token;
            const team = await prisma_1.prisma.team.create({
                data: {
                    name: "Team A",
                    description: "Test"
                }
            });
            await prisma_1.prisma.task.create({
                data: {
                    title: "Task 1",
                    description: "Test",
                    status: "pending",
                    priority: "high",
                    teamId: team.id,
                    assignedTo: user.id
                }
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.tasks).toBeInstanceOf(Array);
        });
        it("should update task status", async () => {
            const hashedPassword = await (0, bcrypt_1.hash)("123456", 8);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: "Admin",
                    email: "admin@test.com",
                    password: hashedPassword,
                    role: "admin"
                }
            });
            const login = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "admin@test.com",
                password: "123456"
            });
            const token = login.body.token;
            const team = await prisma_1.prisma.team.create({
                data: {
                    name: "Team A",
                    description: "Test"
                }
            });
            const task = await prisma_1.prisma.task.create({
                data: {
                    title: "Task 1",
                    description: "Test",
                    status: "pending",
                    priority: "high",
                    teamId: team.id,
                    assignedTo: user.id
                }
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                status: "completed"
            });
            expect(response.status).toBe(200);
        });
        it("should delete a task", async () => {
            const hashedPassword = await (0, bcrypt_1.hash)("123456", 8);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: "Admin",
                    email: "admin@test.com",
                    password: hashedPassword,
                    role: "admin"
                }
            });
            const login = await (0, supertest_1.default)(app_1.default).post("/login").send({
                email: "admin@test.com",
                password: "123456"
            });
            const token = login.body.token;
            const team = await prisma_1.prisma.team.create({
                data: {
                    name: "Team A",
                    description: "Test"
                }
            });
            const task = await prisma_1.prisma.task.create({
                data: {
                    title: "Task 1",
                    description: "Test",
                    status: "pending",
                    priority: "high",
                    teamId: team.id,
                    assignedTo: user.id
                }
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
        });
    });
});
