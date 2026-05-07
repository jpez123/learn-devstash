'use client'

import { useEffect, useRef } from 'react'

const ICON_SIZE = 48
const PADDING = 4

interface IconState {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rotSpeed: number
}

const CHAOS_ICONS = [
  {
    label: 'Notion',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.968c-.42-.326-.981-.7-2.055-.607L3.01 3.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.248c0-.839.374-1.539 1.447-1.213z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'VS Code',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
      </svg>
    ),
  },
  {
    label: 'Terminal',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    label: 'Browser',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <circle cx="7" cy="7" r="1" fill="currentColor" />
        <circle cx="11" cy="7" r="1" fill="currentColor" />
        <circle cx="15" cy="7" r="1" fill="currentColor" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Text File',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    label: 'Bookmark',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Slack',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zM15.166 17.687a2.527 2.527 0 0 1-2.521-2.521 2.526 2.526 0 0 1 2.521-2.521h6.312A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z" />
      </svg>
    ),
  },
]

export function HeroChaosAnimation() {
  const arenaRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])
  const stateRef = useRef<IconState[]>([])
  const mouseRef = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const arena = arenaRef.current
    if (!arena) return

    let arenaRect = arena.getBoundingClientRect()

    stateRef.current = iconRefs.current.map(() => {
      const maxX = arenaRect.width - ICON_SIZE - PADDING
      const maxY = arenaRect.height - ICON_SIZE - PADDING
      const x = PADDING + Math.random() * Math.max(0, maxX)
      const y = PADDING + Math.random() * Math.max(0, maxY)
      const speed = 0.4 + Math.random() * 0.5
      const angle = Math.random() * Math.PI * 2
      return {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 0.6,
      }
    })

    stateRef.current.forEach((s, i) => {
      const el = iconRefs.current[i]
      if (el) {
        el.style.position = 'absolute'
        el.style.top = '0'
        el.style.left = '0'
        el.style.transform = `translate(${s.x}px, ${s.y}px)`
      }
    })

    const handleResize = () => { arenaRect = arena.getBoundingClientRect() }
    const handleMouseMove = (e: MouseEvent) => {
      const r = arena.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const handleMouseLeave = () => { mouseRef.current = { x: -999, y: -999 } }

    window.addEventListener('resize', handleResize, { passive: true })
    arena.addEventListener('mousemove', handleMouseMove)
    arena.addEventListener('mouseleave', handleMouseLeave)

    let last = 0
    function tick(ts: number) {
      const dt = Math.min((ts - last) / 16, 3)
      last = ts

      const W = arenaRect.width
      const H = arenaRect.height

      stateRef.current.forEach((s, i) => {
        const el = iconRefs.current[i]
        if (!el) return

        const cx = s.x + ICON_SIZE / 2
        const cy = s.y + ICON_SIZE / 2
        const dx = cx - mouseRef.current.x
        const dy = cy - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const REPEL_RADIUS = 90

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * 1.8
          s.vx += (dx / dist) * force * dt
          s.vy += (dy / dist) * force * dt
        }

        s.vx *= 0.995
        s.vy *= 0.995

        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
        if (speed > 2.5) { s.vx = (s.vx / speed) * 2.5; s.vy = (s.vy / speed) * 2.5 }
        if (speed < 0.2 && speed > 0) { s.vx = (s.vx / speed) * 0.2; s.vy = (s.vy / speed) * 0.2 }

        s.x += s.vx * dt
        s.y += s.vy * dt

        const maxX = W - ICON_SIZE - PADDING
        const maxY = H - ICON_SIZE - PADDING

        if (s.x < PADDING) { s.x = PADDING; s.vx = Math.abs(s.vx) }
        if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx) }
        if (s.y < PADDING) { s.y = PADDING; s.vy = Math.abs(s.vy) }
        if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy) }

        s.rot += s.rotSpeed * dt
        el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
      arena.removeEventListener('mousemove', handleMouseMove)
      arena.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div ref={arenaRef} className="relative w-full h-full overflow-hidden">
      {CHAOS_ICONS.map((icon, i) => (
        <div
          key={icon.label}
          ref={el => { iconRefs.current[i] = el }}
          className="w-12 h-12 flex items-center justify-center rounded-[10px] text-[#8b949e] select-none cursor-default"
          style={{
            background: '#21262d',
            border: '1px solid #30363d',
          }}
          title={icon.label}
        >
          {icon.svg}
        </div>
      ))}
    </div>
  )
}
