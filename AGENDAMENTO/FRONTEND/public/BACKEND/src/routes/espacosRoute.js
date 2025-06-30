const express = require('express');
const router = express.Router();
const espacosController = require('../controllers/espacosController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, espacosController.getAllEspacos);
router.get('/:id', authMiddleware, espacosController.getEspacoById);
router.post('/', authMiddleware, espacosController.createEspaco);
router.put('/:id', authMiddleware, espacosController.updateEspaco);
router.delete('/:id', authMiddleware, espacosController.deleteEspaco);


module.exports = router;
