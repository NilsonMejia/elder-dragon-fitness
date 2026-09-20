function normalizeDetails(details) {
  if (!Array.isArray(details) || !details.length || details.length > 100) throw Object.assign(new Error('Agrega entre 1 y 100 ejercicios.'), { status: 400 });
  return details.map(d => {
    const descanso = Number(d.descanso_segundos ?? 60);
    if (typeof d.texto !== 'string' || !d.texto.trim() || d.texto.length > 150 ||
        !Number.isInteger(descanso) || descanso < 0 || descanso > 3600 ||
        !String(d.series ?? '').trim() || !String(d.repeticiones ?? '').trim() ||
        String(d.series).length > 50 || String(d.repeticiones).length > 50 || String(d.peso ?? '').length > 50) {
      throw Object.assign(new Error('Cada ejercicio requiere nombre, series, repeticiones y un descanso válido.'), { status: 400 });
    }
    return { texto: d.texto.trim(), series: String(d.series), repeticiones: String(d.repeticiones), peso: String(d.peso || 'Libre'), descanso_segundos: descanso };
  });
}
module.exports = { normalizeDetails };
