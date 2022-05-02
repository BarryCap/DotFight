let dot = null
let dotPos = [0, 0]
let currentTime = 1

const evilDots = [
  {
    pos: [-9, -7],
    move: [1, 1],
  },
  {
    pos: [-9, -7],
    move: [1, 1],
  },
  {
    pos: [0, -7],
    move: [0, 1],
  },
  {
    pos: [9, -7],
    move: [-1, 1],
  },
  {
    pos: [9, 0],
    move: [-1, 0],
  },
  {
    pos: [9, 7],
    move: [-1, -1],
  },
  {
    pos: [0, 7],
    move: [0, -1],
  },
  {
    pos: [-9, 7],
    move: [1, -1],
  },
  {
    pos: [-9, 0],
    move: [1, 0],
  },
]

setTimeout(() => {
  dot = document.getElementById('dot')
  setTransform(dot, dotPos)
})

setTimeout(() => {
  evilDots.forEach(({node, pos}, i) => {
    node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    node.setAttribute('id', `evil-dot${i}`)
    node.setAttribute('fill', '#f00')
    node.setAttribute('filter', 'drop-shadow(0 0 20 #f00)')
    node.setAttribute('r', 40)
    node.setAttribute('cx', '50%')
    node.setAttribute('cy', '50%')
    document.getElementById('evil-dots').appendChild(node)
    setTransform(node, pos)
    evilDots[i].node = node
  })
})

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
  console.log(dotPos)
}

function checkCollision() {
  if (evilDots.some(({pos}) => dotPos[0] == pos[0] && dotPos[1] == pos[1])) {
    document.getElementById('dot-disp-map').setAttribute('scale', 256)
    setTimeout(() => {
      dot.classList.add('dead')
    }, 100)
    setTimeout(() => {
      location.reload()
    }, 600)
  }
}

setInterval(() => {
  evilDots.forEach(({node, pos, move}) => {
    pos[0] +=  move[0]
    pos[1] +=  move[1]
    setTransform(node, pos)
  })
  checkCollision()
}, 400)

setInterval(() =>  {
  document.getElementById('count-down').innerHTML = currentTime++
}, 1000)
