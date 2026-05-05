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
const adjustBtns = document.querySelectorAll('.adjust-btn');
const themeSelector = document.getElementById('theme-selector');
const soundSelector = document.getElementById('sound-selector');

// 오디오 엘리먼트 맵핑
const audios = {
    rain: document.getElementById('audio-rain'),
    cafe: document.getElementById('audio-cafe'),
    fire: document.getElementById('audio-fire'),
    jazz: document.getElementById('audio-jazz')
};
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
    
    playSelectedSound();
}

// 타이머 일시정지
function pauseTimer() {
    isRunning = false;
    startBtn.textContent = '시작';
    clearInterval(timerInterval);
    stopAllSounds();
}

// 타이머 초기화
function resetTimer() {
    pauseTimer();
    
    if (currentMode === 'work') {
        WORK_TIME = 10 * 60;
        timeLeft = WORK_TIME;
        document.querySelector('.mode-btn[data-mode="work"]').textContent = `집중 10분`;
    } else {
        BREAK_TIME = 5 * 60;
        timeLeft = BREAK_TIME;
        document.querySelector('.mode-btn[data-mode="break"]').textContent = `휴식 5분`;
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
            alert('집중 시간이 끝났습니다! 코다리가 박수 쳐드립니다! 👏 잠시 휴식을 취하세요.');
        } else {
            alert('휴식 시간이 끝났습니다! 다시 한번 달려볼까요? 🚀');
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

// 소리 제어 함수
function stopAllSounds() {
    Object.values(audios).forEach(audio => {
        if(audio) {
            audio.pause();
            audio.currentTime = 0; // 처음으로 되감기
        }
    });
}

function playSelectedSound() {
    stopAllSounds();
    const selected = soundSelector.value;
    
    // 타이머가 작동 중이고 소리가 'none'이 아닐 때만 재생
    if (selected !== 'none' && isRunning && audios[selected]) {
        audios[selected].play().catch(e => {
            console.log('Audio play failed (브라우저 정책일 수 있음):', e);
        });
    }
}

// 소리 선택 드롭다운 변경 이벤트
soundSelector.addEventListener('change', () => {
    if (isRunning) {
        playSelectedSound();
    }
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
        if(isRunning) {
            if(!confirm('타이머가 진행 중입니다. 정말 모드를 변경하시겠습니까?')) return;
        }
        switchMode(e.target.dataset.mode);
    });
});

// 시간 조절 버튼 이벤트
adjustBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const addMins = parseInt(e.target.dataset.add);
        
        if(currentMode === 'work') {
            if (WORK_TIME + (addMins * 60) > MAX_WORK_TIME) {
                alert('대표님! 열정도 좋지만 집중 시간은 최대 120분까지만 설정 가능합니다! 😅');
                return;
            }
            WORK_TIME += addMins * 60;
            timeLeft += addMins * 60;
            document.querySelector('.mode-btn[data-mode="work"]').textContent = `집중 ${Math.floor(WORK_TIME / 60)}분`;
        } else {
            if (BREAK_TIME + (addMins * 60) > MAX_BREAK_TIME) {
                alert('대표님! 휴식은 달콤하지만 최대 30분까지만 가능합니다! 얼른 복귀하셔야죠! 🚀');
                return;
            }
            BREAK_TIME += addMins * 60;
            timeLeft += addMins * 60;
            document.querySelector('.mode-btn[data-mode="break"]').textContent = `휴식 ${Math.floor(BREAK_TIME / 60)}분`;
        }
        
        updateDisplay();
    });
});

// 초기화 실행
updateDisplay();
