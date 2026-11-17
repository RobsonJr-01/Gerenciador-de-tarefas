/** ROTAS — URL + método HTTP -> ação do Controller. */
const express = require('express');
const c = require('../controllers/tarefaController');

const router = express.Router();

router.get('/', c.listar);
router.get('/nova', c.formNova); // precisa vir antes de '/:id'
router.post('/', c.criar);
router.get('/:id', c.detalhar);
router.get('/:id/editar', c.formEditar);
router.post('/:id/editar', c.editar);
router.post('/:id/concluir', c.concluir);
router.post('/:id/reabrir', c.reabrir);
router.get('/:id/excluir', c.confirmarExclusao);
router.post('/:id/excluir', c.excluir);

module.exports = router;
