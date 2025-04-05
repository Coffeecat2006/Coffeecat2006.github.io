// 全域變數定義
let boardRows = 10;
let boardCols = 10;
let totalMines = 10;
let minesLeft = totalMines;
let board = [];
let gameStarted = false;
let gameOver = false;
let gamePaused = false;
let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let currentDifficulty = "初級";
let hintsLeft = 3;
let soundEnabled = true;
let tutorialPage = 1;
    
// 建立棋盤資料結構，每個 cell 物件包含狀態資訊
function createEmptyBoard() {
  board = [];
  for (let r = 0; r < boardRows; r++) {
    let row = [];
    for (let c = 0; c < boardCols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        adjacentMines: 0,
        revealed: false,
        flagged: false,
        questioned: false
      });
    }
    board.push(row);
  }
}

// 生成棋盤 DOM 並綁定事件
function createBoardDOM() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${boardCols}, 35px)`;
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      const cellElem = document.createElement("div");
      cellElem.className = "cell";
      cellElem.dataset.row = r;
      cellElem.dataset.col = c;
      // 左鍵點擊
      cellElem.addEventListener("click", cellClick);
      // 右鍵標記
      cellElem.addEventListener("contextmenu", cellRightClick);
      gameBoard.appendChild(cellElem);
    }
  }
}

// 在第一次點擊時放置地雷，排除第一點及其鄰近格
function placeMines(firstRow, firstCol) {
  let positions = [];
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      // 排除第一點及其周圍八格
      if (Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1) continue;
      positions.push({ r, c });
    }
  }
  // 隨機洗牌後取前 totalMines 個位置
  positions.sort(() => Math.random() - 0.5);
  for (let i = 0; i < totalMines && i < positions.length; i++) {
    let pos = positions[i];
    board[pos.r][pos.c].isMine = true;
  }
  // 計算每個非地雷格子的鄰近地雷數量
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      if (!board[r][c].isMine) {
        board[r][c].adjacentMines = countAdjacentMines(r, c);
      }
    }
  }
}

// 計算某格周圍的地雷數
function countAdjacentMines(row, col) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      let r = row + dr, c = col + dc;
      if (r >= 0 && r < boardRows && c >= 0 && c < boardCols) {
        if (board[r][c].isMine) count++;
      }
    }
  }
  return count;
}

// 處理左鍵點擊
function cellClick(e) {
  if (gameOver || gamePaused) return;
  const cellElem = e.currentTarget;
  const r = parseInt(cellElem.dataset.row);
  const c = parseInt(cellElem.dataset.col);
  const cell = board[r][c];
  
  // 若尚未開始遊戲，第一次點擊後放置地雷並啟動計時器
  if (!gameStarted) {
    gameStarted = true;
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);
    placeMines(r, c);
  }
  
  // 若已標記或已揭露則不處理
  if (cell.revealed || cell.flagged) return;
  
  revealCell(r, c);
  checkWin();
}

// 處理右鍵標記（旗幟 / 問號）事件
function cellRightClick(e) {
  e.preventDefault();
  if (gameOver || gamePaused) return;
  const cellElem = e.currentTarget;
  const r = parseInt(cellElem.dataset.row);
  const c = parseInt(cellElem.dataset.col);
  const cell = board[r][c];
  if (cell.revealed) return;
  
  // 狀態循環：無標記 → 旗幟 → 問號 → 回復無標記
  if (!cell.flagged && !cell.questioned) {
    cell.flagged = true;
    cellElem.classList.add("flagged");
    cellElem.innerText = "🚩";
  } else if (cell.flagged) {
    cell.flagged = false;
    cell.questioned = true;
    cellElem.classList.remove("flagged");
    cellElem.classList.add("question");
    cellElem.innerText = "?";
  } else if (cell.questioned) {
    cell.questioned = false;
    cellElem.classList.remove("question");
    cellElem.innerText = "";
  }
  updateMinesCount();
}

// 更新剩餘地雷數（依據旗幟數計算）
function updateMinesCount() {
  let flaggedCount = 0;
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      if (board[r][c].flagged) flaggedCount++;
    }
  }
  minesLeft = totalMines - flaggedCount;
  document.getElementById("mines-count").innerText = minesLeft;
}

// 揭露格子，若為空白則遞迴揭露鄰近格
function revealCell(row, col) {
  const cell = board[row][col];
  const gameBoard = document.getElementById("game-board");
  const index = row * boardCols + col;
  const cellElem = gameBoard.children[index];
  
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  cellElem.classList.add("revealed");
  
  // 若點到地雷，遊戲結束
  if (cell.isMine) {
    cellElem.classList.add("mine");
    cellElem.innerText = "💣";
    gameOverProcedure();
    return;
  }
  
  // 顯示數字或留空
  if (cell.adjacentMines > 0) {
    cellElem.innerText = cell.adjacentMines;
    cellElem.classList.add("color-" + cell.adjacentMines);
  } else {
    cellElem.innerText = "";
    // 若為空白，則自動揭露鄰近格
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        let r = row + dr, c = col + dc;
        if (r >= 0 && r < boardRows && c >= 0 && c < boardCols) {
          revealCell(r, c);
        }
      }
    }
  }
}

// 遊戲結束處理：揭露所有地雷、停止計時器並顯示結果彈窗
function gameOverProcedure() {
  gameOver = true;
  clearInterval(timerInterval);
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      const cell = board[r][c];
      const index = r * boardCols + c;
      const cellElem = document.getElementById("game-board").children[index];
      if (cell.isMine && !cell.revealed) {
        cellElem.classList.add("mine");
        cellElem.innerText = "💣";
      }
    }
  }
  showResultModal("遊戲結束", "您輸了！");
}

// 檢查是否勝利：所有非地雷格子均已揭露
function checkWin() {
  let win = true;
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      const cell = board[r][c];
      if (!cell.isMine && !cell.revealed) {
        win = false;
        break;
      }
    }
    if (!win) break;
  }
  if (win) {
    gameOver = true;
    clearInterval(timerInterval);
    showResultModal("恭喜你獲勝！", "用時 " + elapsedTime + " 秒");
  }
}

// 顯示結果彈窗
function showResultModal(title, stats) {
  const modal = document.getElementById("result-modal");
  document.getElementById("result-message").innerText = title;
  document.getElementById("result-stats").innerText = stats;
  modal.style.display = "flex";
}

// 計時器更新
function updateTimer() {
  if (gameStarted && !gamePaused && !gameOver) {
    elapsedTime = Math.floor((new Date().getTime() - startTime) / 1000);
    document.getElementById("timer").innerText = elapsedTime;
  }
}

// 重設遊戲，初始化棋盤與狀態
function resetGame() {
  clearInterval(timerInterval);
  gameStarted = false;
  gameOver = false;
  gamePaused = false;
  elapsedTime = 0;
  hintsLeft = 3;
  document.getElementById("timer").innerText = 0;
  document.getElementById("hints-left").innerText = hintsLeft;
  minesLeft = totalMines;
  document.getElementById("mines-count").innerText = minesLeft;
  createEmptyBoard();
  createBoardDOM();
}

// 自定義大小設定
function setCustomSize() {
  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);
  if (isNaN(rows) || isNaN(cols) || rows < 5 || cols < 5) {
    alert("請輸入有效的行列數，最小值為 5");
    return;
  }
  boardRows = rows;
  boardCols = cols;
  totalMines = Math.floor((rows * cols) * 0.1); // 地雷數量為格子總數的 10%
  currentDifficulty = "自定義";
  document.getElementById("difficulty-level").innerText = currentDifficulty;
  resetGame();
}

// 根據選擇的難度設定棋盤大小
function setSize(size) {
  if (size === "small") {
    boardRows = 9;
    boardCols = 9;
    totalMines = 10;
    currentDifficulty = "初級";
  } else if (size === "medium") {
    boardRows = 16;
    boardCols = 16;
    totalMines = 40;
    currentDifficulty = "中級";
  } else if (size === "large") {
    boardRows = 16;
    boardCols = 24;
    totalMines = 99;
    currentDifficulty = "高級";
  }
  document.getElementById("difficulty-level").innerText = currentDifficulty;
  resetGame();
}

// 切換夜間模式
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// 切換音效
function toggleSound() {
  soundEnabled = !soundEnabled;
}

// 暫停/繼續遊戲
function togglePause() {
  gamePaused = !gamePaused;
  const overlay = document.getElementById("pause-overlay");
  if (gamePaused) {
    overlay.style.display = "flex";
    clearInterval(timerInterval);
  } else {
    overlay.style.display = "none";
    startTime = new Date().getTime() - elapsedTime * 1000;
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// 提示功能：找一個安全且未揭露的格子，短暫高亮提示
function giveHint() {
  if (hintsLeft <= 0 || gameOver || gamePaused) {
    alert("已無提示次數！");
    return;
  }
  let safeCells = [];
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      const cell = board[r][c];
      if (!cell.revealed && !cell.isMine && !cell.flagged) {
        safeCells.push({ r, c });
      }
    }
  }
  if (safeCells.length === 0) return;
  const randomIndex = Math.floor(Math.random() * safeCells.length);
  const hintCell = safeCells[randomIndex];
  const index = hintCell.r * boardCols + hintCell.c;
  const cellElem = document.getElementById("game-board").children[index];
  cellElem.classList.add("hinted");
  hintsLeft--;
  document.getElementById("hints-left").innerText = hintsLeft;
  setTimeout(() => {
    cellElem.classList.remove("hinted");
  }, 1000);
}

// 關閉彈窗
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// 教學彈窗控制
function showTutorial() {
  document.getElementById("tutorial-modal").style.display = "flex";
}

function nextTutorialPage() {
  if (tutorialPage < 3) {
    document.getElementById("tutorial-" + tutorialPage).style.display = "none";
    tutorialPage++;
    document.getElementById("tutorial-" + tutorialPage).style.display = "block";
  }
  updateTutorialButtons();
}

function prevTutorialPage() {
  if (tutorialPage > 1) {
    document.getElementById("tutorial-" + tutorialPage).style.display = "none";
    tutorialPage--;
    document.getElementById("tutorial-" + tutorialPage).style.display = "block";
  }
  updateTutorialButtons();
}

function updateTutorialButtons() {
  document.getElementById("tutorial-prev").disabled = (tutorialPage === 1);
  document.getElementById("tutorial-next").disabled = (tutorialPage === 3);
  document.getElementById("tutorial-page").innerText = tutorialPage + "/3";
}

// 清除排行榜（簡單示範）
function clearLeaderboard() {
  document.getElementById("leaderboard-body").innerHTML = "";
  alert("排行榜已清除！");
}

function showLeaderboard() {
    document.getElementById('leaderboard-modal').style.display = 'flex';
}

// 初始化遊戲
window.onload = function() {
  resetGame();
}