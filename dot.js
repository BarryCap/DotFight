let highScore = 0
let twoPlayers = false

function $(id) {
  return document.getElementById(id)
}

document.addEventListener('keydown', menuSelection, false)
document.addEventListener('keydown', launch, false)

function menuSelection(e) {
  if (e.key == 'a' || e.key == 'q' || e.key == 'd' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'Tab') {
    $('menu-selection').setAttribute('x', twoPlayers? 240:800)
    $('hyphen').setAttribute('opacity', twoPlayers? 0:1)
    $('left-menu-title').setAttribute('opacity', twoPlayers? 1:0)
    $('right-menu-title').setAttribute('opacity', twoPlayers? 1:0)
    $('last-score').setAttribute('opacity', twoPlayers? 1:0)
    $('high-score').setAttribute('opacity', twoPlayers? 1:0)
    $('p1-score').setAttribute('opacity', twoPlayers? 0:1)
    $('p2-score').setAttribute('opacity', twoPlayers? 0:1)
    twoPlayers = !twoPlayers
  }
}

function launch(e) {
  if (e.key == ' ' || e.key == 'Enter') {
    if (twoPlayers) {
      launchGame2p()
    } else {
      launchGame()
    }
  }
}

const createPos = () => {
  if (Math.random() > 0.5) {
    if (Math.random() > 0.5) {
      return [-9, Math.floor((Math.random() * 15) - 7)]
    } else {
      return [9, Math.floor((Math.random() * 15) - 7)]
    }
  } else {
    if (Math.random() > 0.5) {
      return [Math.floor((Math.random() * 19) - 9), -7]
    } else {
      return [Math.floor((Math.random() * 19) - 9), 7]
    }
  }
}
const createMove = (pos) => {
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

function launchGame() {
  $('menu').setAttribute('opacity', 0)
  $('dot-disp-map').setAttribute('scale', 256)
  setTimeout(() => {
    $('dot-disp-map').setAttribute('scale', 8)
  }, 200)

  let dot = null
  let dotPos = [0, 0]
  let currentTime = 0

  const nbEvilDots = 8096
  let creationTimeout = null
  let evilDots = []

  setTimeout(() => {
    dot = $('dot')
    setTransform(dot, dotPos)
    $('count-down').classList.add('count-down')
    $('dot').classList.remove('dead')
    $('dot1').classList.add('dead')
    $('dot2').classList.add('dead')
  })

  let currentEvilDotIndex = 1
  let timeBeforeNew = 1000
  const create = () => {
    if (currentEvilDotIndex <= nbEvilDots) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
      filter.setAttribute('id', `evil-dot-disp${currentEvilDotIndex}`)

      const feTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence')
      filter.appendChild(feTurbulence)
      feTurbulence.setAttribute('type', 'fractalNoise')
      feTurbulence.setAttribute('baseFrequency', '.1')
      feTurbulence.setAttribute('numOctaves', '16')
      feTurbulence.setAttribute('result', 'fractal')

      const animateTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
      feTurbulence.appendChild(animateTurbulence)
      animateTurbulence.setAttribute('attributeName', 'seed')
      animateTurbulence.setAttribute('values', '1;1800')
      animateTurbulence.setAttribute('dur', '60')
      animateTurbulence.setAttribute('repeatCount', 'indefinite')

      const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
      filter.appendChild(feDisplacementMap)
      feDisplacementMap.setAttribute('in', 'SourceGraphic')
      feDisplacementMap.setAttribute('in2', 'fractal')
      feDisplacementMap.setAttribute('yChannelSelector', 'G')
      feDisplacementMap.setAttribute('scale', '8')

      $('evil-dots-filters').appendChild(filter)

      const evilDotG = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const effectFixer = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      evilDotG.appendChild(effectFixer)
      effectFixer.setAttribute('r', '1')
      effectFixer.setAttribute('cx', '-100%')
      effectFixer.setAttribute('cy', '-100%')

      node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      evilDotG.appendChild(node)
      node.setAttribute('id', `evil-dot${currentEvilDotIndex}`)
      node.setAttribute('fill', '#f00')
      evilDotG.setAttribute('filter', `drop-shadow(0 0 20 #f00) url(#evil-dot-disp${currentEvilDotIndex})`)
      node.setAttribute('r', 40)
      node.setAttribute('cx', '50%')
      node.setAttribute('cy', '50%')
      $('evil-dots').appendChild(evilDotG)
      const pos = createPos()
      const move = createMove(pos)
      setTransform(node, pos)
      evilDots.push({node, pos, group: evilDotG, move, feDisplacementMap})
      currentEvilDotIndex++
      timeBeforeNew *= 0.99
      creationTimeout = setTimeout(create, timeBeforeNew)
    }
  }

  setTimeout(create, timeBeforeNew)
  
  document.onkeydown = move
  
  function setTransform(node, [x, y]) {
    node.setAttribute('transform', `translate(${x*80} ${y*80})`)
  }

  function move(e) {
    e = e || window.event
    if ((e.key == 'w' || e.key == 'z' || e.key == 'ArrowUp') && dotPos[1] >= -5) {
      dotPos[1] -=  1
    } else if ((e.key == 's' || e.key == 'ArrowDown') && dotPos[1] <= 5) {
      dotPos[1] +=  1
    } else if ((e.key == 'a' || e.key == 'q' || e.key == 'ArrowLeft') && dotPos[0] >= -7) {
      dotPos[0] -=  1
    } else if ((e.key == 'd' || e.key == 'ArrowRight') && dotPos[0] <= 7) {
      dotPos[0] +=  1
    }
    setTransform(dot, dotPos)
    checkCollision()
    checkDistance()
  }

  function checkDistance() {
    evilDots.forEach(({feDisplacementMap, pos}) => {
      const distance = ((pos[0] - dotPos[0])**2 + (pos[1] - dotPos[1])**2)**0.5
      feDisplacementMap.setAttribute('scale', 128 / (distance || .75))
    })
  }

  function checkCollision() {
    if (evilDots.some(({pos}) => dotPos[0] == pos[0] && dotPos[1] == pos[1])) {
      $('dot-disp-map').setAttribute('scale', 256)
      $('last-score').innerHTML = currentTime
      $('high-score').innerHTML = highScore
      setTimeout(() => {
        dot.classList.add('dead')
      }, 100)
      setTimeout(() => {
        clearInterval(evilDotsMove)
        clearInterval(timerInterval)
        clearTimeout(creationTimeout)
        dotPos = [0, 0]
        currentTime = 0
        evilDots = []
        $('evil-dots').innerHTML = ''
        $('count-down').innerHTML = ''
        $('evil-dots-filters').innerHTML = ''
        dot.classList.remove('dead')
        setTransform(dot, dotPos)
        $('count-down').classList.remove('count-down')

        document.onkeydown = launch
        $('menu').setAttribute('opacity', 1)
        $('dot-disp-map').setAttribute('scale', 8)
      }, 600)
    }
  }

  const evilDotsMove = setInterval(() => {
    const deadDots = []
    evilDots.forEach(({node, group, pos, move}, index) => {
      if (Math.abs(pos[0]) > 9 || Math.abs(pos[1]) > 7) {
        $('evil-dots').removeChild(group)
        deadDots.push(index)
        return
      }
      pos[0] +=  move[0]
      pos[1] +=  move[1]
      setTransform(node, pos)
    })
    evilDots = evilDots.filter((_,index) => !deadDots.includes(index))
    checkCollision()
    checkDistance()
  }, 400)

  const timerInterval = setInterval(() =>  {
    $('count-down').innerHTML = ++currentTime
    if(currentTime > highScore) {
      highScore = currentTime
    }
  }, 1000)
}

function launchGame2p() {
  $('menu').setAttribute('opacity', 0)
  $('dot-disp-map').setAttribute('scale', 256)
  setTimeout(() => {
    $('dot-disp-map').setAttribute('scale', 8)
  }, 200)

  let dot1 = null
  let dot2 = null
  let dot1Pos = [-2, 0]
  let dot2Pos = [2, 0]
  let dot1Dead = false
  let dot2Dead = false

  let currentTime = 0

  const nbEvilDots = 8096
  let creationTimeout = null
  let evilDots = []

  setTimeout(() => {
    dot1 = $('dot1')
    dot2 = $('dot2')
    setTransform(dot1, dot1Pos)
    setTransform(dot2, dot2Pos)
    $('count-down').classList.add('count-down')
    $('dot').classList.add('dead')
    $('dot1').classList.remove('dead')
    $('dot2').classList.remove('dead')
  })

  let currentEvilDotIndex = 1
  let timeBeforeNew = 1000
  const create = () => {
    if (currentEvilDotIndex <= nbEvilDots) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
      filter.setAttribute('id', `evil-dot-disp${currentEvilDotIndex}`)

      const feTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence')
      filter.appendChild(feTurbulence)
      feTurbulence.setAttribute('type', 'fractalNoise')
      feTurbulence.setAttribute('baseFrequency', '.1')
      feTurbulence.setAttribute('numOctaves', '16')
      feTurbulence.setAttribute('result', 'fractal')

      const animateTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
      feTurbulence.appendChild(animateTurbulence)
      animateTurbulence.setAttribute('attributeName', 'seed')
      animateTurbulence.setAttribute('values', '1;1800')
      animateTurbulence.setAttribute('dur', '60')
      animateTurbulence.setAttribute('repeatCount', 'indefinite')

      const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
      filter.appendChild(feDisplacementMap)
      feDisplacementMap.setAttribute('in', 'SourceGraphic')
      feDisplacementMap.setAttribute('in2', 'fractal')
      feDisplacementMap.setAttribute('yChannelSelector', 'G')
      feDisplacementMap.setAttribute('scale', '8')

      $('evil-dots-filters').appendChild(filter)

      const evilDotG = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const effectFixer = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      evilDotG.appendChild(effectFixer)
      effectFixer.setAttribute('r', '1')
      effectFixer.setAttribute('cx', '-100%')
      effectFixer.setAttribute('cy', '-100%')

      node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      evilDotG.appendChild(node)
      node.setAttribute('id', `evil-dot${currentEvilDotIndex}`)
      node.setAttribute('fill', '#f00')
      evilDotG.setAttribute('filter', `drop-shadow(0 0 20 #f00) url(#evil-dot-disp${currentEvilDotIndex})`)
      node.setAttribute('r', 40)
      node.setAttribute('cx', '50%')
      node.setAttribute('cy', '50%')
      $('evil-dots').appendChild(evilDotG)
      const pos = createPos()
      const move = createMove(pos)
      setTransform(node, pos)
      evilDots.push({node, pos, group: evilDotG, move, feDisplacementMap})
      currentEvilDotIndex++
      timeBeforeNew *= 0.99
      creationTimeout = setTimeout(create, timeBeforeNew)
    }
  }

  setTimeout(create, timeBeforeNew)

  document.onkeydown = move

  function setTransform(node, [x, y]) {
    node.setAttribute('transform', `translate(${x*80} ${y*80})`)
  }

  function move(e) {
    e = e || window.event
    if ((e.key == 'w' || e.key == 'z') && dot1Pos[1] >= -5) {
      dot1Pos[1] -=  1
    } else if ((e.key == 's') && dot1Pos[1] <= 5) {
      dot1Pos[1] +=  1
    } else if ((e.key == 'a' || e.key == 'q') && dot1Pos[0] >= -7) {
      dot1Pos[0] -=  1
    } else if ((e.key == 'd') && dot1Pos[0] <= 7) {
      dot1Pos[0] +=  1
    }
    setTransform(dot1, dot1Pos)

    if ((e.key == 'ArrowUp') && dot2Pos[1] >= -5) {
      dot2Pos[1] -=  1
    } else if ((e.key == 'ArrowDown') && dot2Pos[1] <= 5) {
      dot2Pos[1] +=  1
    } else if ((e.key == 'ArrowLeft') && dot2Pos[0] >= -7) {
      dot2Pos[0] -=  1
    } else if ((e.key == 'ArrowRight') && dot2Pos[0] <= 7) {
      dot2Pos[0] +=  1
    }
    setTransform(dot2, dot2Pos)

    checkCollision()
    checkDistance()
  }

  function checkDistance() {
    evilDots.forEach(({feDisplacementMap, pos}) => {
      const distance = ((pos[0] - dot1Pos[0]) ** 2 + (pos[1] - dot1Pos[1]) ** 2) ** .5
      feDisplacementMap.setAttribute('scale', 128 / (distance || .75))
    })
  }

  function checkCollision() {
    if (evilDots.some(({pos}) => dot1Pos[0] == pos[0] && dot1Pos[1] == pos[1])) {
      dot1Dead = true
      setTimeout(() => {
        dot1.classList.add('dead')
      }, 100)
    }
    if (evilDots.some(({pos}) => dot2Pos[0] == pos[0] && dot2Pos[1] == pos[1])) {
      dot2Dead = true
      setTimeout(() => {
        dot2.classList.add('dead')
      }, 100)
    }
    if (dot1Dead) {
      $('p1-score').innerHTML = currentTime
    }
    if (dot2Dead) {
      $('p2-score').innerHTML = currentTime
    }
    if (dot1Dead && dot2Dead) {
      $('dot-disp-map').setAttribute('scale', 256)

      setTimeout(() => {
        clearInterval(evilDotsMove)
        clearInterval(timerInterval)
        clearTimeout(creationTimeout)
        dot1Pos = [-2, 0]
        dot2Pos = [2, 0]
        currentTime = 0
        evilDots = []
        $('evil-dots').innerHTML = ''
        $('count-down').innerHTML = ''
        $('evil-dots-filters').innerHTML = ''
        dot1.classList.remove('dead')
        dot2.classList.remove('dead')
        setTransform(dot1, dot1Pos)
        setTransform(dot2, dot2Pos)
        $('count-down').classList.remove('count-down')

        document.onkeydown = launch
        $('menu').setAttribute('opacity', 1)
        $('dot-disp-map').setAttribute('scale', 8)
      }, 600)
    }
  }

  const evilDotsMove = setInterval(() => {
    const deadDots = []
    evilDots.forEach(({node, group, pos, move}, index) => {
      if (Math.abs(pos[0]) > 9 || Math.abs(pos[1]) > 7) {
        $('evil-dots').removeChild(group)
        deadDots.push(index)
        return
      }
      pos[0] +=  move[0]
      pos[1] +=  move[1]
      setTransform(node, pos)
    })
    evilDots = evilDots.filter((_,index) => !deadDots.includes(index))
    checkCollision()
    checkDistance()
  }, 400)

  const timerInterval = setInterval(() =>  {
    $('count-down').innerHTML = ++currentTime
    if(currentTime > highScore) {
      highScore = currentTime
    }
  }, 1000)
}
