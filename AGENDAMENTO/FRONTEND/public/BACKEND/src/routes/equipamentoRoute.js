const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, equipamentoController.getAllEquipamentos);
router.get('/:id', authMiddleware, equipamentoController.getEquipamentoById);
router.post('/', authMiddleware,equipamentoController.createEquipamento);
router.put('/:id', authMiddleware, equipamentoController.updateEquipamento);
router.delete('/:id', authMiddleware, equipamentoController.deleteEquipamento);

module.exports = router;
