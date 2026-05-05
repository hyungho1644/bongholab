// Kodari Pomodoro Timer Logic
let WORK_TIME = 10 * 60; // 기본 10분 시작 (초 단위)
let BREAK_TIME = 5 * 60; // 기본 5분 시작 (초 단위)
const MAX_WORK_TIME = 120 * 60; // 최대 120분
const MAX_BREAK_TIME = 30 * 60; // 최대 30분

let currentMode = 'work'; // 'work' 또는 'break'
let timeLeft = WORK_TIME;
let isRunning = false;
let timerInterval = null;
let isAutoRepeat = false; // 자동 반복 여부

// DOM 엘리먼트 가져오기
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const repeatBtn = document.getElementById('repeat-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const themeSelector = document.getElementById('theme-selector');

// 모달 및 설정 관련 엘리먼트
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const workTimeInput = document.getElementById('work-time-input');
const breakTimeInput = document.getElementById('break-time-input');

// 효과음 오디오 엘리먼트
const startSound = document.getElementById('start-sound');
const endSound = document.getElementById('end-sound');

// 화면 업데이트 함수
function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    minutesDisplay.textContent = mins.toString().padStart(2, '0');
    secondsDisplay.textContent = secs.toString().padStart(2, '0');
    
    // 브라우저 탭 타이틀에도 남은 시간 표시
    document.title = `${minutesDisplay.textContent}:${secondsDisplay.textContent} - Focus Timer`;
}

// 타이머 시작/일시정지 토글
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// 타이머 시작
function startTimer() {
    isRunning = true;
    startBtn.textContent = '일시정지';
    
    // 처음 시작할 때 맑은 시작 알림음 재생
    if (timeLeft === (currentMode === 'work' ? WORK_TIME : BREAK_TIME)) {
        startSound.currentTime = 0;
        startSound.play().catch(e => console.log('효과음 재생 실패:', e));
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            handleTimerComplete();
        }
    }, 1000);
}

// 타이머 일시정지
function pauseTimer() {
    isRunning = false;
    startBtn.textContent = '시작';
    clearInterval(timerInterval);
}

// 타이머 초기화
function resetTimer() {
    pauseTimer();
    
    if (currentMode === 'work') {
        timeLeft = WORK_TIME;
    } else {
        timeLeft = BREAK_TIME;
    }
    
    updateDisplay();
}

// 타이머 완료 시 처리
function handleTimerComplete() {
    pauseTimer();
    
    // 완료 알림음 재생
    endSound.currentTime = 0;
    endSound.play().catch(e => console.log('효과음 재생 실패:', e));
    
    // 자동 반복이 꺼져있을 때만 브라우저 알림창 표시 (켜져있으면 흐름이 끊기지 않게 바로 넘어감)
    if (!isAutoRepeat) {
        if(currentMode === 'work') {
            alert('집중 시간이 끝났습니다! 잠시 휴식을 취하세요.');
        } else {
            alert('휴식 시간이 끝났습니다! 다시 시작하시겠습니까?');
        }
    }
    
    // 모드 전환
    if(currentMode === 'work') {
        switchMode('break');
    } else {
        switchMode('work');
    }

    // 자동 반복 켜져있으면 바로 다음 타이머 시작
    if (isAutoRepeat) {
        startTimer();
    }
}

// 모드(집중/휴식) 변경
function switchMode(mode) {
    currentMode = mode;
    
    // 버튼 스타일 업데이트
    modeBtns.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    resetTimer();
}

// 테마 변경 이벤트
themeSelector.addEventListener('change', (e) => {
    document.body.dataset.theme = e.target.value;
});

// 이벤트 리스너 등록
startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
repeatBtn.addEventListener('click', () => {
    isAutoRepeat = !isAutoRepeat;
    if (isAutoRepeat) {
        repeatBtn.textContent = '자동반복: ON';
        repeatBtn.classList.add('active');
    } else {
        repeatBtn.textContent = '자동반복: OFF';
        repeatBtn.classList.remove('active');
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const clickedMode = e.target.dataset.mode;
        
        if (clickedMode === currentMode) {
            // 현재 모드와 같은 버튼을 클릭하면 5분 추가
            if (clickedMode === 'work') {
                if (WORK_TIME + (5 * 60) > MAX_WORK_TIME) {
                    alert('집중 시간은 최대 120분까지만 설정 가능합니다!');
                    return;
                }
                WORK_TIME += 5 * 60;
                timeLeft += 5 * 60;
            } else {
                if (BREAK_TIME + (5 * 60) > MAX_BREAK_TIME) {
                    alert('휴식 시간은 최대 30분까지만 설정 가능합니다!');
                    return;
                }
                BREAK_TIME += 5 * 60;
                timeLeft += 5 * 60;
            }
            updateDisplay();
        } else {
            // 다른 모드로 변경
            if(isRunning) {
                if(!confirm('타이머가 진행 중입니다. 정말 모드를 변경하시겠습니까?')) return;
            }
            switchMode(clickedMode);
        }
    });
});

// --- 설정 모달 로직 ---
settingsBtn.addEventListener('click', () => {
    // 현재 설정된 시간을 인풋에 채우기
    workTimeInput.value = Math.floor(WORK_TIME / 60);
    breakTimeInput.value = Math.floor(BREAK_TIME / 60);
    settingsModal.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

// 모달 배경 클릭 시 닫기
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

saveSettingsBtn.addEventListener('click', () => {
    let newWorkTime = parseInt(workTimeInput.value);
    let newBreakTime = parseInt(breakTimeInput.value);

    // 입력값 유효성 검사
    if (isNaN(newWorkTime) || newWorkTime < 1) newWorkTime = 1;
    if (newWorkTime > 120) newWorkTime = 120; // MAX 120분
    
    if (isNaN(newBreakTime) || newBreakTime < 1) newBreakTime = 1;
    if (newBreakTime > 30) newBreakTime = 30; // MAX 30분

    // 설정된 시간으로 베이스 타이머 업데이트
    WORK_TIME = newWorkTime * 60;
    BREAK_TIME = newBreakTime * 60;

    // 모달 닫기
    settingsModal.classList.remove('active');
    
    // 즉시 적용을 위해 타이머 리셋
    resetTimer();
});

// 초기화 실행
updateDisplay();
