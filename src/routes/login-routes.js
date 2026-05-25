"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRoutes = void 0;
const express_1 = require("express");
const login_users_1 = require("../controllers/login-users");
const loginRoutes = (0, express_1.Router)();
exports.loginRoutes = loginRoutes;
const loginUsers = new login_users_1.LoginUsers();
loginRoutes.post("/", loginUsers.create);
