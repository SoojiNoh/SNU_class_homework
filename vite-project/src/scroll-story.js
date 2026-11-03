import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

function splitHeadings() {
  document.querySelectorAll('[data-split]').forEach((heading) => {
    heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim())
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT)
    const textNodes = []
    while (walker.nextNode()) textNodes.push(walker.currentNode)

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment()
      Array.from(node.textContent).forEach((character) => {
        if (/\s/.test(character)) {
          fragment.append(character)
          return
        }
        const span = document.createElement('span')
        span.className = 'split-char'
        span.setAttribute('aria-hidden', 'true')
        span.textContent = character
        fragment.append(span)
      })
      node.replaceWith(fragment)
    })
  })
}

export function initScrollStory({ reduceMotion }) {
  splitHeadings()

  if (reduceMotion) {
    document.documentElement.classList.add('reduced-motion')
    return
  }

  const lenis = new Lenis({
    anchors: true,
    duration: 1.15,
    smoothWheel: true,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  document.querySelectorAll('[data-split]').forEach((heading) => {
    gsap.from(heading.querySelectorAll('.split-char'), {
      yPercent: 110,
      opacity: 0,
      rotateX: -70,
      stagger: 0.025,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 82%', once: true },
    })
  })

  const parallaxTargets = [
    ['.trajectory-orbit', -90],
    ['.security-grid', 110],
    ['.radar', -130],
    ['.project-orbit', 120],
    ['.closing-orbit', -100],
  ]
  parallaxTargets.forEach(([selector, y]) => {
    const target = document.querySelector(selector)
    if (!target) return
    gsap.to(target, {
      y,
      ease: 'none',
      scrollTrigger: { trigger: target.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
  })

  const media = gsap.matchMedia()
  media.add('(min-width: 821px)', () => {
    document.querySelectorAll('.space-scene').forEach((scene) => {
      ScrollTrigger.create({
        trigger: scene,
        start: 'top top',
        end: 'bottom top+=30%',
        pin: scene.querySelector('.scene-heading, .security-copy'),
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
      })
    })
  })

  gsap.from('.timeline-list li', {
    x: 70,
    opacity: 0,
    stagger: 0.16,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.timeline-list', start: 'top 78%', end: 'bottom 65%', scrub: 1 },
  })
  gsap.from('.terminal p', {
    x: 24,
    opacity: 0,
    stagger: 0.12,
    scrollTrigger: { trigger: '.terminal', start: 'top 78%', end: 'center 55%', scrub: 1 },
  })
  gsap.from('.project-card', {
    y: 120,
    opacity: 0,
    scale: 0.92,
    stagger: 0.13,
    scrollTrigger: { trigger: '.project-grid', start: 'top 85%', end: 'center 45%', scrub: 1 },
  })
  gsap.to('.constellation-line', {
    strokeDashoffset: 0,
    scrollTrigger: { trigger: '.closing', start: 'top 70%', end: 'center 45%', scrub: 1 },
  })
  gsap.to('.constellation-stars circle', {
    opacity: 1,
    stagger: 0.12,
    scrollTrigger: { trigger: '.closing', start: 'top 62%', end: 'center 38%', scrub: 1 },
  })

}
