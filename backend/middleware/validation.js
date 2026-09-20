const states = ['Activo','Inactivo','Moroso'];
exports.user = (req,res,next) => {
  const b=req.body;
  const bad = ['nombre','apellido'].some(k => b[k] !== undefined && (typeof b[k] !== 'string' || !b[k].trim() || b[k].length > 100)) ||
    (b.email !== undefined && (typeof b.email !== 'string' || b.email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))) ||
    (b.telefono !== undefined && b.telefono !== null && (typeof b.telefono !== 'string' || b.telefono.length > 20)) ||
    (b.estado !== undefined && !states.includes(b.estado)) ||
    (b.rol !== undefined && !['Administrador','Recepcionista','Entrenador','Cliente'].includes(b.rol)) ||
    (b.password !== undefined && (typeof b.password !== 'string' || b.password.length < 8 || Buffer.byteLength(b.password) > 72));
  if (bad) return res.status(400).json({message:'Revisa nombre, correo, teléfono, estado y contraseña.'});
  next();
};
exports.plan = (req,res,next) => {
  const b=req.body;
  if ((b.nombre_plan !== undefined && (typeof b.nombre_plan !== 'string' || !b.nombre_plan.trim() || b.nombre_plan.length>100)) ||
      (b.precio !== undefined && (!Number.isFinite(Number(b.precio)) || Number(b.precio)<=0 || Number(b.precio)>99999999.99)) ||
      (b.duracion_dias !== undefined && (!Number.isInteger(Number(b.duracion_dias)) || Number(b.duracion_dias)<1 || Number(b.duracion_dias)>36500))) {
    return res.status(400).json({message:'Usa un nombre, un precio positivo y una duración entera de 1 a 36500 días.'});
  }
  next();
};
