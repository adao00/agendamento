const express = require('express');
const router = express.Router();
const equipamentoagendadoController = require('../controllers/equipamentoagendadoController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, equipamentoagendadoController.getAllEquipamentosAgendados);
router.get('/:id', authMiddleware, equipamentoagendadoController.getEquipamentoAgendadoById);
router.post('/', authMiddleware, equipamentoagendadoController.createEquipamentoAgendado);
router.put('/:id', authMiddleware, equipamentoagendadoController.updateEquipamentoAgendado);
router.delete('/:id', authMiddleware, equipamentoagendadoController.deleteEquipamentoAgendado);

module.exports = router;
