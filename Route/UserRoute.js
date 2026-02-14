const { GetAllUser, GetUserById, CreateUser, Login, GoogleLogin, UpdateUser, DeleteUser } = require('../Controllers/UserCtrlls.js');
const express = require('express');
const { Auth } = require('./MiddleWare/Auth.js');
const Route = express.Router();


Route.get('/',Auth(['admin']),GetAllUser);
Route.get('/:id',Auth(['admin']),GetUserById);
Route.post('/',CreateUser);
Route.post('/login',Login);
Route.post('/google-login', GoogleLogin); // ✅ ADD THIS
Route.put('/:id',Auth(['admin']),UpdateUser);
Route.delete('/:id',Auth(['admin']),DeleteUser);

module.exports = Route;