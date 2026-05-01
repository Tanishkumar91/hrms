const express = require('express');
const { 
    getEmployees, 
    getEmployee, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee 
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(authorize('hr'), getEmployees)
    .post(authorize('hr'), createEmployee);

router
    .route('/:id')
    .get(getEmployee)
    .put(updateEmployee)
    .delete(authorize('hr'), deleteEmployee);

module.exports = router;
