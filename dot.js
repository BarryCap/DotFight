/** Technical constants */
const scaleFactor = 80
const dispScaleFromDistance = (dist) => 128 / (dist || .75)

/** Game constants */
const nbEvilDots = 8096
const initDotPosX = 0
const initDotPosY = 0
const initDot1PosX = -2
const initDot1PosY = 0
const initDot2PosX = 2
const initDot2PosY = 0
const initTimeBetweenSpawns = 1000
const evilDotsSpeed = 400

/** Keyboard layout */
const menuMoveXKeys = ['a', 'd', 'q', 'ArrowLeft', 'ArrowRight', 'Tab']
const menuMoveYKeys = ['w', 's', 'z', 'ArrowUp', 'ArrowDown', 'Tab']
const menuSelectKeys = [' ', 'Enter']
const menuEscape = ['Escape', 'Backspace', 'Home']
const layoutMovement1p = {
  up: ['w', 'z', 'ArrowUp'],
  down: ['s', 'ArrowDown'],
  left: ['a', 'q', 'ArrowLeft'],
  right: ['d', 'ArrowRight']
}
const layoutMovement2p1 = {
  up: ['w', 'z'],
  down: ['s'],
  left: ['a', 'q'],
  right: ['d']
}
const layoutMovement2p2 = {
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight']
}

/** Utils functions */
const $ = (id) => document.getElementById(id)
const setTransform = (node, [x, y]) => node.setAttribute('transform', `translate(${x * scaleFactor} ${y * scaleFactor})`)
const createNS = (type) => document.createElementNS('http://www.w3.org/2000/svg', type)
const calcDistance = (pos1, pos2) => ((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2) ** .5

let highScore = 0

let twoPlayers = false
let credits = false
let options = false

let dot = null
let dot1 = null
let dot2 = null

// Init dots
setTimeout(() => {
  dot = $('dot')
  dot1 = $('dot1')
  dot2 = $('dot2')
})

let dotPos = [initDotPosX, initDotPosY]
let dot1Pos = [initDot1PosX, initDot1PosY]
let dot2Pos = [initDot2PosX, initDot2PosY]
let dot1Dead = false
let dot2Dead = false
let currentTime = 0

let currentEvilDotIndex = 1
let timeBetweenSpawns = initTimeBetweenSpawns
let creationTimeout = null
let evilDotsMove = null
let timerInterval = null
let evilDots = []

let selection = '1p'

document.onkeydown = menuSelection

/** Choose menu options */
function menuSelection({ key }) {
  const mS = $('menu-selection')
  if (selection == '1p') {
    if (menuMoveXKeys.includes(key)) {
      mS.setAttribute('x', 720)
      mS.setAttribute('y', 712)
      mS.setAttribute('width', 240)
      mS.setAttribute('height', 160)
      selection = '2p'
    } else if (menuMoveYKeys.includes(key)) {
      mS.setAttribute('x', 100)
      mS.setAttribute('y', 852)
      mS.setAttribute('width', 120)
      mS.setAttribute('height', 120)
      selection = 'credits'
    }
  } else if (selection == '2p') {
    if (menuMoveXKeys.includes(key)) {
      mS.setAttribute('x', 320)
      mS.setAttribute('y', 712)
      mS.setAttribute('width', 240)
      mS.setAttribute('height', 160)
      selection = '1p'
    } else if (menuMoveYKeys.includes(key)) {
      mS.setAttribute('x', 1060)
      mS.setAttribute('y', 852)
      mS.setAttribute('width', 120)
      mS.setAttribute('height', 120)
      selection = 'options'
    }
  } else if (selection == 'credits') {
    if (menuMoveXKeys.includes(key)) {
      mS.setAttribute('x', 1060)
      mS.setAttribute('y', 852)
      mS.setAttribute('width', 120)
      mS.setAttribute('height', 120)
      selection = 'options'
    } else if (menuMoveYKeys.includes(key)) {
      mS.setAttribute('x', 320)
      mS.setAttribute('y', 712)
      mS.setAttribute('width', 240)
      mS.setAttribute('height', 160)
      selection = '1p'
    }
  } else if (selection == 'options') {
    if (menuMoveXKeys.includes(key)) {
      mS.setAttribute('x', 100)
      mS.setAttribute('y', 852)
      mS.setAttribute('width', 120)
      mS.setAttribute('height', 120)
      selection = 'credits'
    } else if (menuMoveYKeys.includes(key)) {
      mS.setAttribute('x', 720)
      mS.setAttribute('y', 712)
      mS.setAttribute('width', 240)
      mS.setAttribute('height', 160)
      selection = '2p'
    }
  }
  if (selection == '1p') {
    $('hyphen').setAttribute('opacity', 0)
    $('left-menu-title').setAttribute('opacity', 1)
    $('right-menu-title').setAttribute('opacity', 1)
    $('last-score').setAttribute('opacity', 1)
    $('high-score').setAttribute('opacity', 1)
    $('p1-score').setAttribute('opacity', 0)
    $('p2-score').setAttribute('opacity', 0)
    twoPlayers = false
  } else if (selection == '2p') {
    $('hyphen').setAttribute('opacity', 1)
    $('left-menu-title').setAttribute('opacity', 0)
    $('right-menu-title').setAttribute('opacity', 0)
    $('last-score').setAttribute('opacity', 0)
    $('high-score').setAttribute('opacity', 0)
    $('p1-score').setAttribute('opacity', 1)
    $('p2-score').setAttribute('opacity', 1)
    twoPlayers = true
  }
  if (menuSelectKeys.includes(key) && selection == '1p') {
    launchGame()
  } else if (menuSelectKeys.includes(key) && selection == '2p') {
    launchGame2p()
  } else if (menuSelectKeys.includes(key) && selection == 'credits') {
    $('menu-top-page').setAttribute('opacity', 0)
    $('credits-page').setAttribute('opacity', 1)
    document.onkeydown = optionsSelection
  } else if (menuSelectKeys.includes(key) && selection == 'options') {
    $('menu-top-page').setAttribute('opacity', 0)
    $('options-page').setAttribute('opacity', 1)
    document.onkeydown = optionsSelection
  }
}

let selectedOption = 'glow'
let glowEffect = true
let distEffect = true

function optionsSelection({ key }) {
  if (menuEscape.includes(key) && selection == 'credits') {
    $('menu-top-page').setAttribute('opacity', 1)
    $('credits-page').setAttribute('opacity', 0)
    document.onkeydown = menuSelection
  } else if (menuEscape.includes(key) && selection == 'options') {
    $('menu-top-page').setAttribute('opacity', 1)
    $('options-page').setAttribute('opacity', 0)
    document.onkeydown = menuSelection
  }
  const oS = $('options-selection')
  if (selectedOption == 'glow') {
    if (menuMoveYKeys.includes(key)) {
      oS.setAttribute('y', 590)
      selectedOption = 'dist'
    }
  } else if (selectedOption == 'dist') {
    if (menuMoveYKeys.includes(key)) {
      oS.setAttribute('y', 350)
      selectedOption = 'glow'
    }
  }
  if (menuSelectKeys.includes(key) && selectedOption == 'glow' && glowEffect) {
    $('tick-glow').setAttribute('opacity', 0)
    glowEffect = false
    disableGlow()
  } else if (menuSelectKeys.includes(key) && selectedOption == 'dist' && distEffect) {
    $('tick-dist').setAttribute('opacity', 0)
    distEffect = false
    disableDist()
  } else if (menuSelectKeys.includes(key) && selectedOption == 'glow' && glowEffect == false) {
    $('tick-glow').setAttribute('opacity', 1)
    glowEffect = true
    enableGlow()
  } else if (menuSelectKeys.includes(key) && selectedOption == 'dist' && distEffect == false) {
    $('tick-dist').setAttribute('opacity', 1)
    distEffect = true
    enableDist()
  }
}

function disableGlow() {
  $('menu-top-page-white').removeAttribute('filter')
  $('menu-top-page-yellow').removeAttribute('filter')
  $('menu-top-page-cyan').removeAttribute('filter')
  $('menu-pages').setAttribute('filter', 'url(#dot-disp)')
  $('credits-page-yellow').removeAttribute('filter')
  $('credits-page-cyan').removeAttribute('filter')
  $('dot').removeAttribute('filter')
  $('dot1').removeAttribute('filter')
  $('dot2').removeAttribute('filter')
  $('count-down').removeAttribute('filter')
  $('menu').classList.add('bg-no-glow')
  $('board').classList.add('bg-no-glow')
}

function enableGlow() {
  $('menu-top-page-white').setAttribute('filter', 'drop-shadow(0 0 20px #8ffc)')
  $('menu-top-page-yellow').setAttribute('filter', 'drop-shadow(0 0 20px #ff0)')
  $('menu-top-page-cyan').setAttribute('filter', 'drop-shadow(0 0 20px #0ff)')
  $('menu-pages').setAttribute('filter', 'drop-shadow(0 0 20px #8ffc) url(#dot-disp)')
  $('credits-page-yellow').setAttribute('filter', 'drop-shadow(0 0 20px #ff08)')
  $('credits-page-cyan').setAttribute('filter', 'drop-shadow(0 0 20px #0ff8)')
  $('dot').setAttribute('filter', 'drop-shadow(0 0 20px #8ff)')
  $('dot1').setAttribute('filter', 'drop-shadow(0 0 20px #ff0)')
  $('dot2').setAttribute('filter', 'drop-shadow(0 0 20px #0ff)')
  $('count-down').setAttribute('filter', 'drop-shadow(0 0 20px #8ff) drop-shadow(0 0 20px #8ff8)')
  $('menu').classList.remove('bg-no-glow')
  $('board').classList.remove('bg-no-glow')
}

function disableDist() {
  $('dot-turb').setAttribute('baseFrequency', '0')
  $('body').classList.add('bg-no-dist')
  $('menu').classList.add('bg-no-dist')
  $('board').classList.add('bg-no-dist')
}

function enableDist() {
  $('dot-turb').setAttribute('baseFrequency', '.01')
  $('body').classList.remove('bg-no-dist')
  $('menu').classList.remove('bg-no-dist')
  $('board').classList.remove('bg-no-dist')
}

/** Generate an evil dot's random spawn position */
function createPos() {
  if (Math.random() > .5) {
    if (Math.random() > .5) {
      return [-9, Math.floor((Math.random() * 15) - 7)]
    } else {
      return [9, Math.floor((Math.random() * 15) - 7)]
    }
  } else {
    if (Math.random() > .5) {
      return [Math.floor((Math.random() * 19) - 9), -7]
    } else {
      return [Math.floor((Math.random() * 19) - 9), 7]
    }
  }
}

/** Generate an evil dot's movement direction based on its spawn position */
function createMove(pos) {
  let possibleMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  if (pos[0] >= 7) {
    possibleMoves = possibleMoves.filter((move) => !(move[0] >= 0))
  }
  if (pos[0] <= -7) {
    possibleMoves = possibleMoves.filter((move) => !(move[0] <= 0))
  }
  if (pos[1] >= 5) {
    possibleMoves = possibleMoves.filter((move) => !(move[1] >= 0))
  }
  if (pos[1] <= -5) {
    possibleMoves = possibleMoves.filter((move) => !(move[1] <= 0))
  }
  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
}

/** Create evil dots */
function evilDotSpawn() {
  const evilDot = {}
  if (distEffect) {
    const filter = createNS('filter')
    filter.setAttribute('id', `evil-dot-disp${currentEvilDotIndex}`)

    const feTurbulence = createNS('feTurbulence')
    feTurbulence.setAttribute('type', 'fractalNoise')
    feTurbulence.setAttribute('baseFrequency', .1)
    feTurbulence.setAttribute('numOctaves', 16)
    feTurbulence.setAttribute('result', 'fractal')

    const feDisplacementMap = createNS('feDisplacementMap')
    feDisplacementMap.setAttribute('in', 'SourceGraphic')
    feDisplacementMap.setAttribute('in2', 'fractal')
    feDisplacementMap.setAttribute('yChannelSelector', 'G')
    feDisplacementMap.setAttribute('scale', 8)

    const animateTurbulence = createNS('animate')
    animateTurbulence.setAttribute('attributeName', 'seed')
    animateTurbulence.setAttribute('values', '1;1800')
    animateTurbulence.setAttribute('dur', 60)
    animateTurbulence.setAttribute('repeatCount', 'indefinite')

    $('evil-dots-filters').appendChild(filter)
    filter.appendChild(feTurbulence)
    filter.appendChild(feDisplacementMap)
    feTurbulence.appendChild(animateTurbulence)
    evilDot.feDisplacementMap = feDisplacementMap
  }

  const evilDotG = createNS('g')
  if (glowEffect) {
    evilDotG.setAttribute('filter', 'drop-shadow(0 0 20 #f00)')
  }
  if (distEffect) {
    evilDotG.setAttribute('filter', `url(#evil-dot-disp${currentEvilDotIndex})`)
  }
  if (glowEffect && distEffect) {
    evilDotG.setAttribute('filter', `drop-shadow(0 0 20 #f00) url(#evil-dot-disp${currentEvilDotIndex})`)
  }

  const evilDotCircle = createNS('circle')
  evilDotCircle.setAttribute('id', `evil-dot${currentEvilDotIndex}`)
  evilDotCircle.setAttribute('fill', '#f00')
  evilDotCircle.setAttribute('r', 40)
  evilDotCircle.setAttribute('cx', '50%')
  evilDotCircle.setAttribute('cy', '50%')

  $('evil-dots').appendChild(evilDotG)
  if (distEffect) {
    const effectFixer = createNS('circle')
    effectFixer.setAttribute('r', 160)
    effectFixer.setAttribute('cx', '50%')
    effectFixer.setAttribute('cy', '50%')
    effectFixer.setAttribute('fill', '#f0f0')
    evilDotG.appendChild(effectFixer)
  }
  evilDotG.appendChild(evilDotCircle)

  const pos = createPos()
  const move = createMove(pos)
  setTransform(evilDotCircle, pos)
  evilDots.push({ node: evilDotCircle, pos, group: evilDotG, move, ...evilDot })

  if (currentEvilDotIndex <= nbEvilDots) {
    currentEvilDotIndex++
    timeBetweenSpawns *= .99
    creationTimeout = setTimeout(evilDotSpawn, timeBetweenSpawns)
  }
}

/** Moves the dot according to the key pressed and the keyboard layout */
function moveDot(key, layout, dot, dotPos, otherDotPos) {
  if (layout.up.includes(key) && dotPos[1] >= -5) {
    if (check2pCollision(dot, dotPos, [0, -1], otherDotPos)) {
      dotPos[1] -= 1
      setTransform(dot, dotPos)
    }
  } else if (layout.down.includes(key) && dotPos[1] <= 5) {
    if (check2pCollision(dot, dotPos, [0, 1], otherDotPos)) {
      dotPos[1] += 1
      setTransform(dot, dotPos)
    }
  } else if (layout.left.includes(key) && dotPos[0] >= -7) {
    if (check2pCollision(dot, dotPos, [-1, 0], otherDotPos)) {
      dotPos[0] -= 1
      setTransform(dot, dotPos)
    }
  } else if (layout.right.includes(key) && dotPos[0] <= 7) {
    if (check2pCollision(dot, dotPos, [1, 0], otherDotPos)) {
      dotPos[0] += 1
      setTransform(dot, dotPos)
    }
  }
}

function check2pCollision(dotMoving, dotPosMoving, move, dotPosStatic) {
  if (!twoPlayers) return true
  if (dotPosMoving[0] + move[0] == dotPosStatic[0] && dotPosMoving[1] + move[1] == dotPosStatic[1]) {
    setTransform(dotMoving, [dotPosMoving[0] + move[0] * .5, dotPosMoving[1] + move[1] * .5])
    setTimeout(() => {
      setTransform(dotMoving, dotPosMoving)
    }, 200)
    return false
  }
  return true
}

/** Moves the evil dots and return the new state */
function updateEvilDot(evilDots) {
  const deadDots = []
  evilDots.forEach(({ node, group, pos, move }, index) => {
    // Remove dots going beyond the game's limits 
    if (Math.abs(pos[0]) > 9 || Math.abs(pos[1]) > 7) {
      $('evil-dots').removeChild(group)
      deadDots.push(index)
      return
    }
    pos[0] += move[0]
    pos[1] += move[1]
    setTransform(node, pos)
  })
  return evilDots.filter((_, index) => !deadDots.includes(index))
}

function resetGame() {
  $('dot-disp-map').setAttribute('scale', 256)
  $('high-score').innerHTML = highScore

  setTimeout(() => {
    clearTimeout(creationTimeout)
    clearInterval(evilDotsMove)
    clearInterval(timerInterval)

    evilDots = []
    currentEvilDotIndex = 1
    timeBetweenSpawns = initTimeBetweenSpawns
    currentTime = 0
    dotPos = [initDotPosX, initDotPosY]
    dot1Pos = [initDot1PosX, initDot1PosY]
    dot2Pos = [initDot2PosX, initDot2PosY]
    dot1Dead = false
    dot2Dead = false
    dot.setAttribute('opacity', 1)
    dot1.setAttribute('opacity', 1)
    dot1.classList.remove('ghost')
    dot2.setAttribute('opacity', 1)
    dot2.classList.remove('ghost')

    $('evil-dots').innerHTML = ''
    $('count-down').innerHTML = ''
    $('evil-dots-filters').innerHTML = ''
    $('menu').setAttribute('opacity', 1)
    $('count-down').classList.remove('count-down')
    $('dot-disp-map').setAttribute('scale', 8)

    document.onkeydown = menuSelection
  }, 600)
}

function initialSetup() {
  $('menu').setAttribute('opacity', 0)
  $('count-down').classList.add('count-down')
  $('dot-disp-map').setAttribute('scale', 256)
  setTimeout(() => $('dot-disp-map').setAttribute('scale', 8), 200)

  setTransform(dot, dotPos)
  setTransform(dot1, dot1Pos)
  setTransform(dot2, dot2Pos)
  setTimeout(evilDotSpawn, timeBetweenSpawns)
}

function launchGame() {
  initialSetup()
  dot1.setAttribute('opacity', 0)
  dot2.setAttribute('opacity', 0)
  document.onkeydown = move

  function move({ key }) {
    moveDot(key, layoutMovement1p, dot, dotPos)

    checkCollision()
    checkDistance()
  }

  function checkDistance() {
    if (distEffect) {
      evilDots.forEach(({ feDisplacementMap, pos }) => {
        const distance = calcDistance(pos, dotPos)
        feDisplacementMap.setAttribute('scale', dispScaleFromDistance(distance))
      })
    }
  }

  function checkCollision() {
    if (evilDots.some(({ pos }) => dotPos[0] == pos[0] && dotPos[1] == pos[1])) {
      $('last-score').innerHTML = currentTime
      resetGame()
    }
  }

  evilDotsMove = setInterval(() => {
    evilDots = updateEvilDot(evilDots)
    checkCollision()
    checkDistance()
  }, evilDotsSpeed)

  timerInterval = setInterval(() => {
    $('count-down').innerHTML = ++currentTime
    if (currentTime > highScore) highScore = currentTime
  }, 1000)
}

function launchGame2p() {
  initialSetup()
  dot.setAttribute('opacity', 0)
  document.onkeydown = move

  function move({ key }) {
    moveDot(key, layoutMovement2p1, dot1, dot1Pos, dot2Pos)
    moveDot(key, layoutMovement2p2, dot2, dot2Pos, dot1Pos)

    checkCollision()
    checkDistance()
  }

  function checkDistance() {
    if (distEffect) {
      evilDots.forEach(({ feDisplacementMap, pos }) => {
        const distance1 = !dot1Dead && calcDistance(pos, dot1Pos) || Infinity
        const distance2 = !dot2Dead && calcDistance(pos, dot2Pos) || Infinity
        const distance = Math.min(distance1, distance2)
        feDisplacementMap.setAttribute('scale', dispScaleFromDistance(distance))
      })
    }
  }

  function checkCollision() {
    function killDotIfCollide(dot, dotPos, dotDead, score) {
      if (!dotDead && evilDots.some(({ pos }) => dotPos[0] == pos[0] && dotPos[1] == pos[1])) {
        $(score).innerHTML = currentTime
        setTimeout(() => dot.classList.add('ghost'), 100)
        return true
      }
      return dotDead
    }
    dot1Dead = killDotIfCollide(dot1, dot1Pos, dot1Dead, 'p1-score')
    dot2Dead = killDotIfCollide(dot2, dot2Pos, dot2Dead, 'p2-score')

    if (dot1Dead && dot2Dead) resetGame()
  }

  evilDotsMove = setInterval(() => {
    evilDots = updateEvilDot(evilDots)
    checkCollision()
    checkDistance()
  }, evilDotsSpeed)

  timerInterval = setInterval(() => {
    $('count-down').innerHTML = ++currentTime
    if (currentTime > highScore) highScore = currentTime
  }, 1000)
}
