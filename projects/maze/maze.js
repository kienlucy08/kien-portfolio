/*
Assignment: Final Project
Author: Lucy Kien 
Date: 06/06/2024 
*/

// key and door info
let door, key, keyObtained;

// maze information 
let maze;
let visited;
let tileSize = 40;
let cols, rows;

// sounds information 
let backgroundSound, heartbeat, footsteps, static;

// sprite and player information 
let player;
let forward, back, left, right, keySprite, doorSprite, enemyOne, enemyTwo, tileUnvisited, tileVisited, instructions;

// overlap time used for displaying a message
let messageDuration = 3000;
let doorOverlapTime;

// enemy info
let enemies = [];
let nearEnemy;

// instructions info
let showInstructions;
let startTimerInstructions;

// preload function 
function preload() {
	// movement
  forward = loadImage('forward.png');
	back = loadImage('back.png');
	left = loadImage('left.png');
	right = loadImage('right.png');
	
	// key and door
	keySprite = loadImage('key.png');
	doorSprite = loadImage('door.png');
	
	// enemy 
	enemyOne = loadImage('evil.png');
	
	// tile textures
	tileUnvisited = loadImage('starting_texture.png');
	tileVisited = loadImage('visited_texture.png');
	
	// sounds
	backgroundSound = loadSound('background.mp3');
	heartbeat = loadSound('heartbeat.mp3');
	footsteps = loadSound('steps_cut.mp3');
	static = loadSound('static.mp3');
	
	// instructions
	instructions = loadStrings('instructions.txt');
}

function setup() {
	// canvas
  createCanvas(800, 800);
	
	// background sounds starts playing 
	backgroundSound.play();
	backgroundSound.setVolume(0.5);
	backgroundSound.loop();
	
	// heartbeat sounds
	heartbeat.loop();
	heartbeat.setVolume(0.6);
	
	// set rows and columns for generating the maze
  cols = width / tileSize;
  rows = height / tileSize;
  maze = generateMaze(cols, rows);
	// Initialize visited array
  visited = Array(rows).fill().map(() => Array(cols).fill(false)); 
  
	// create player
  player =createSprite(tileSize / 2, tileSize / 2, 32, 32);
	player.shapeColor = color(255, 0,0);
	// add animations for it and set the original animation to forward
	player.addAni('forward', forward, 2);
	player.addAni('back', back, 2);
	player.addAni('right', right, 2);
	player.addAni('left', left, 2);
	player.changeAni('forward');

  // randomly place the door in the maze
  let doorPosition = getRandomPathPosition();
	// create the door sprite
  door = createSprite(doorPosition.x * tileSize + tileSize / 2, doorPosition.y * tileSize + tileSize / 2, 32, 32);
	door.shapeColor = color(255, 0,0);
	// add the texture frame and set collider
	door.addAni('idle', doorSprite, 2);
	door.changeAni('idle');
	door.collider = 'none';
	
	// the key is not yet obtained
	keyObtained = false;
	// randomly place the key in the maze
	let keyPosition = getRandomPathPosition();
	// create the key sprite
	key = createSprite(keyPosition.x * tileSize + tileSize/2, keyPosition.y * tileSize + tileSize / 2, 32, 32);
	key.shapeColor = color(255, 0,0);
	// add the texture frame and set collider
	key.addAni('idleKey', keySprite, 2);
	key.changeAni('idleKey');
	key.collider = 'none';
	
	// create five enemy sprites
  for (let i = 0; i < 5; i++) {
    let enemyPosition = getRandomPathPosition();
    let enemy = createSprite(enemyPosition.x * tileSize + tileSize / 2, enemyPosition.y * tileSize + tileSize / 2, 32, 32);
    enemy.shapeColor = color(255, 0, 0);
		// add an idle animation
		enemy.addAni('enemyIdle', enemyOne, 2);
    enemies.push(enemy);
  }
	// near enemy and show instructions is false
	nearEnemy = false;
	showInstructions = false;
	
}

// draw function
function draw() {
	// background is black
  background(0);
	
	// showing instructions for 7 seconds
	if (showInstructions && (millis() - startTimer < 7000)) {
    // loop through array to show each line
    for (let i = 0; i < instructions.length; i++) {
        let myString = instructions[i];
        textSize(12);
			 	// calculate the width of the text
        let textWid = textWidth(myString);
				// calculate the height of the text
        let textHeight = textAscent() + textDescent(); 
				// x pos and y pos of the text
        let x = player.position.x; 
        let y = player.position.y + (i * 30);
				// background height and width with padding
        let bgWidth = textWid + 10;
        let bgHeight = textHeight + 5;

        // draw the background rectangle
        fill(0); 
				// square behind instructions so visible
        rect(x - 5, y - textAscent() + 2, bgWidth, bgHeight); 
				
				// text is white
        fill(255);
        text(myString, x, y); 
    }
	} else {
			// reset boolean and clear screen
			background(0);
			showInstructions = false;
	}

	// apply scaling and translation
  scale(2);
  translate((width / (4)) - player.position.x, (height / (4)) - player.position.y);

  // draw maze
  drawMaze();

  // player movement
  let prevPosition = player.position.copy();
  let playerSpeed = 1;
  let moved = false;
	
	// key tracking which tracks the arrows and changes the animation
  if (keyIsDown(LEFT_ARROW)) {
		player.changeAni('left');
    player.position.x -= playerSpeed;
    moved = true;
		//footsteps.play();
  } else if (keyIsDown(RIGHT_ARROW)) {
		player.changeAni('right');
    player.position.x += playerSpeed;
    moved = true;
  } else if (keyIsDown(UP_ARROW)) {
		player.changeAni('back');
    player.position.y -= playerSpeed;
    moved = true;
  } else if (keyIsDown(DOWN_ARROW)) {
		player.changeAni('forward');
    player.position.y += playerSpeed;
    moved = true;
		// if enter is pressed display the instructions
  } else if (keyIsDown(ENTER)) {
		if (showInstructions == false) {
			showInstructions = true;
			startTimer = millis();
		}
	}
	
	// if the player is moving play footsteps
	if (moved) {
    if (!footsteps.isPlaying()) {
      footsteps.loop();
      footsteps.setVolume(0.5);
    }
  } else {
    footsteps.stop();
  }
	
	// collision stuff
	
	// check for collision
  if (moved && checkCollision(player.position.x, player.position.y)) {
    player.position = prevPosition;
  }
  
	// check if the player overlaps the door
  if (player.overlap(door)) {
		// only if the key is obtained let the player escape
    if (keyObtained) {
      escape();
			// record the time when the player overlaps the door without the key
    } else {
      doorOverlapTime = millis(); 
    }
  }
	// display the door overlap message for the specified duration
  if (doorOverlapTime && millis() - doorOverlapTime < messageDuration) {
		textSize(24);
		textStyle(BOLD);
  	fill(255, 255, 0);
    text('You need the key!', player.position.x - 100, player.position.y - 30);
  }
	
	// if the player overlaps the key set the boolean true
	if (player.overlap(key)) {
    keyObtained = true;
		// record the time when the key is obtained
    keyObtainedTime = millis(); 
  }
	
	// set the key to be above the user
  if (keyObtained) {
    key.position.x = player.position.x;
    key.position.y = player.position.y - 20; 

    // display the message for the specified duration
    if (millis() - keyObtainedTime < messageDuration) {
			textSize(12);
			textStyle(BOLD);
  		fill(255, 255, 0);
      text('You have obtained the key! Find the door', player.position.x - 130, player.position.y - 30);
  	}
	}
	
	// move and display enemies
  for (let enemy of enemies) {
    moveEnemy(enemy);
  }
	
	// check player to enemy proximity
	nearEnemy = false;
	for (let i = enemies.length - 1; i >= 0; i--) {
		let enemy = enemies[i];
		// calcualte the distance to enemy
		let distanceToEnemy = dist(player.position.x, player.position.y, enemy.position.x, enemy.position.y);
		// if less than 100 show the enemy
		if (distanceToEnemy < 100) {
			nearEnemy = true;		
			enemy.visible = true;
			// trigger volume increase when player is close to enemy  (closer = louder)
			let vol = map(distanceToEnemy, 0, 100, 1.0, 0.0);
			// mapping playback rate, closer is faster
			let playbackRate = map(distanceToEnemy, 0, 100, 2.0, 1.0);
			// if the static isn't already playing play it and the heartbeat setting
			if(!static.isPlaying()){
				static.loop();
				static.setVolume(vol * 2.5);
				heartbeat.setVolume(vol * 2.5);
				heartbeat.rate(playbackRate);
				// stop and reset the sounds
			} else {
				static.stop();
				heartbeat.setVolume(0.6);
				heartbeat.rate(1.0);
			}		
			// only display visual effects when closer to the enemy
			if(distanceToEnemy < 80){
				applyVisualEffects();
				static.setVolume(vol * 2.5);
				heartbeat.setVolume(vol * 2.5);
			}
			// when overlap remove the enemy and take away effects
			if (player.overlaps(enemy)) {
				enemy.remove();
				enemies.splice(i, 1);
				// stop audio
				static.stop();
				heartbeat.rate(1.0);
				heartbeat.setVolume(0.6);
				resetVisualEffects();
			}

			// else the enemy is not visible and effects are not present
		} else {
			enemy.visible = false;
			resetVisualEffects();
			heartbeat.setVolume(0.6);
			heartbeat.rate(1.0);
		}
	}
	// when not near enemy reset
	if (!nearEnemy) {
		static.stop();
		heartbeat.setVolume(0.6);
		heartbeat.rate(1.0);
		resetVisualEffects();
	}
	
	// check if the player is near the door so display it
  let distanceToDoor = dist(player.position.x, player.position.y, door.position.x, door.position.y);
  if (distanceToDoor < 100) {
    door.visible = true;
  } else {
    door.visible = false;
  }
	
	// check if the player is near the key so display it
	let distanceToKey = dist(player.position.x, player.position.y, key.position.x, key.position.y);
  if (distanceToKey < 100) {
    key.visible = true;
  } else {
    key.visible = false;
  }
}

// function to draw the maze tiles
function drawMaze() {
  // define the viewing radius around the player
  let radius = 2;
  // determine the column and row of the players position
  let playerCol = floor(player.position.x / tileSize);
  let playerRow = floor(player.position.y / tileSize);

  // loop through tiles within the viewing radius
  for (let y = max(0, playerRow - radius); y < min(rows, playerRow + radius); y++) {
    for (let x = max(0, playerCol - radius); x < min(cols, playerCol + radius); x++) {
      // check if the tile is a wall or has been visited
      if (maze[y][x] === 1 || visited[y][x]) { 
        // if visited, draw a visited tile image; otherwise, draw a wall rectangle
        if (visited[y][x]) {
          image(tileVisited, x * tileSize, y * tileSize, tileSize, tileSize);
        } else {
					// black color for walls
          fill(0);
          rect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      } else {
				// draw unvisited tile image
        image(tileUnvisited, x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
  
  // mark the current cell as visited
  visited[playerRow][playerCol] = true;
}

// function to generate the maze different each time
function generateMaze(cols, rows) {
  // initialize maze with all walls
  let maze = Array(rows).fill().map(() => Array(cols).fill(1));
  let stack = [];
  let currentCell = { x: 0, y: 0 };
	// mark starting cell as empty space
  maze[0][0] = 0; 

  // generate maze using depth first search algorithm
  while (true) {
		// check neighbors functions 
    let next = checkNeighbors(currentCell.x, currentCell.y);
    if (next) {
			// mark cell as empty space
      maze[next.y][next.x] = 0;
			// push and set current cell to next
      stack.push(currentCell);
      currentCell = next;
    } else if (stack.length > 0) {
			// pop the current cell when stack is > 0
      currentCell = stack.pop();
    } else {
      break;
    }
  }

  // function to check neighboring cells during maze generation
	function checkNeighbors(x, y) {
		// array to store neighboring cells
		let neighbors = [];
		let directions = [ 
			{ x: -2, y: 0 }, { x: 2, y: 0 }, 
			{ x: 0, y: -2 }, { x: 0, y: 2 }
		];

		// loop through directions to check neighboring cells
		for (let direction of directions) {
			// calc the neighbor column and row
			let nx = x + direction.x; // Calculate neighbor's column index
			let ny = y + direction.y; // Calculate neighbor's row index

			// check if neighbor is within maze bounds and is a wall
			if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1) {
				neighbors.push({ x: nx, y: ny });
			}
		}

		// if there are neighboring cells choose one randomly and mark midpoint as empty space
		if (neighbors.length > 0) {
			// choose a random neighbor index
			let randIndex = floor(random(neighbors.length)); 
			let chosen = neighbors[randIndex];
			let betweenX = (chosen.x + x) / 2;
			let betweenY = (chosen.y + y) / 2;
			maze[betweenY][betweenX] = 0;
			return chosen; 
		} else {
			// if no valid neighbors, return null
			return null;
		}
	}
	// return the maze
  return maze;
}

// function to check collisions for the player
function checkCollision(x, y) {
  let halfSize = player.width / 2;

  // check if the player hits the edge of the map
  if (x - halfSize < 0 || x + halfSize > width || y - halfSize < 0 || y + halfSize > height) {
    return true;
  }

  // check four corners of the player against maze walls
  let corners = [
    { x: x - halfSize, y: y - halfSize },
    { x: x + halfSize, y: y - halfSize },
    { x: x - halfSize, y: y + halfSize },
    { x: x + halfSize, y: y + halfSize }
  ];
	
	// for corners
  for (let corner of corners) {
		// set row and oclumns
    let col = floor(corner.x / tileSize);
    let row = floor(corner.y / tileSize);
		// if it is in the scope 
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      if (maze[row][col] === 1) {
				// collision detected with a wall
        return true; 
      }
    } else {
			// hit the edge of the map
      return true; 
    }
  }
	// no collision detected
  return false;
}

/*
Helper Methods
*/

// move enemy function which will move the enemy
function moveEnemy(enemy) {
  // random x and y
  let dx = random(-2, 2); 
  let dy = random(-2, 2);
	// position changes
  enemy.position.x += dx;
  enemy.position.y += dy;
}

// get a random path wich will find a random spot on the path in the maze
function getRandomPathPosition() {
  let pathPositions = [];
	// go through all rows and columns
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
			// if there is a path
      if (maze[y][x] === 0) {
				// push the x and y
        pathPositions.push({ x: x, y: y });
      }
    }
  }
	// return a random spot
  return random(pathPositions);
}

// escape method which will be the end condition
function escape() {
	// remove player
  player.remove();
	
	//reset the matrix
	resetMatrix();
	
	// display ending text
  textSize(48);
  fill(255, 255, 0);
	textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('You Escaped!', width / 2, height / 2);
	
	// stop the sounds
	backgroundSound.stop();
	footsteps.stop();
	heartbeat.stop();
  noLoop();
}

// applying visual effects function
function applyVisualEffects() {
	// filter effect 
  filter(POSTERIZE, 3);
	// blend 
  blendMode(ADD); 
	// random color fill for glitch effect
  fill(random(255), random(255), random(255)); 
	// random rectangles for glitch effect
  rect(random(width), random(height), random(50, 100), random(50, 100)); 
}

// reset visuals function that will reset the effects
function resetVisualEffects() {
  // Reset to normal visual effects
  blendMode(BLEND);
}