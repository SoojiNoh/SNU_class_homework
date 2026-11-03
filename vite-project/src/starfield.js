const ACTIVE_SECTIONS = '.hero, .mission, .space-scene, .impact, .journey, .closing'

export function initStarfield({ reduceMotion }) {
  const canvas = document.querySelector('#starfield')
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (!context) return

  let width = 0
  let height = 0
  let stars = []
  let shootingStars = []
  let frame = 0
  let lastScrollY = window.scrollY
  let scrollVelocity = 0
  let active = false

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    const count = Math.min(420, Math.max(140, Math.round((width * height) / 3600)))
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      depth: 0.25 + Math.random() * 0.75,
      radius: 0.35 + Math.random() * 1.25,
      alpha: 0.3 + Math.random() * 0.7,
    }))
    draw()
  }

  function draw() {
    context.clearRect(0, 0, width, height)
    const offset = window.scrollY
    stars.forEach((star) => {
      const y = ((star.y - offset * star.depth * 0.075) % height + height) % height
      context.beginPath()
      context.fillStyle = `rgba(238, 246, 255, ${star.alpha})`
      context.arc(star.x, y, star.radius * star.depth, 0, Math.PI * 2)
      context.fill()
    })

    shootingStars.forEach((star) => {
      context.beginPath()
      const gradient = context.createLinearGradient(star.x, star.y, star.x - star.length, star.y + star.length * 0.55)
      gradient.addColorStop(0, 'rgba(217, 255, 180, .9)')
      gradient.addColorStop(1, 'rgba(217, 255, 180, 0)')
      context.strokeStyle = gradient
      context.lineWidth = 1.2
      context.moveTo(star.x, star.y)
      context.lineTo(star.x - star.length, star.y + star.length * 0.55)
      context.stroke()
      star.x += star.speed
      star.y -= star.speed * 0.55
    })
    shootingStars = shootingStars.filter((star) => star.x < width + star.length && star.y > -star.length)
  }

  function animate() {
    frame = 0
    if (!active || document.hidden) return
    const nextScrollY = window.scrollY
    scrollVelocity += (Math.abs(nextScrollY - lastScrollY) - scrollVelocity) * 0.18
    lastScrollY = nextScrollY
    if (scrollVelocity > 8 && shootingStars.length < 3 && Math.random() < 0.035) {
      shootingStars.push({ x: Math.random() * width * 0.55, y: height * (0.35 + Math.random() * 0.65), length: 70 + Math.random() * 90, speed: 10 + Math.min(scrollVelocity, 24) })
    }
    draw()
    frame = requestAnimationFrame(animate)
  }

  const visibleSections = new Set()
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? visibleSections.add(entry.target) : visibleSections.delete(entry.target))
    active = visibleSections.size > 0
    canvas.classList.toggle('is-active', active)
    if (active && !frame && !reduceMotion) frame = requestAnimationFrame(animate)
    if (!active && frame) {
      cancelAnimationFrame(frame)
      frame = 0
      context.clearRect(0, 0, width, height)
    }
  })
  document.querySelectorAll(ACTIVE_SECTIONS).forEach((section) => observer.observe(section))

  window.addEventListener('resize', resize, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && active && !frame && !reduceMotion) frame = requestAnimationFrame(animate)
  })
  resize()
}
