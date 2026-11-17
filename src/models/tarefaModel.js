/**
 * MODEL — dados e regras de negócio das tarefas acadêmicas.
 * Armazenamento em memória (array de objetos). Não conhece HTTP nem views.
 */
const { hojeISO } = require('../utils/formatadores');

const tarefas = [];
let proximoId = 1;

const STATUS = { PENDENTE: 'pendente', CONCLUIDA: 'concluida' };
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function dataValida(iso) {
  if (!REGEX_DATA.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/** Valida e normaliza os dados de entrada. */
function validar({ titulo, descricao, disciplina, prazo }) {
  const dados = {
    titulo: String(titulo ?? '').trim(),
    descricao: String(descricao ?? '').trim(),
    disciplina: String(disciplina ?? '').trim(),
    prazo: String(prazo ?? '').trim(),
  };
  const erros = [];

  if (dados.titulo.length < 3 || dados.titulo.length > 100)
    erros.push('O título é obrigatório e deve ter entre 3 e 100 caracteres.');
  if (dados.descricao.length > 500)
    erros.push('A descrição deve ter no máximo 500 caracteres.');
  if (dados.disciplina.length < 2 || dados.disciplina.length > 80)
    erros.push('A disciplina é obrigatória e deve ter entre 2 e 80 caracteres.');
  if (dados.prazo && !dataValida(dados.prazo))
    erros.push('O prazo informado não é uma data válida.');

  return { erros, dados };
}

/** Uma tarefa está atrasada se está pendente e o prazo já passou. */
function estaAtrasada(t) {
  return t.status === STATUS.PENDENTE && Boolean(t.prazo) && t.prazo < hojeISO();
}

/**
 * Lista tarefas com filtro de status, busca textual e ordenação.
 * opcoes: { status: 'pendente'|'concluida', busca: string, ordem: 'recentes'|'titulo'|'prazo' }
 */
function listar({ status, busca, ordem } = {}) {
  let lista = [...tarefas];

  if (status === STATUS.PENDENTE || status === STATUS.CONCLUIDA) {
    lista = lista.filter((t) => t.status === status);
  }

  const termo = String(busca ?? '').trim().toLowerCase();
  if (termo) {
    lista = lista.filter(
      (t) => t.titulo.toLowerCase().includes(termo) || t.disciplina.toLowerCase().includes(termo)
    );
  }

  if (ordem === 'titulo') {
    lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  } else if (ordem === 'prazo') {
    // tarefas sem prazo vão para o final
    lista.sort((a, b) => (a.prazo || '9999-12-31').localeCompare(b.prazo || '9999-12-31'));
  } else {
    lista.sort((a, b) => b.id - a.id); // mais recentes primeiro
  }

  return lista.map((t) => ({ ...t, atrasada: estaAtrasada(t) }));
}

/** Contadores para o painel de resumo. */
function resumo() {
  return {
    total: tarefas.length,
    pendentes: tarefas.filter((t) => t.status === STATUS.PENDENTE).length,
    concluidas: tarefas.filter((t) => t.status === STATUS.CONCLUIDA).length,
    atrasadas: tarefas.filter(estaAtrasada).length,
  };
}

function buscarPorId(id) {
  const t = tarefas.find((x) => x.id === Number(id));
  return t ? { ...t, atrasada: estaAtrasada(t) } : undefined;
}

function localizar(id) {
  return tarefas.find((x) => x.id === Number(id));
}

function criar(entrada) {
  const { erros, dados } = validar(entrada);
  if (erros.length) return { erros };

  const tarefa = {
    id: proximoId++,
    ...dados,
    status: STATUS.PENDENTE,
    criadaEm: new Date().toISOString(),
    concluidaEm: null,
  };
  tarefas.push(tarefa);
  return { tarefa };
}

function atualizar(id, entrada) {
  const tarefa = localizar(id);
  if (!tarefa) return { naoEncontrada: true };

  const { erros, dados } = validar(entrada);
  if (erros.length) return { erros };

  Object.assign(tarefa, dados);
  return { tarefa };
}

function concluir(id) {
  const tarefa = localizar(id);
  if (!tarefa) return { naoEncontrada: true };
  tarefa.status = STATUS.CONCLUIDA;
  tarefa.concluidaEm = new Date().toISOString();
  return { tarefa };
}

/** Extra: volta uma tarefa concluída para pendente. */
function reabrir(id) {
  const tarefa = localizar(id);
  if (!tarefa) return { naoEncontrada: true };
  tarefa.status = STATUS.PENDENTE;
  tarefa.concluidaEm = null;
  return { tarefa };
}

function excluir(id) {
  const i = tarefas.findIndex((x) => x.id === Number(id));
  if (i === -1) return { naoEncontrada: true };
  tarefas.splice(i, 1);
  return { ok: true };
}

module.exports = { STATUS, listar, resumo, buscarPorId, criar, atualizar, concluir, reabrir, excluir };
