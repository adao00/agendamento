const express = require('express');
const router = express.Router();
const espacoAgendadoController = require('../controllers/espacoAgendadoController');

router.get('/', espacoAgendadoController.getAllEspacosAgendados);
router.get('/espaco/:id', espacoAgendadoController.getEspacoAgendadoByEspacoId);

module.exports = router;
