/** CONTROLLER — traduz requisições HTTP em chamadas ao Model e escolhe a View. */
const Tarefa = require('../models/tarefaModel');

const MENSAGENS = {
  criada: 'Tarefa cadastrada com sucesso!',
  editada: 'Tarefa atualizada com sucesso!',
  concluida: 'Tarefa marcada como concluída.',
  reaberta: 'Tarefa reaberta (voltou para pendente).',
  excluida: 'Tarefa excluída.',
};

function paginaNaoEncontrada(res) {
  return res.status(404).render('erro', {
    titulo: 'Tarefa não encontrada',
    mensagem: 'A tarefa solicitada não existe ou já foi removida.',
  });
}

function renderFormulario(res, { status = 200, titulo, acao, tarefa, erros = [] }) {
  return res.status(status).render('tarefas/form', { titulo, acao, tarefa, erros });
}

exports.listar = (req, res) => {
  const status = ['pendente', 'concluida'].includes(req.query.status) ? req.query.status : 'todas';
  const busca = String(req.query.busca ?? '').trim();
  const ordem = ['recentes', 'titulo', 'prazo'].includes(req.query.ordem) ? req.query.ordem : 'recentes';

  res.render('tarefas/index', {
    tarefas: Tarefa.listar({ status, busca, ordem }),
    resumo: Tarefa.resumo(),
    filtro: status,
    busca,
    ordem,
    mensagem: MENSAGENS[req.query.msg] || null,
  });
};

exports.formNova = (req, res) =>
  renderFormulario(res, {
    titulo: 'Nova tarefa',
    acao: '/tarefas',
    tarefa: { titulo: '', descricao: '', disciplina: '', prazo: '' },
  });

exports.criar = (req, res) => {
  const r = Tarefa.criar(req.body);
  if (r.erros) {
    return renderFormulario(res, { status: 400, titulo: 'Nova tarefa', acao: '/tarefas', tarefa: req.body, erros: r.erros });
  }
  res.redirect(`/tarefas/${r.tarefa.id}?msg=criada`);
};

exports.detalhar = (req, res) => {
  const tarefa = Tarefa.buscarPorId(req.params.id);
  if (!tarefa) return paginaNaoEncontrada(res);
  res.render('tarefas/detalhes', { tarefa, mensagem: MENSAGENS[req.query.msg] || null });
};

exports.formEditar = (req, res) => {
  const tarefa = Tarefa.buscarPorId(req.params.id);
  if (!tarefa) return paginaNaoEncontrada(res);
  renderFormulario(res, { titulo: 'Editar tarefa', acao: `/tarefas/${tarefa.id}/editar`, tarefa });
};

exports.editar = (req, res) => {
  const r = Tarefa.atualizar(req.params.id, req.body);
  if (r.naoEncontrada) return paginaNaoEncontrada(res);
  if (r.erros) {
    return renderFormulario(res, {
      status: 400, titulo: 'Editar tarefa', acao: `/tarefas/${req.params.id}/editar`, tarefa: req.body, erros: r.erros,
    });
  }
  res.redirect(`/tarefas/${r.tarefa.id}?msg=editada`);
};

exports.concluir = (req, res) => {
  const r = Tarefa.concluir(req.params.id);
  if (r.naoEncontrada) return paginaNaoEncontrada(res);
  res.redirect(`/tarefas/${r.tarefa.id}?msg=concluida`);
};

exports.reabrir = (req, res) => {
  const r = Tarefa.reabrir(req.params.id);
  if (r.naoEncontrada) return paginaNaoEncontrada(res);
  res.redirect(`/tarefas/${r.tarefa.id}?msg=reaberta`);
};

exports.confirmarExclusao = (req, res) => {
  const tarefa = Tarefa.buscarPorId(req.params.id);
  if (!tarefa) return paginaNaoEncontrada(res);
  res.render('tarefas/excluir', { tarefa });
};

exports.excluir = (req, res) => {
  const r = Tarefa.excluir(req.params.id);
  if (r.naoEncontrada) return paginaNaoEncontrada(res);
  res.redirect('/tarefas?msg=excluida');
};
