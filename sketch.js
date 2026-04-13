let targetX, targetY;
let gameState = "menu"; // menu, settings, playing, won, lost
let timer = 30;
let startTime;
let confetti = [];
let targetSize = 30; // 判定範圍大小
let shakeStartTime = 0; // 記錄震動開始的時間
const shakeDuration = 500; // 震動持續時間 (毫秒)
const cols = 30;    // 橫向格子數
const rows = 15;    // 縱向格子數

function setup() {
  createCanvas(windowWidth, windowHeight); // 放大到全螢幕
  
  initTarget(); // 初始化目標位置
  
  startTime = millis();
  // cursor(); // 預設即會顯示游標，故移除 noCursor()

  // 初始化彩帶粒子
  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      speed: random(2, 5),
      c: color(random(255), random(255), random(255)),
      size: random(5, 10)
    });
  }
}

function initTarget() {
  let cellW = width / cols;
  let cellH = height / rows;
  // 將目標點隨機放置在某個格子的中心
  targetX = floor((floor(random(cols)) + 0.5) * cellW);
  targetY = floor((floor(random(rows)) + 0.5) * cellH);
}

function draw() {
  // 基礎背景
  background(10, 15, 20);

  // 失敗時的紅色閃光效果背景 (僅在震動期間持續)
  if (gameState === "lost" && millis() - shakeStartTime < shakeDuration && frameCount % 10 < 5) {
    background(120, 0, 0);
  }

  // 繪製 15x30 的網格背景
  let cellWidth = width / cols;
  let cellHeight = height / rows;
  stroke(0, 255, 150, 60); // 科技感的半透明螢光綠
  strokeWeight(1);
  for (let i = 0; i <= cols; i++) {
    line(i * cellWidth, 0, i * cellWidth, height);
  }
  for (let i = 0; i <= rows; i++) {
    line(0, i * cellHeight, width, i * cellHeight);
  }

  // 確保其他繪圖不會被網格線影響
  noStroke(); 

  if (gameState === "menu") {
    // 畫面透明度 50 的遮罩
    fill(10, 15, 20, 150);
    rectMode(CORNER);
    rect(0, 0, width, height);

    // 大字標題
    textAlign(CENTER, CENTER);
    fill(0, 255, 150);
    textSize(60);
    text("幸運色塊獵人🔎", width / 2, height / 2 - 100);
    
    // 遊戲提示
    fill(255);
    textSize(24);
    text("在時間內找出隱藏色塊", width / 2, height / 2 - 30);

    // 遊戲開始按鍵
    drawButton("遊戲開始", width / 2, height / 2 + 50, 200, 50);
    // 設定按鍵
    drawButton("設定模式", width / 2, height / 2 + 120, 200, 50);

  } else if (gameState === "settings") {
    // 畫面透明度 50 的遮罩
    fill(10, 15, 20, 200);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    fill(0, 255, 150);
    textSize(40);
    text("選擇難度模式", width / 2, height / 2 - 120);

    drawButton("簡單模式: 60秒", width / 2, height / 2 - 30, 300, 50);
    drawButton("中等模式: 30秒", width / 2, height / 2 + 40, 300, 50);
    drawButton("困難模式: 10秒", width / 2, height / 2 + 110, 300, 50);
    
    textSize(18);
    fill(200);
    text("(點選後將直接開始遊戲)", width / 2, height / 2 + 180);

  } else if (gameState === "playing") {
    // 計算時間
    let elapsed = floor((millis() - startTime) / 1000);
    let timeLeft = timer - elapsed;

    if (timeLeft <= 0) {
      gameState = "lost";
      shakeStartTime = millis(); // 啟動失敗震動計時
    }

    // 顯示計時器
    fill(0);
    noStroke();
    textSize(20);
    fill(0, 255, 150);
    textAlign(LEFT, TOP);
    text("剩餘時間: " + timeLeft + "s", 10, 10);

    // --- 網格中心吸附效果 ---
    // 讓雷達鎖定在格子的中心點
    let snapX = (floor(mouseX / cellWidth) + 0.5) * cellWidth;
    let snapY = (floor(mouseY / cellHeight) + 0.5) * cellHeight;

    // 計算吸附點與目標點的距離
    let d = dist(snapX, snapY, targetX, targetY);
    
    // --- 顏色與大小邏輯 ---
    // 圓形不能超出格子：最大直徑即為格子的寬或高中的最小值
    let maxD = min(cellWidth, cellHeight);
    let diameter = map(d, 0, width, maxD, 5);
    diameter = constrain(diameter, 5, maxD); // 確保不超出格子邊界

    // 顏色插值：越近(d=0)越紅，越遠(d大)越藍
    let colorNear = color(255, 0, 0);   // 紅色
    let colorFar = color(0, 150, 255);  // 藍色
    let lerpAmt = constrain(map(d, 0, width / 2, 0, 1), 0, 1);
    let radarColor = lerpColor(colorNear, colorFar, lerpAmt);

    fill(radarColor); // 改為實心填充
    noStroke();       // 移除邊框線條
    ellipse(snapX, snapY, diameter);

  } else if (gameState === "won") {
    // 獲勝震動 (僅持續一下)
    if (millis() - shakeStartTime < shakeDuration) {
      translate(random(-5, 5), random(-5, 5));
    }

    // 繪製圓環擴散效果 (取代原本的方塊)
    noFill();
    strokeWeight(3);
    for (let i = 0; i < 3; i++) {
      let d = (frameCount * 3 + i * 60) % 200; // 圓環直徑隨時間增加
      let alpha = map(d, 0, 200, 255, 0);      // 越往外越透明
      stroke(255, 50, 50, alpha);
      ellipse(targetX, targetY, d);
    }

    // 繪製彩帶效果
    for (let p of confetti) {
      fill(p.c);
      ellipse(p.x, p.y, p.size);
      p.y += p.speed;
      if (p.y > height) p.y = -10;
    }

    // 文字顯示
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40);
    text("任務完成", width / 2, height / 2 - 20);
    textSize(20);
    text("恭喜找到幸運色塊", width / 2, height / 2 + 30);

    // 獲勝按鈕
    drawButton("重新挑戰", width / 2 - 110, height / 2 + 100, 200, 50);
    drawButton("回到主選單", width / 2 + 110, height / 2 + 100, 200, 50);

  } else if (gameState === "lost") {
    // 失敗震動 (僅持續一下，且幅度較大)
    if (millis() - shakeStartTime < shakeDuration) {
      translate(random(-10, 10), random(-10, 10));
    }

    // 繪製圓環擴散效果 (標示正確位置)
    noFill();
    strokeWeight(3);
    for (let i = 0; i < 3; i++) {
      let d = (frameCount * 3 + i * 60) % 200; 
      let alpha = map(d, 0, 200, 255, 0);      
      stroke(255, 50, 50, alpha);
      ellipse(targetX, targetY, d);
    }

    textAlign(CENTER, CENTER);
    fill(255, 50, 50);
    textSize(60);
    text("任務失敗!", width / 2, height / 2 - 80);
    
    fill(255);
    textSize(24);
    text("幸運色塊正確座標: (" + targetX + ", " + targetY + ")", width / 2, height / 2);

    // 失敗按鈕
    drawButton("重新挑戰", width / 2 - 110, height / 2 + 100, 200, 50);
    drawButton("回到主選單", width / 2 + 110, height / 2 + 100, 200, 50);
  }
}

function drawButton(txt, x, y, w, h) {
  push();
  rectMode(CENTER);
  stroke(0, 255, 150);
  strokeWeight(2);
  if (mouseX > x - w/2 && mouseX < x + w/2 && mouseY > y - h/2 && mouseY < y + h/2) {
    fill(0, 255, 150, 100);
  } else {
    noFill();
  }
  rect(x, y, w, h, 10);
  noStroke();
  fill(255);
  textSize(22);
  text(txt, x, y);
  pop();
}

function mousePressed() {
  if (gameState === "menu") {
    // 點擊 遊戲開始
    if (overButton(width/2, height/2 + 50, 200, 50)) {
      startGame();
    }
    // 點擊 設定
    if (overButton(width/2, height/2 + 120, 200, 50)) {
      gameState = "settings";
    }
  } else if (gameState === "settings") {
    if (overButton(width/2, height/2 - 30, 300, 50)) { timer = 60; startGame(); }
    if (overButton(width/2, height/2 + 40, 300, 50)) { timer = 30; startGame(); }
    if (overButton(width/2, height/2 + 110, 300, 50)) { timer = 10; startGame(); }
  } else if (gameState === "playing") {
    let cellWidth = width / cols;
    let cellHeight = height / rows;
    let snapX = (floor(mouseX / cellWidth) + 0.5) * cellWidth;
    let snapY = (floor(mouseY / cellHeight) + 0.5) * cellHeight;
    
    // 判斷是以吸附後的點作為點擊中心
    let d = dist(snapX, snapY, targetX, targetY);
    // 如果雷達所在的格子就是目標所在的格子
    if (d < 5) {
      gameState = "won";
      shakeStartTime = millis(); // 啟動獲勝震動計時
    }
  } else if (gameState === "won" || gameState === "lost") {
    // 重新挑戰按鈕
    if (overButton(width / 2 - 110, height / 2 + 100, 200, 50)) {
      startGame();
    }
    // 回到主選單按鈕
    if (overButton(width / 2 + 110, height / 2 + 100, 200, 50)) {
      gameState = "menu";
    }
  }
}

function overButton(x, y, w, h) {
  return mouseX > x - w/2 && mouseX < x + w/2 && mouseY > y - h/2 && mouseY < y + h/2;
}

function startGame() {
  initTarget();
  startTime = millis();
  gameState = "playing";
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
