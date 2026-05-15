import { useState, useEffect, useRef } from 'react'
import type { Exercise } from '../types'

interface Props { exercise: Exercise; size?: 'sm' | 'md' | 'lg' }

export default function ExerciseAnimation({ exercise, size = 'lg' }: Props) {
  const [frame, setFrame] = useState(0)
  const [allLoaded, setAllLoaded] = useState(false)
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])

  const startUrl = exercise.gifUrl
  const endUrl = startUrl ? startUrl.replace(/0\.jpg$/, '1.jpg') : undefined
  const urls = [
    ...(startUrl ? [startUrl] : []),
    ...(endUrl && endUrl !== startUrl ? [endUrl] : []),
  ]

  // Preload all image frames before starting carousel
  useEffect(() => {
    setFrame(0)
    setAllLoaded(false)

    if (urls.length === 0) return

    let loaded = 0
    const imgs: HTMLImageElement[] = urls.map(url => {
      const img = new Image()
      img.src = url
      img.onload = () => {
        loaded++
        if (loaded === urls.length) setAllLoaded(true)
      }
      img.onerror = () => {
        loaded++
        if (loaded === urls.length) setAllLoaded(true)
      }
      return img
    })
    imgRefs.current = imgs

    return () => { imgs.forEach(img => { img.onload = null; img.onerror = null }) }
  }, [urls.join(',')])

  // Start carousel only after all images are loaded
  useEffect(() => {
    if (!allLoaded || urls.length <= 1) return
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % urls.length)
    }, 600)
    return () => clearInterval(timer)
  }, [allLoaded, urls.length])

  const wrap = (cls: string) => {
    const s = {
      sm: 'w-12 h-16',
      md: 'w-full h-full',
      lg: 'w-full aspect-[2/3] max-h-[320px]',
    }[size]
    return `${s} mx-auto relative`
  }

  if (size === 'sm') {
    return (
      <div className={`${wrap('')} flex items-center justify-center bg-surface-subtle rounded-2xl overflow-hidden`}>
        {startUrl ? (
          <img src={startUrl} alt={exercise.name} className="w-full h-full object-contain" loading="lazy" />
        ) : (
          <span className="text-2xl">{exercise.icon}</span>
        )}
      </div>
    )
  }

  if (urls.length === 0 || !allLoaded) {
    return (
      <div className={`${wrap('')} bg-surface-subtle rounded-2xl overflow-hidden flex flex-col items-center justify-center`}>
        <span className="text-5xl mb-2">{exercise.icon}</span>
        <span className="text-[13px] text-text-disabled">{exercise.name}</span>
      </div>
    )
  }

  return (
    <div className={`${wrap('')} bg-surface-subtle rounded-2xl overflow-hidden`}>
      {urls.map((url, i) => (
        <img
          key={url}
          src={url}
          alt={i === 0 ? '起始姿势' : '结束姿势'}
          className={`w-full h-full object-contain absolute inset-0 transition-opacity duration-200 ${i === frame ? 'opacity-100' : 'opacity-0'}`}
          decoding="async"
        />
      ))}
    </div>
  )
}
