declare module 'react-body-highlighter' {
  export interface IExerciseData {
    name: string
    muscles: string[]
    frequency?: number
  }

  export interface IMuscleStats {
    muscle: string
    data: {
      exercises: string[]
      frequency: number
    }
  }

  interface ModelProps {
    data: IExerciseData[]
    bodyColor?: string
    highlightedColors?: string[]
    onClick?: (stats: IMuscleStats) => void
    style?: React.CSSProperties
    svgStyle?: React.CSSProperties
    type?: 'anterior' | 'posterior'
  }

  const Model: React.FC<ModelProps>
  export default Model
}
