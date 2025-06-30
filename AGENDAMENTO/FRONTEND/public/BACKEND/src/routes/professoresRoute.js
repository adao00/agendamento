const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const authMiddleware = require('../../middlewares/authMiddleware'); // seu middleware de autenticação

// Rota pública para criar professor (cadastro)
router.post('/', professorController.createProfessor);

// Rotas protegidas para os demais métodos
router.get('/', authMiddleware, professorController.getAllProfessores);
router.get('/:id', authMiddleware, professorController.getProfessorById);
router.put('/:id', authMiddleware, professorController.updateProfessor);
router.delete('/:id', authMiddleware, professorController.deleteProfessor);

module.exports = router;
