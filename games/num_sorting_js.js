let gameStarted = false;
    let gameMode = 'asc';
    let currentLevel = 1;
    let score = 0;
    let hearts = 3;
    let maxHearts = 3;
    let gameTime = 0;
    let levelTimer = null;
    let gameTimer = null;
    let timerDuration = 10;
    let remainingTime = timerDuration;
    let numbers = [];
    let correctOrder = [];
    let currentIndex = 0;
    
    const startScreen = document.getElementById('startScreen');
    const endScreen = document.getElementById('endScreen');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const levelDisplay = document.getElementById('level');
    const scoreDisplay = document.getElementById('score');
    const gameTimeDisplay = document.getElementById('gameTime');
    const timerBar = document.getElementById('timerBar');
    const heartsContainer = document.getElementById('heartsContainer');
    const gameButtons = document.getElementById('gameButtons');
    const orderInstruction = document.getElementById('orderInstruction');
    const totalTimeDisplay = document.getElementById('totalTime');
    const finalScoreDisplay = document.getElementById('finalScore');
    const finalLevelDisplay = document.getElementById('finalLevel');
    const startLevelInput = document.getElementById('startLevel');
    const heartCountInput = document.getElementById('heartCount');
    const timeDurationInput = document.getElementById('timeDuration');
    const debugInfo = document.getElementById('debugInfo');
    
    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        gameMode = button.dataset.mode;
      });
    });
    
    startButton.addEventListener('click', () => {
      startScreen.style.display = 'none';
      startGame();
    });
    
    restartButton.addEventListener('click', () => {
      endScreen.style.display = 'none';
      startScreen.style.display = 'flex';
      resetGame();
    });
    
    function startGame() {
      currentLevel = parseInt(startLevelInput.value) || 1;
      maxHearts = parseInt(heartCountInput.value) || 3;
      hearts = maxHearts;
      timerDuration = parseInt(timeDurationInput.value) || 10;
      
      gameStarted = true;
      score = 0;
      gameTime = 0;
      
      generateHearts();
      
      updateDisplay();
      startGameTimer();
      startLevel();
    }
    
    function generateHearts() {
      heartsContainer.innerHTML = '';
      for (let i = 0; i < maxHearts; i++) {
        const heartDiv = document.createElement('div');
        heartDiv.className = 'heart';
        heartDiv.innerHTML = '❤️';
        heartsContainer.appendChild(heartDiv);
      }
    }
    
    function resetGame() {
      gameStarted = false;
      clearInterval(gameTimer);
      clearInterval(levelTimer);
      
      gameButtons.innerHTML = '';
    }
    
    function startGameTimer() {
      gameTimer = setInterval(() => {
        gameTime++;
        updateGameTimeDisplay();
      }, 1000);
    }
    
    function updateGameTimeDisplay() {
      const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
      const seconds = (gameTime % 60).toString().padStart(2, '0');
      gameTimeDisplay.textContent = `${minutes}:${seconds}`;
    }
    
    function startLevel() {
      if (levelTimer) {
        clearInterval(levelTimer);
      }
      
      levelDisplay.textContent = currentLevel;
      
      generateNumbers();
      
      remainingTime = timerDuration;
      updateTimerBar();
      
      levelTimer = setInterval(() => {
        remainingTime -= 0.1;
        updateTimerBar();
        
        if (remainingTime <= 0) {
          loseHeart("時間到！");
        }
      }, 100);
      
      updateOrderInstruction();
      
      updateDebugInfo();
    }
    
    function updateDebugInfo() {
      // 僅在調試模式下顯示
      // debugInfo.style.display = 'block';
      // let debug = "正確順序: ";
      // correctOrder.forEach((num, i) => {
      //   debug += `${i + 1}. ${typeof num === 'object' ? num.display : num} (${typeof num === 'object' ? num.value : num}) `;
      // });
      // debugInfo.textContent = debug;
    }
    
    function updateTimerBar() {
      const percentage = (remainingTime / timerDuration) * 100;
      timerBar.style.width = `${percentage}%`;
      
      if (percentage < 30) {
        timerBar.style.backgroundColor = 'var(--danger)';
      } else {
        timerBar.style.backgroundColor = 'var(--accent)';
      }
    }
    
    function updateOrderInstruction() {
      const order = getCurrentLevelOrder();
      orderInstruction.textContent = `請按照${order === 'asc' ? '由小到大' : '由大到小'}的順序點擊數字`;
    }
    
    function getCurrentLevelOrder() {
      if (gameMode === 'random') {
        return Math.random() < 0.5 ? 'asc' : 'desc';
      }
      return gameMode;
    }
    
    function generateNumbers() {
      gameButtons.innerHTML = '';
      
      let buttonCount = 3 + Math.floor((currentLevel - 1) / 5);
      buttonCount = Math.min(buttonCount, 6);
      
      numbers = [];
      
      if (currentLevel <= 5) {
        // 1-5關：整數
        for (let i = 0; i < buttonCount; i++) {
          numbers.push(Math.floor(Math.random() * 100));
        }
      } else if (currentLevel <= 10) {
        // 6-10關：整數和小數
        for (let i = 0; i < buttonCount; i++) {
          if (Math.random() < 0.6) {
            numbers.push(Math.floor(Math.random() * 100));
          } else {
            numbers.push(parseFloat((Math.random() * 100).toFixed(1)));
          }
        }
      } else if (currentLevel <= 15) {
        // 11-15關：整數、小數和分數
        for (let i = 0; i < buttonCount; i++) {
          const type = Math.random();
          if (type < 0.4) {
            numbers.push(Math.floor(Math.random() * 100));
          } else if (type < 0.7) {
            numbers.push(parseFloat((Math.random() * 100).toFixed(2)));
          } else {
            const denominator = Math.floor(Math.random() * 9) + 2;
            const numerator = Math.floor(Math.random() * denominator * 2);
            numbers.push({type: 'fraction', value: numerator / denominator, display: `${numerator}/${denominator}`});
          }
        }
      } else if (currentLevel <= 20) {
        // 16-20關：加入根號
        for (let i = 0; i < buttonCount; i++) {
          const type = Math.random();
          if (type < 0.3) {
            numbers.push(Math.floor(Math.random() * 100));
          } else if (type < 0.5) {
            numbers.push(parseFloat((Math.random() * 100).toFixed(2)));
          } else if (type < 0.7) {
            const denominator = Math.floor(Math.random() * 9) + 2;
            const numerator = Math.floor(Math.random() * denominator * 2);
            numbers.push({type: 'fraction', value: numerator / denominator, display: `${numerator}/${denominator}`});
          } else {
            const num = Math.floor(Math.random() * 50) + 1;
            numbers.push({type: 'sqrt', value: Math.sqrt(num), display: `√${num}`});
          }
        }
      } else {
        // 21關以上：加入三角函數、對數等
        for (let i = 0; i < buttonCount; i++) {
          const type = Math.random();
          if (type < 0.2) {
            numbers.push(Math.floor(Math.random() * 100));
          } else if (type < 0.35) {
            numbers.push(parseFloat((Math.random() * 100).toFixed(2)));
          } else if (type < 0.5) {
            const denominator = Math.floor(Math.random() * 9) + 2;
            const numerator = Math.floor(Math.random() * denominator * 2);
            numbers.push({type: 'fraction', value: numerator / denominator, display: `${numerator}/${denominator}`});
          } else if (type < 0.65) {
            const num = Math.floor(Math.random() * 50) + 1;
            numbers.push({type: 'sqrt', value: Math.sqrt(num), display: `√${num}`});
          } else if (type < 0.8) {
            const num = (Math.random() * Math.PI).toFixed(2);
            const value = Math.sin(num);
            numbers.push({type: 'trig', value: value, display: `sin(${num})`});
          } else {
            const num = Math.floor(Math.random() * 8) + 2;
            const value = Math.log(num);
            numbers.push({type: 'log', value: value, display: `log(${num})`});
          }
        }
      }
      
      const shuffledIndices = [];
      for (let i = 0; i < numbers.length; i++) {
        shuffledIndices.push(i);
      }
      shuffle(shuffledIndices);
      
      shuffledIndices.forEach((originalIndex, displayIndex) => {
        const button = document.createElement('button');
        button.className = 'number-btn';
        button.dataset.index = originalIndex;
        
        const num = numbers[originalIndex];
        if (typeof num === 'object') {
          button.textContent = num.display;
        } else {
          button.textContent = num;
        }
        
        button.addEventListener('click', () => handleButtonClick(originalIndex));
        gameButtons.appendChild(button);
      });
      
      // 決定正確順序
      const order = getCurrentLevelOrder();
      
      // 創建一個帶有原始索引的數組以跟踪原始位置
      const indexedNumbers = numbers.map((value, index) => ({ value, index }));
      
      // 按值排序
      indexedNumbers.sort((a, b) => {
        const valueA = typeof a.value === 'object' ? a.value.value : a.value;
        const valueB = typeof b.value === 'object' ? b.value.value : b.value;
        return order === 'asc' ? valueA - valueB : valueB - valueA;
      });
      
      // 提取排序後的原始索引順序
      correctOrder = indexedNumbers.map(item => item.index);
      
      currentIndex = 0;
    }
    
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    
    function handleButtonClick(index) {
      const buttons = document.querySelectorAll('.number-btn');
      
      let buttonElement = null;
      buttons.forEach(button => {
        if (parseInt(button.dataset.index) === index) {
          buttonElement = button;
        }
      });
      
      if (!buttonElement) return;
      
      if (index === correctOrder[currentIndex]) {
        // 正確
        buttonElement.classList.add('correct');
        buttonElement.classList.add('pulse');
        currentIndex++;
        
        if (currentIndex >= correctOrder.length) {
          // 完成本關
          const timeBonus = Math.floor(remainingTime * 100);
          score += timeBonus;
          scoreDisplay.textContent = score;
          
          setTimeout(() => {
            nextLevel();
          }, 500);
        }
      } else {
        // 錯誤
        buttonElement.classList.add('incorrect');
        loseHeart("選擇錯誤！");
      }
    }
    
    function loseHeart(reason) {
      hearts--;
      
      // 更新愛心顯示
      if (hearts >= 0) {
        const heartElements = document.querySelectorAll('.heart');
        heartElements[maxHearts - hearts - 1].innerHTML = '💔';
      }
      
      if (hearts <= 0) {
        endGame();
      } else {
        // 跳到下一關
        nextLevel();
      }
    }
    
    function nextLevel() {
      currentLevel++;
      startLevel();
    }
    
    function endGame() {
      clearInterval(levelTimer);
      clearInterval(gameTimer);
      gameStarted = false;
      
      endScreen.style.display = 'flex';
      
      const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
      const seconds = (gameTime % 60).toString().padStart(2, '0');
      totalTimeDisplay.textContent = `${minutes}:${seconds}`;
      finalScoreDisplay.textContent = score;
      finalLevelDisplay.textContent = currentLevel;
    }
    
    function updateDisplay() {
      scoreDisplay.textContent = score;
      levelDisplay.textContent = currentLevel;
    }