/** Init dots */
let dot = null
let dot1 = null
let dot2 = null
setTimeout(() => {
  dot = $('dot')
  dot1 = $('dot1')
  dot2 = $('dot2')
})

/** Init game values */
let highScore = 0
let twoPlayers = false
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

let selection = initMenuSelection
let credits = false
let options = false

/** Splash screen */
document.onkeydown = endSplashScreen
function endSplashScreen () {
  $('splash-screen-overlay').remove()
  $('splash-screen').remove()
  $('menu-intro-rect').classList.add('menu-intro')
  createAudio(AUDIO_MAIN_THEME, 1, true).play()
  createAudio(AUDIO_CLICK).play()
  document.onkeydown = menuSelection
}

/** Choose menu options */
function menuSelection ({ key }) {
  if (menuMoveKeys.includes(key)) {
    createAudio(AUDIO_DOT_MOVE, .25)
    selection = menuNavigation[selection][menuMoveXKeys.includes(key) ? 'x' : 'y']
    const mS = $('menu-selection')
    chooseMenuOption(mS, selection, menuOptions)

    function change2p () {
      $('hyphen').setAttribute('opacity', +twoPlayers)
      $('left-menu-title').setAttribute('opacity', +!twoPlayers)
      $('right-menu-title').setAttribute('opacity', +!twoPlayers)
      $('last-score').setAttribute('opacity', +!twoPlayers)
      $('high-score').setAttribute('opacity', +!twoPlayers)
      $('p1-score').setAttribute('opacity', +twoPlayers)
      $('p2-score').setAttribute('opacity', +twoPlayers)
    }

    if (selection == ONE_PLAYER) {
      twoPlayers = false
      change2p()
    } else if (selection == TWO_PLAYER) {
      twoPlayers = true
      change2p()
    }
  }

  if (menuSelectKeys.includes(key)) {
    createAudio(AUDIO_CLICK).play()
    if (selection == ONE_PLAYER) {
      launchGame()
    } else if (selection == TWO_PLAYER) {
      launchGame2p()
    } else if (selection == CREDITS) {
      $('menu-top-page').setAttribute('opacity', 0)
      $('credits-page').setAttribute('opacity', 1)
      document.onkeydown = optionsSelection
    } else if (selection == OPTIONS) {
      $('menu-top-page').setAttribute('opacity', 0)
      $('options-page').setAttribute('opacity', 1)
      document.onkeydown = optionsSelection
    }
  }
}

let optionSelected = initOptionSelection
let glowEffect = true
let distEffect = true
let sounds = true

function optionsSelection ({ key }) {
  if (menuEscape.includes(key)) {
    createAudio(AUDIO_DEATH, .5, false, 3).play()
    $('menu-top-page').setAttribute('opacity', 1)
    $('credits-page').setAttribute('opacity', 0)
    $('options-page').setAttribute('opacity', 0)
    document.onkeydown = menuSelection
  }

  if (menuMoveYKeys.includes(key)) {
    createAudio(AUDIO_DOT_MOVE, .25)
    optionSelected = optionMenuNavigation[optionSelected][menuMoveUpKeys.includes(key) ? 'up' : 'down']
    const oS = $('options-selection')
    chooseMenuOption(oS, optionSelected, optionMenuOptions)
  }

  if (menuSelectKeys.includes(key)) {
    createAudio(AUDIO_CLICK).play()
    if (optionSelected == 'glow' && glowEffect) {
      $('tick-glow').setAttribute('opacity', 0)
      glowEffect = false
      disableGlow()
    } else if (optionSelected == 'dist' && distEffect) {
      $('tick-dist').setAttribute('opacity', 0)
      distEffect = false
      disableDist()
    } else if (optionSelected == 'sounds' && sounds) {
      $('tick-sounds').setAttribute('opacity', 0)
      sounds = false
      disableSounds()
    } else if (optionSelected == 'glow' && !glowEffect) {
      $('tick-glow').setAttribute('opacity', 1)
      glowEffect = true
      enableGlow()
    } else if (optionSelected == 'dist' && !distEffect) {
      $('tick-dist').setAttribute('opacity', 1)
      distEffect = true
      enableDist()
    } else if (optionSelected == 'sounds' && !sounds) {
      $('tick-sounds').setAttribute('opacity', 1)
      sounds = true
      enableSounds()
    }
  }
}

function disableGlow () {
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

function enableGlow () {
  $('menu-top-page-white').setAttribute('filter', 'drop-shadow(0 0 20 #8ffc)')
  $('menu-top-page-yellow').setAttribute('filter', 'drop-shadow(0 0 20 #ff0)')
  $('menu-top-page-cyan').setAttribute('filter', 'drop-shadow(0 0 20 #0ff)')
  $('menu-pages').setAttribute('filter', 'drop-shadow(0 0 20 #8ffc) url(#dot-disp)')
  $('credits-page-yellow').setAttribute('filter', 'drop-shadow(0 0 20 #ff08)')
  $('credits-page-cyan').setAttribute('filter', 'drop-shadow(0 0 20 #0ff8)')
  $('dot').setAttribute('filter', 'drop-shadow(0 0 20 #8ff)')
  $('dot1').setAttribute('filter', 'drop-shadow(0 0 20 #ff0)')
  $('dot2').setAttribute('filter', 'drop-shadow(0 0 20 #0ff)')
  $('count-down').setAttribute('filter', 'drop-shadow(0 0 20 #8ff) drop-shadow(0 0 20 #8ff8)')
  $('menu').classList.remove('bg-no-glow')
  $('board').classList.remove('bg-no-glow')
}

function disableDist () {
  $('dot-turb').setAttribute('baseFrequency', '0')
  $('body').classList.add('bg-no-dist')
  $('menu').classList.add('bg-no-dist')
  $('board').classList.add('bg-no-dist')
}

function enableDist () {
  $('dot-turb').setAttribute('baseFrequency', '.01')
  $('body').classList.remove('bg-no-dist')
  $('menu').classList.remove('bg-no-dist')
  $('board').classList.remove('bg-no-dist')
}

function disableSounds () {

}

function enableSounds () {

}

/** Generate an evil dot's random spawn position */
function createPos () {
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
function createMove (pos) {
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
function evilDotSpawn () {
  createAudio(AUDIO_EVIL_DOT_SPAWN).play()
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
function moveDot (key, layout, dot, dotPos, otherDotPos) {
  if (layout.up.includes(key) && dotPos[1] >= -5) {
    if (check2pCollision(dot, dotPos, [0, -1], otherDotPos)) {
      createAudio(AUDIO_DOT_MOVE, .25)
      dotPos[1] -= 1
      setTransform(dot, dotPos)
    }
  } else if (layout.down.includes(key) && dotPos[1] <= 5) {
    if (check2pCollision(dot, dotPos, [0, 1], otherDotPos)) {
      createAudio(AUDIO_DOT_MOVE, .25)
      dotPos[1] += 1
      setTransform(dot, dotPos)
    }
  } else if (layout.left.includes(key) && dotPos[0] >= -7) {
    if (check2pCollision(dot, dotPos, [-1, 0], otherDotPos)) {
      createAudio(AUDIO_DOT_MOVE, .25)
      dotPos[0] -= 1
      setTransform(dot, dotPos)
    }
  } else if (layout.right.includes(key) && dotPos[0] <= 7) {
    if (check2pCollision(dot, dotPos, [1, 0], otherDotPos)) {
      createAudio(AUDIO_DOT_MOVE, .25)
      dotPos[0] += 1
      setTransform(dot, dotPos)
    }
  }
}

function check2pCollision (dotMoving, dotPosMoving, move, dotPosStatic) {
  if (!twoPlayers) return true
  if (dotPosMoving[0] + move[0] == dotPosStatic[0] && dotPosMoving[1] + move[1] == dotPosStatic[1]) {
    createAudio(AUDIO_DOT_BLOCKED).play()
    setTransform(dotMoving, [dotPosMoving[0] + move[0] * .5, dotPosMoving[1] + move[1] * .5])
    setTimeout(() => {
      setTransform(dotMoving, dotPosMoving)
    }, 200)
    return false
  }
  return true
}

/** Moves the evil dots and return the new state */
function updateEvilDot (evilDots) {
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

function resetGame () {
  $('dot-disp-map').setAttribute('scale', 256)
  $('high-score').innerHTML = highScore
  clearTimeout(creationTimeout)
  clearInterval(evilDotsMove)
  clearInterval(timerInterval)
  document.onkeydown = null

  setTimeout(() => {
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
    dot.classList.remove('dead')
    dot1.setAttribute('opacity', 1)
    dot1.classList.remove('ghost')
    dot1.classList.remove('dead')
    dot2.setAttribute('opacity', 1)
    dot2.classList.remove('ghost')
    dot2.classList.remove('dead')

    $('evil-dots').innerHTML = ''
    $('count-down').innerHTML = ''
    $('evil-dots-filters').innerHTML = ''
    $('menu').setAttribute('opacity', 1)
    $('count-down').classList.remove('count-down')
    $('dot-disp-map').setAttribute('scale', 8)

    document.onkeydown = menuSelection
  }, 600)
}

function initialSetup () {
  $('menu').setAttribute('opacity', 0)
  $('count-down').classList.add('count-down')
  $('dot-disp-map').setAttribute('scale', 256)
  setTimeout(() => $('dot-disp-map').setAttribute('scale', 8), 200)

  setTransform(dot, dotPos)
  setTransform(dot1, dot1Pos)
  setTransform(dot2, dot2Pos)
  setTimeout(evilDotSpawn, timeBetweenSpawns)
}

function launchGame () {
  initialSetup()
  dot1.setAttribute('opacity', 0)
  dot2.setAttribute('opacity', 0)
  document.onkeydown = move

  function move ({ key }) {
    moveDot(key, layoutMovement1p, dot, dotPos)

    checkCollision()
    checkDistance()
  }

  function checkDistance () {
    if (distEffect) {
      evilDots.forEach(({ feDisplacementMap, pos }) => {
        const distance = calcDistance(pos, dotPos)
        feDisplacementMap.setAttribute('scale', dispScaleFromDistance(distance))
      })
    }
  }

  function checkCollision () {
    if (evilDots.some(({ pos }) => dotPos[0] == pos[0] && dotPos[1] == pos[1])) {
      $('last-score').innerHTML = currentTime
      createAudio(AUDIO_DEATH).play()
      dot.classList.add('dead')
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

function launchGame2p () {
  initialSetup()
  dot.setAttribute('opacity', 0)
  document.onkeydown = move

  function move ({ key }) {
    moveDot(key, layoutMovement2p1, dot1, dot1Pos, dot2Pos)
    moveDot(key, layoutMovement2p2, dot2, dot2Pos, dot1Pos)

    checkCollision()
    checkDistance()
  }

  function checkDistance () {
    if (distEffect) {
      evilDots.forEach(({ feDisplacementMap, pos }) => {
        const distance1 = !dot1Dead && calcDistance(pos, dot1Pos) || Infinity
        const distance2 = !dot2Dead && calcDistance(pos, dot2Pos) || Infinity
        const distance = Math.min(distance1, distance2)
        feDisplacementMap.setAttribute('scale', dispScaleFromDistance(distance))
      })
    }
  }

  function checkCollision () {
    function killDotIfCollide (dot, dotPos, dotDead, score) {
      if (!dotDead && evilDots.some(({ pos }) => dotPos[0] == pos[0] && dotPos[1] == pos[1])) {
        $(score).innerHTML = currentTime
        if (!dot1Dead && !dot2Dead) {
          createAudio(AUDIO_GHOST).play()
        }
        dot.classList.add('dead')
        setTimeout(() => dot.classList.add('ghost'), 100)
        return true
      }
      return dotDead
    }
    dot1Dead = killDotIfCollide(dot1, dot1Pos, dot1Dead, 'p1-score')
    dot2Dead = killDotIfCollide(dot2, dot2Pos, dot2Dead, 'p2-score')

    if (dot1Dead && dot2Dead) {
      createAudio(AUDIO_DEATH).play()
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

let gamepadIndex
window.addEventListener('gamepadconnected', (event) => {
  gamepadIndex = event.gamepad.index
})

let splashScreen = true

setInterval(() => {
  if (gamepadIndex !== undefined) {
    const myGamepad = navigator.getGamepads()[gamepadIndex]
    myGamepad.buttons.map(e => e.pressed).forEach((isPressed, buttonIndex) => {
      if (isPressed) {
        console.log(buttonIndex)
      }
      if (isPressed && splashScreen == true) {
        endSplashScreen()
        splashScreen = false
      }
    })
  }
}, 10)
