/** Funções auxiliares de apresentação de datas (usadas nas views). */

function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** '2026-11-30' -> '30/11/2026' */
function dataBR(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** Date ou ISO completo -> '16/11/2026 22:10' */
function dataHoraBR(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

module.exports = { hojeISO, dataBR, dataHoraBR };
