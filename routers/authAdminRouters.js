const routers = require('express').Router();
const { authAdminControllers } = require('../controllers');
const { auth } = require('../configs/jwtadmin');

routers.post('/login', authAdminControllers.loginAdmin);
routers.post('/reset', authAdminControllers.reqResetPassword);
routers.patch('/change-password', auth, authAdminControllers.changePassword);
routers.post('/get', auth, authAdminControllers.getAdmin);
routers.get('/add', authAdminControllers.addAdmin);

module.exports = routers;
