"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const express_1 = require("express");
const create_users_1 = require("../controllers/create-users");
const usersRoutes = (0, express_1.Router)();
exports.usersRoutes = usersRoutes;
const createUserController = new create_users_1.CreateUserController();
usersRoutes.post("/", createUserController.create);
