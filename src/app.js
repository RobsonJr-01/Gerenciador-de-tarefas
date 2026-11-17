const express = require('express');
const path = require('path');
const tarefaRoutes = require('./routes/tarefaRoutes');
const formatadores = require('./utils/formatadores');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.dataBR = formatadores.dataBR;         // disponíveis em todas as views
app.locals.dataHoraBR = formatadores.dataHoraBR;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => res.redirect('/tarefas'));
app.use('/tarefas', tarefaRoutes);

app.use((req, res) =>
  res.status(404).render('erro', { titulo: 'Página não encontrada', mensagem: 'O endereço acessado não existe.' })
);

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
