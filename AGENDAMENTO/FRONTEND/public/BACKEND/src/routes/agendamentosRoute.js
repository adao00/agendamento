const express = require('express');
const router = express.Router();
const agendamentosController = require('../controllers/agendamentosController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, agendamentosController.getAllAgendamentos);
router.get('/professor/:id', authMiddleware, agendamentosController.getAgendamentosByProfessor); // ✅ nova rota
router.get('/:id', authMiddleware, agendamentosController.getAgendamentoById);
router.post('/', authMiddleware, agendamentosController.createAgendamento);
router.put('/:id', authMiddleware, agendamentosController.updateAgendamento);
router.delete('/:id', authMiddleware, agendamentosController.deleteAgendamento);

module.exports = router;
