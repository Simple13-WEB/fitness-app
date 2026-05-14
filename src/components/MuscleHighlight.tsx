import Model, { type IExerciseData } from 'react-body-highlighter'
import type { MuscleGroup } from '../types'

const muscleMap: Record<MuscleGroup, string[]> = {
  chest:        ['chest'],
  shoulder:     ['front-deltoids', 'back-deltoids'],
  back:         ['trapezius', 'upper-back', 'lower-back'],
  abs:          ['abs', 'obliques'],
  legs:         ['quadriceps', 'hamstring', 'calves'],
  glutes:       ['gluteal'],
  arms:         ['biceps', 'triceps', 'forearm'],
  cardio:       ['quadriceps', 'hamstring', 'calves'],
}

const groupLabels: Record<string, string> = {
  chest: '胸', shoulder: '肩', back: '背', abs: '腹',
  legs: '腿', glutes: '臀', arms: '手臂', cardio: '有氧',
}

interface Props {
  muscleGroup: MuscleGroup
  exerciseName?: string
  size?: number
}

export default function MuscleHighlight({ muscleGroup, exerciseName, size = 220 }: Props) {
  const muscles = muscleMap[muscleGroup] || []
  const label = groupLabels[muscleGroup] || muscleGroup

  const data: IExerciseData[] = [
    {
      name: exerciseName || `${label}训练`,
      muscles,
      frequency: 3,
    },
  ]

  return (
    <div className="mx-auto" style={{ width: size }}>
      <Model
        data={data}
        type={muscleGroup === 'back' || muscleGroup === 'glutes' ? 'posterior' : 'anterior'}
        highlightedColors={['#3b82f6', '#93c5fd']}
        bodyColor="#e5e7eb"
        style={{ width: '100%', padding: '0' }}
      />
    </div>
  )
}

export { muscleMap, groupLabels }
