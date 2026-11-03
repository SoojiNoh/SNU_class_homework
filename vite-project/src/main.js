import './style.css'
import { initScrollStory } from './scroll-story.js'
import { initStarfield } from './starfield.js'

const root = document.documentElement
const progressBar = document.querySelector('.scroll-progress span')
const heroCosmos = document.querySelector('.hero-cosmos')

let scrollFrame = 0
window.addEventListener('scroll', () => {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
    progressBar.style.transform = `scaleX(${progress})`
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroCosmos.style.setProperty('--hero-scroll', `${-Math.min(window.scrollY * 0.16, 160)}px`)
    }
    scrollFrame = 0
  })
}, { passive: true })

const themeButton = document.querySelector('.theme-toggle')
const themeIcon = themeButton.querySelector('.theme-icon')

function applyTheme(theme) {
  root.dataset.theme = theme
  const isDark = theme === 'dark'
  themeButton.setAttribute('aria-pressed', String(isDark))
  themeButton.setAttribute('aria-label', `${isDark ? '라이트' : '다크'} 모드로 전환`)
  themeIcon.textContent = isDark ? '☀' : '☾'
}

let savedTheme = null
try {
  savedTheme = localStorage.getItem('intro-theme')
} catch {
  // Storage can be unavailable in privacy-restricted browsers.
}

applyTheme(
  savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
)

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme)
  try {
    localStorage.setItem('intro-theme', nextTheme)
  } catch {
    // The visual toggle still works when storage is unavailable.
  }
})

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const selected = chip.getAttribute('aria-pressed') === 'true'
    chip.setAttribute('aria-pressed', String(!selected))
  })
})

const quotes = [
  '좋은 수업은 정답보다 새로운 질문을 남깁니다.',
  '작은 호기심 하나가 배움의 방향을 바꿉니다.',
  '기술은 학생의 생각을 더 멀리 보내는 다리가 됩니다.',
  '오늘의 한 줄 코드는 내일의 가능성을 엽니다.',
  '함께 시도하는 교실에서는 실패도 배움이 됩니다.',
  '학생의 참여가 시작되는 순간, 수업은 살아 움직입니다.',
]
const quote = document.querySelector('#quote')
let quoteIndex = 0

document.querySelector('#quote-button').addEventListener('click', () => {
  let nextIndex
  do {
    nextIndex = Math.floor(Math.random() * quotes.length)
  } while (nextIndex === quoteIndex)
  quoteIndex = nextIndex
  quote.textContent = `“${quotes[quoteIndex]}”`
})

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const typingTarget = document.querySelector('.typed-text')
const phrases = ['AI 교육을 고민합니다.', '웹앱으로 수업을 설계합니다.', '코드로 참여를 연결합니다.']

if (!typingTarget) {
  // The expanded hero uses a fixed subtitle instead of the former typing line.
} else if (reduceMotion) {
  typingTarget.textContent = phrases[0]
} else {
  let phraseIndex = 0
  let letterIndex = 0
  let deleting = false

  function typePhrase() {
    const phrase = phrases[phraseIndex]
    letterIndex += deleting ? -1 : 1
    typingTarget.textContent = phrase.slice(0, letterIndex)

    if (!deleting && letterIndex === phrase.length) {
      deleting = true
      setTimeout(typePhrase, 1500)
      return
    }
    if (deleting && letterIndex === 0) {
      deleting = false
      phraseIndex = (phraseIndex + 1) % phrases.length
    }
    setTimeout(typePhrase, deleting ? 45 : 85)
  }

  typePhrase()
}

const revealElements = document.querySelectorAll('.reveal')
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'))
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.14 },
  )
  revealElements.forEach((element) => observer.observe(element))
}

const journeyStage = document.querySelector('.journey-stage')
const journeySteps = document.querySelectorAll('.journey-step')
const stageNames = ['기초를 쌓는 중', '아이디어를 만드는 중', '교실로 연결하는 중']

if (journeyStage && 'IntersectionObserver' in window) {
  const journeyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const stage = Number(entry.target.dataset.stage)
        journeyStage.dataset.stage = String(stage)
        journeyStage.querySelector('.planet-mark').textContent = `0${stage + 1}`
        journeyStage.querySelector('.stage-name').textContent = stageNames[stage]
        journeySteps.forEach((step) => {
          step.classList.toggle('is-active', step === entry.target)
        })
      })
    },
    { rootMargin: '-38% 0px -38% 0px' },
  )
  journeySteps.forEach((step) => journeyObserver.observe(step))
}

initScrollStory({ reduceMotion })
initStarfield({ reduceMotion })
