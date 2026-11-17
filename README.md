# Study Board — Gerenciador de Tarefas Acadêmicas (Node.js + MVC)

Aplicação web para cadastrar, listar, consultar, editar, concluir, excluir e filtrar tarefas acadêmicas.
Os dados ficam **em memória** (array de objetos) — ao reiniciar o servidor, os dados são perdidos.

## Tecnologias
Node.js, Express (rotas e HTTP) e EJS (views).

## Como executar
```bash
npm install
npm start
# acesse http://localhost:3000
```


## Funcionalidades extras (além do obrigatório)
- **Prazo de entrega** opcional, com destaque visual para tarefas **atrasadas**.
- **Busca** por título/disciplina e **ordenação** (recentes, A–Z, prazo mais próximo), combináveis com o filtro de status.
- **Painel de resumo** com contadores (total, pendentes, concluídas, atrasadas).
- **Reabrir** tarefa concluída (`POST /tarefas/:id/reabrir`).
- **Mensagens de confirmação** após cada ação (via `?msg=` + Post/Redirect/Get).
- Registro de data de criação e de conclusão.

## Estrutura (MVC)
```
src/
├── app.js                       # configuração do Express e inicialização
├── routes/tarefaRoutes.js       # URL + método HTTP -> ação do controller
├── controllers/tarefaController.js  # recebe a requisição, chama o model, escolhe a view
├── models/tarefaModel.js        # array em memória, validações e regras de negócio
├── utils/formatadores.js        # formatação de datas usada nas views
└── views/                       # templates EJS (HTML)
    ├── partials/ (header, footer)
    ├── tarefas/ (index, form, detalhes, excluir)
    └── erro.ejs
public/style.css
```

## Modelo de dados
| Campo | Regra |
|---|---|
| id | gerado pela aplicação (incremental) |
| titulo | obrigatório, 3 a 100 caracteres |
| descricao | opcional, até 500 caracteres |
| disciplina | obrigatória, 2 a 80 caracteres |
| status | `pendente` (inicial) ou `concluida` |
| prazo (extra) | opcional, data válida `AAAA-MM-DD` |

## Rotas
| Método | Rota | Função |
|---|---|---|
| GET | /tarefas | Lista (filtro `?status=pendente` ou `?status=concluida`) |
| GET | /tarefas/nova | Formulário de cadastro |
| POST | /tarefas | Cadastra |
| GET | /tarefas/:id | Detalhes |
| GET | /tarefas/:id/editar | Formulário de edição |
| POST | /tarefas/:id/editar | Salva edição |
| POST | /tarefas/:id/concluir | Marca como concluída |
| POST | /tarefas/:id/reabrir | Volta para pendente (extra) |
| GET | /tarefas/:id/excluir | Tela de confirmação |
| POST | /tarefas/:id/excluir | Exclui após confirmar |

## Fluxo de uma requisição (exemplo: cadastrar)
1. O usuário envia o formulário → `POST /tarefas`.
2. `tarefaRoutes.js` direciona para `tarefaController.criar`.
3. O controller chama `Tarefa.criar(req.body)` (Model), que valida e grava no array.
4. Se houver erros → o controller renderiza `form.ejs` com as mensagens (HTTP 400).
5. Se der certo → redireciona para `GET /tarefas/:id` (padrão Post/Redirect/Get), que renderiza `detalhes.ejs`.

## Decisões técnicas (para justificar no vídeo)
- **Validação no Model**: as regras ficam junto dos dados, independentes da interface.
- **Excluir com confirmação**: página intermediária (GET) + exclusão efetiva só no POST.
- **POST para alterar dados**: GET é usado apenas para consultas (boa prática HTTP).
- **Post/Redirect/Get**: evita reenvio duplicado do formulário ao atualizar a página.
- **404 tratado**: tarefa inexistente exibe página de erro amigável.


