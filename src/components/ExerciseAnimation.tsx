import { useState, useEffect } from 'react'
import type { Exercise } from '../types'

interface Props { exercise: Exercise; size?: 'sm' | 'md' | 'lg' }

export default function ExerciseAnimation({ exercise, size = 'lg' }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const [frame, setFrame] = useState(0)

  const startUrl = exercise.gifUrl
  const endUrl = startUrl ? startUrl.replace(/0\.jpg$/, '1.jpg') : undefined
  const extraUrl = exercise.gifUrlEnd
  const frames = [
    ...(startUrl ? [startUrl!] : []),
    ...(endUrl && endUrl !== startUrl ? [endUrl] : []),
    ...(extraUrl && extraUrl !== startUrl && extraUrl !== endUrl ? [extraUrl] : []),
  ]

  // Auto-carousel: cycle between frames at 500ms intervals
  useEffect(() => {
    if (frames.length <= 1) return
    const timer = setInterval(() => setFrame(f => (f + 1) % frames.length), 500)
    return () => clearInterval(timer)
  }, [frames.length])

  const wrap = (cls: string) => {
    const s = {
      sm: 'w-12 h-16',
      md: 'w-36 h-64',
      lg: 'w-full aspect-[2/3] max-h-[320px]',
    }[size]
    return `${s} mx-auto relative`
  }

  if (size === 'sm') {
    return (
      <div className={`${wrap('')} flex items-center justify-center bg-surface-subtle rounded-2xl overflow-hidden`}>
        {startUrl && !imgFailed ? (
          <img src={startUrl} alt={exercise.name} className="w-full h-full object-contain" loading="lazy" onError={() => setImgFailed(true)} />
        ) : (
          <span className="text-2xl">{exercise.icon}</span>
        )}
      </div>
    )
  }

  return (
    <div className={`${wrap('')} bg-surface-subtle rounded-2xl overflow-hidden`}>
      {startUrl && !imgFailed ? (
        frames.map((url, i) => (
          <img key={url} src={url} alt={i === 0 ? '起始姿势' : '结束姿势'}
            className={`w-full h-full object-contain absolute inset-0 transition-opacity duration-100 ${i === frame ? 'opacity-100' : 'opacity-0'}`}
            decoding="async" onError={() => setImgFailed(true)} />
        ))
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-text-disabled">
          <span className="text-5xl mb-2">{exercise.icon}</span>
          <span className="text-[13px]">{exercise.name}</span>
        </div>
      )}
    </div>
  )
}
