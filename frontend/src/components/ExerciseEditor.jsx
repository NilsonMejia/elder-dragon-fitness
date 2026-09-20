import { blankExercise } from '../lib/routines';
export default function ExerciseEditor({ value, onChange }) {
  const update = (i,key,v) => onChange(value.map((d,index)=> index===i ? {...d,[key]:v} : d));
  return <fieldset className="exercise-editor"><legend>Ejercicios personalizados</legend>
    {value.map((d,i)=><div className="exercise-row" key={i}>
      <label>Ejercicio<input required maxLength={150} value={d.texto} onChange={e=>update(i,'texto',e.target.value)}/></label>
      <label>Series<input required maxLength={50} value={d.series} onChange={e=>update(i,'series',e.target.value)}/></label>
      <label>Repeticiones<input required maxLength={50} value={d.repeticiones} onChange={e=>update(i,'repeticiones',e.target.value)}/></label>
      <label>Peso<input maxLength={50} value={d.peso} onChange={e=>update(i,'peso',e.target.value)}/></label>
      <label>Descanso (s)<input type="number" required min="0" max="3600" value={d.descanso_segundos} onChange={e=>update(i,'descanso_segundos',Number(e.target.value))}/></label>
      <button type="button" className="btn-outline" disabled={value.length===1} onClick={()=>onChange(value.filter((_,index)=>index!==i))}>Quitar</button>
    </div>)}<button type="button" className="btn-outline" onClick={()=>onChange([...value,blankExercise()])}>Agregar ejercicio</button>
  </fieldset>;
}
