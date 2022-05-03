let highScore = 0

function $(id) {
  return document.getElementById(id)
}

document.onkeydown = launch

function launch(e) {
  if (e.key == ' ' || e.key == 'Enter') {
    console.log('bulb')
    launchGame()
  }
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
  })

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
  let currentEvilDotIndex = 1
  let timeBeforeNew = 1000
  const create = () => {
    if (currentEvilDotIndex <= nbEvilDots) {
      node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      node.setAttribute('id', `evil-dot${currentEvilDotIndex}`)
      node.setAttribute('fill', '#f00')
      node.setAttribute('filter', 'drop-shadow(0 0 20 #f00)')
      node.setAttribute('r', 40)
      node.setAttribute('cx', '50%')
      node.setAttribute('cy', '50%')
      $('evil-dots').appendChild(node)
      const pos = createPos()
      const move = createMove(pos)
      setTransform(node, pos)
      evilDots.push({node, pos, move })
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
    if ((e.key == 'z' || e.key == 'ArrowUp') && dotPos[1] >= -5) {
      dotPos[1] -=  1
      setTransform(dot, dotPos)
    } else if ((e.key == 's' || e.key == 'ArrowDown') && dotPos[1] <= 5) {
      dotPos[1] +=  1
    } else if ((e.key == 'q' || e.key == 'ArrowLeft') && dotPos[0] >= -7) {
      dotPos[0] -=  1
    } else if ((e.key == 'd' || e.key == 'ArrowRight') && dotPos[0] <= 7) {
      dotPos[0] +=  1
    }
    setTransform(dot, dotPos)
    checkCollision()
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
    evilDots.forEach(({node, pos, move}, index) => {
      if (Math.abs(pos[0]) > 9 || Math.abs(pos[1]) > 7) {
        $('evil-dots').removeChild(node)
        deadDots.push(index)
        return
      }
      pos[0] +=  move[0]
      pos[1] +=  move[1]
      setTransform(node, pos)
    })
    evilDots = evilDots.filter((_,index) => !deadDots.includes(index))
    checkCollision()
  }, 400)

  const timerInterval = setInterval(() =>  {
    $('count-down').innerHTML = ++currentTime
    if(currentTime > highScore) {
      highScore = currentTime
    }
  }, 1000)
}
