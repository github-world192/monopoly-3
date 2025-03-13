let rows = 20;
let cols = 20;
let gridSize, cellSize, marginX, marginY;
let players = [];
let currentPlayer = 0;
let diceRoll = 1;
let rolling = false;
let rollStartTime = 0;
let rollDuration = 1000; // 骰子動畫持續 1 秒
let path = [];

// 玩家移動動畫
let moving = false;
let moveSteps = 0;
let moveIndex = 0;
let stepDuration = 200; // 每格移動的時間，單位為毫秒

// 視角平滑移動變數
let cameraX = 0;
let cameraY = 0;
let targetX = 0;
let targetY = 0;

let showPosition = false; // 控制是否顯示位置

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  stroke(0);
  
  gridSize = min(width, height) * 0.8;
cellSize = (gridSize / max(rows, cols)) * 3.5;
  
  // 偏移量，將格子網格往右下方偏移
  marginX = (width - gridSize) / 2 + 50; // 右移50
  marginY = (height - gridSize) / 2 + 50; // 下移50
  
  calculatePath();
  
  for (let i = 0; i < 4; i++) {
    players.push({ 
      index: 0, 
      color: color(random(100, 255), random(100, 255), random(100, 255)) 
    });
  }

  updateCameraPosition();
}

function draw() {
  background(255);
  
  // 平滑移動攝影機
  cameraX = lerp(cameraX, targetX, 0.1);
  cameraY = lerp(cameraY, targetY, 0.1);
  translate(width / 2 - cameraX, height / 2 - cameraY);

  // 繪製外圍格子
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = marginX + i * cellSize;
      let y = marginY + j * cellSize;

      if (i == 0 || i == rows - 1 || j == 0 || j == cols - 1) {
        rect(x, y, cellSize, cellSize);
      }
      
      // 高亮顯示當前玩家所在格子
      if (showPosition) {
        let currentPlayerPos = path[players[currentPlayer].index];
        let gridX = Math.floor((currentPlayerPos.x - marginX) / cellSize);
        let gridY = Math.floor((currentPlayerPos.y - marginY) / cellSize);
        
        // 如果格子是當前玩家所在位置，則高亮顯示
        if (i === gridX && j === gridY) {
          fill(255, 0, 0, 100); // 紅色半透明
          rect(x, y, cellSize, cellSize);
        }
      }
    }
  }
  
  // 繪製玩家
  for (let i = 0; i < players.length; i++) {
    let { index, color } = players[i];
    let pos = path[index];

    fill(color);
    ellipse(pos.x, pos.y, cellSize * 0.6); // 玩家圓形棋子，位於格子中心
  }

  // 處理移動動畫
  if (moving) {
    let player = players[currentPlayer];
    
    // 逐格移動
    if (millis() - player.moveStartTime >= stepDuration) {
      moveIndex = (moveIndex + 1) % path.length;
      player.index = moveIndex;
      player.moveStartTime = millis(); // 記錄這步移動開始的時間

      moveSteps--;
      if (moveSteps <= 0) {
        moving = false;
        currentPlayer = (currentPlayer + 1) % players.length;
        updateCameraPosition();
      }
    }
  }

  // 恢復畫面原本的座標系統
  resetMatrix();

  // 顯示當前玩家資訊
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`現在輪到玩家 ${currentPlayer + 1}`, 20, 20);
  
  // 顯示正在移動的玩家小球
  let currentPlayerColor = players[currentPlayer].color;
  fill(currentPlayerColor);
  noStroke();
  ellipse(width / 2, 50, 30, 30); // 正上方顯示玩家的顏色小球
  
  // 進行骰子動畫
  if (rolling) {
    let elapsed = millis() - rollStartTime;
    if (elapsed < rollDuration) {
      diceRoll = floor(random(1, 7)); // 在動畫期間隨機變化骰子
    } else {
      rolling = false; // 動畫結束
    }
  }
  
  // 顯示骰子點數
  drawDice(width / 2, height - 150, diceRoll);
  
  textSize(20);
  textAlign(CENTER, CENTER);
  text("按 SPACE 擲骰子", width / 2, height - 50);
}

// 計算外圍移動路徑（順時針）
function calculatePath() {
  // 使用 marginX 和 marginY 偏移，並將每個格子的位置移動到新位置
  for (let i = 0; i < cols; i++) path.push({ x: marginX + i * cellSize, y: marginY }); // 上方
  for (let i = 1; i < rows; i++) path.push({ x: marginX + (cols - 1) * cellSize, y: marginY + i * cellSize }); // 右側
  for (let i = cols - 2; i >= 0; i--) path.push({ x: marginX + i * cellSize, y: marginY + (rows - 1) * cellSize }); // 下方
  for (let i = rows - 2; i > 0; i--) path.push({ x: marginX, y: marginY + i * cellSize }); // 左側
}

// 更新攝影機目標位置
function updateCameraPosition() {
  let pos = path[players[currentPlayer].index];
  targetX = pos.x;
  targetY = pos.y;
}

// 畫骰子
function drawDice(x, y, number) {
  fill(255);
  stroke(0);
  strokeWeight(4);
  rectMode(CENTER);
  rect(x, y, 80, 80, 10); // 骰子方塊
  
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text(number, x, y); // 顯示骰子點數
}

// 擲骰子
function keyPressed() {
  if (key === ' ' && !rolling && !moving) { // 只有當前沒有動畫時才能擲骰
    rolling = true;
    rollStartTime = millis(); // 記錄動畫開始時間

    setTimeout(() => {
      let finalRoll = floor(random(1, 7)); // 最終骰子點數
      diceRoll = finalRoll;
      moveSteps = finalRoll;
      moveIndex = players[currentPlayer].index;
      moving = true; // 啟動移動動畫
      players[currentPlayer].moveStartTime = millis(); // 記錄移動的開始時間
    }, rollDuration);
  }

  // 當按下 Q 鍵時顯示/隱藏當前玩家位置
  if (key === 'q' || key === 'Q') {
    showPosition = !showPosition;
  }
}
