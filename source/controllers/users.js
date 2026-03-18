import { randomBytes } from "crypto";
import { pbkdf2Promisified } from "../utility.js";
import { addUser, deleteUser } from "../models/users.js";
import { deleteTodosByUser } from "../models/todos.js";

function createSessionAndLogin(req, res, next, user) {
  req.session.regenerate((err) => {
    if (err) return next(err);

    req.session.user = {
      id: user._id,
      name: user.username,
    };

    req.session.save((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  });
}

export function registerPage(req, res) {
  res.render("register", { title: "Регистрация" });
}

export async function register(req, res, next) {
  try {
    const salt = randomBytes(16);
    const hash = await pbkdf2Promisified(
      req.body.password,
      salt,
      100000,
      32,
      "sha256",
    );

    const user = {
      username: req.body.username,
      password: hash,
      salt: salt,
    };
    const createdUser = await addUser(user);

    createSessionAndLogin(req, res, next, createdUser);
  } catch (err) {
    next(err);
  }
}

export function loginPage(req, res) {
  res.render("login", { title: "Вход" });
}

export function login(req, res, next) {
  createSessionAndLogin(req, res, next, req.__user);
}

export function logout(req, res, next) {
  if (!req.session) {
    res.redirect("/login");
    return;
  }

  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
}

export async function deleteU(req, res, next) {
  try {
    const userId = req.session.user.id;
    await deleteTodosByUser(userId);
    await deleteUser(userId);
    logout(req, res, next);
  } catch (err) {
    next(err);
  }
}