// 전역 변수
let selectedData = {
    weather: null,
    mood: null,
    energy: null,
    selfCare: [],
    journal: '',
    otherCare: ''
};

let currentDate = new Date();

// 페이지 로드시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    // 오늘 날짜로 초기화
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
    document.getElementById('dateInput').max = today;
    
    // 날짜 변경 이벤트 리스너
    document.getElementById('dateInput').addEventListener('change', function() {
        loadEntryForDate(this.value);
    });
    
    // 달력 렌더링
    renderCalendar();
    
    // 기록 목록 로드
    loadHistory();
    
    // 오늘 날짜의 기록 로드
    loadEntryForDate(today);
}

// 날씨 선택
function selectWeather(element) {
    // 모든 날씨 아이템의 선택 해제
    document.querySelectorAll('.weather-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 클릭된 아이템 선택
    element.classList.add('selected');
    selectedData.weather = element.dataset.weather;
}

// 기분 선택
function selectMood(element) {
    // 모든 기분 아이템의 선택 해제
    document.querySelectorAll('.mood-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 클릭된 아이템 선택
    element.classList.add('selected');
    selectedData.mood = element.dataset.mood;
}

// 에너지 선택
function selectEnergy(element) {
    const energyLevel = parseInt(element.dataset.energy);
    
    // 모든 에너지 레벨 초기화
    document.querySelectorAll('.energy-level').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 선택된 레벨까지 모두 선택
    for (let i = 1; i <= energyLevel; i++) {
        document.querySelector(`[data-energy="${i}"]`).classList.add('selected');
    }
    
    selectedData.energy = energyLevel;
}

// 자기관리 토글
function toggleSelfCare(element) {
    const careType = element.dataset.care;
    
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        if (!selectedData.selfCare.includes(careType)) {
            selectedData.selfCare.push(careType);
        }
    } else {
        selectedData.selfCare = selectedData.selfCare.filter(item => item !== careType);
    }
}

// 특정 날짜의 기록 불러오기
function loadEntryForDate(date) {
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const entry = entries.find(e => e.date === date);
    
    // 모든 선택 초기화
    clearAllSelections();
    
    if (entry) {
        // 날씨 복원
        if (entry.weather) {
            const weatherElement = document.querySelector(`[data-weather="${entry.weather}"]`);
            if (weatherElement) {
                weatherElement.classList.add('selected');
                selectedData.weather = entry.weather;
            }
        }
        
        // 기분 복원
        if (entry.mood) {
            const moodElement = document.querySelector(`[data-mood="${entry.mood}"]`);
            if (moodElement) {
                moodElement.classList.add('selected');
                selectedData.mood = entry.mood;
            }
        }
        
        // 에너지 복원
        if (entry.energy) {
            for (let i = 1; i <= parseInt(entry.energy); i++) {
                const energyElement = document.querySelector(`[data-energy="${i}"]`);
                if (energyElement) {
                    energyElement.classList.add('selected');
                }
            }
            selectedData.energy = parseInt(entry.energy);
        }
        
        // 자기관리 복원
        if (entry.selfCare) {
            entry.selfCare.forEach(care => {
                const careElement = document.querySelector(`[data-care="${care}"]`);
                if (careElement) {
                    careElement.classList.add('selected');
                }
            });
            selectedData.selfCare = [...entry.selfCare];
        }
        
        // 일기 복원
        if (entry.journal) {
            document.getElementById('journalText').value = entry.journal;
            selectedData.journal = entry.journal;
        }
        
        // 기타 자기관리 복원
        if (entry.otherCare) {
            document.getElementById('otherCare').value = entry.otherCare;
            selectedData.otherCare = entry.otherCare;
        }
    } else {
        // 새로운 날짜인 경우 초기화
        selectedData = {
            weather: null,
            mood: null,
            energy: null,
            selfCare: [],
            journal: '',
            otherCare: ''
        };
        document.getElementById('journalText').value = '';
        document.getElementById('otherCare').value = '';
    }
}

// 모든 선택 초기화
function clearAllSelections() {
    document.querySelectorAll('.weather-item, .mood-item, .energy-level, .care-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// 현재 입력된 데이터 가져오기
function getCurrentEntry() {
    const date = document.getElementById('dateInput').value;
    const journal = document.getElementById('journalText').value;
    const otherCare = document.getElementById('otherCare').value;
    
    return {
        date: date,
        weather: selectedData.weather,
        mood: selectedData.mood,
        energy: selectedData.energy,
        selfCare: selectedData.selfCare,
        journal: journal,
        otherCare: otherCare,
        timestamp: new Date().toISOString()
    };
}

// 기록 저장
function saveEntry() {
    const entry = getCurrentEntry();
    
    // 미래 날짜 체크
    const today = new Date().toISOString().split('T')[0];
    if (entry.date > today) {
        showAlert('미래 날짜로는 기록할 수 없습니다! 😅', 'error');
        return;
    }

    // localStorage에 저장
    let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    
    // 같은 날짜가 있으면 업데이트, 없으면 추가
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    if (existingIndex !== -1) {
        entries[existingIndex] = entry;
    } else {
        entries.push(entry);
    }
    
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('moodEntries', JSON.stringify(entries));

    showAlert('기록이 저장되었습니다! 💾');
    loadHistory();
    renderCalendar();
}

// 알림 표시
function showAlert(message, type = 'success') {
    const alert = document.getElementById('saveAlert');
    alert.textContent = message;
    alert.className = `alert ${type}`;
    
    // 에러 스타일 추가
    if (type === 'error') {
        alert.style.backgroundColor = '#f8d7da';
        alert.style.borderColor = '#f5c6cb';
        alert.style.color = '#721c24';
    } else {
        alert.style.backgroundColor = '#d4edda';
        alert.style.borderColor = '#c3e6cb';
        alert.style.color = '#155724';
    }
    
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// 달력 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 달력 제목 업데이트
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                       '7월', '8월', '9월', '10월', '11월', '12월'];
    document.getElementById('calendarTitle').textContent = `${year}년 ${monthNames[month]}`;
    
    // 달력 그리드 생성
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // 요일 헤더
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.style.textAlign = 'center';
        dayElement.style.fontWeight = 'bold';
        dayElement.style.padding = '10px';
        dayElement.style.color = '#6c757d';
        calendar.appendChild(dayElement);
    });
    
    // 첫 번째 날의 요일 계산
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 빈 셀 추가
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendar.appendChild(emptyCell);
    }
    
    // 날짜 셀 추가
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = entries.find(e => e.date === dateString);
        
        // 오늘 날짜 표시
        if (dateString === today) {
            dayElement.classList.add('today');
        }
        
        // 기록이 있는 날 표시
        if (entry) {
            dayElement.classList.add('has-entry');
            
            // 기분 이모지 추가
            if (entry.mood) {
                const moodEmoji = getMoodEmoji(parseInt(entry.mood));
                const emojiElement = document.createElement('div');
                emojiElement.className = 'mood-emoji';
                emojiElement.textContent = moodEmoji;
                dayElement.appendChild(emojiElement);
            }
            
            // 인디케이터 추가
            const indicators = document.createElement('div');
            indicators.className = 'indicators';
            
            if (entry.weather) {
                const weatherIndicator = document.createElement('div');
                weatherIndicator.className = 'indicator weather-indicator';
                indicators.appendChild(weatherIndicator);
            }
            
            if (entry.selfCare && entry.selfCare.length > 0) {
                const careIndicator = document.createElement('div');
                careIndicator.className = 'indicator care-indicator';
                indicators.appendChild(careIndicator);
            }
            
            if (entry.journal) {
                const journalIndicator = document.createElement('div');
                journalIndicator.className = 'indicator journal-indicator';
                indicators.appendChild(journalIndicator);
            }
            
            dayElement.appendChild(indicators);
            
            // 클릭 이벤트
            dayElement.addEventListener('click', () => showEntryDetail(entry));
        }
        
        calendar.appendChild(dayElement);
    }
}

// 기분에 따른 이모지 반환
function getMoodEmoji(mood) {
    if (mood >= 9) return '😄';
    if (mood >= 7) return '😊';
    if (mood >= 5) return '🙂';
    if (mood >= 3) return '😔';
    return '😢';
}

// 이전 달
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// 다음 달
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// 기록 상세 보기
function showEntryDetail(entry) {
    const modal = document.getElementById('detailModal');
    const modalDate = document.getElementById('modalDate');
    const modalContent = document.getElementById('modalContent');
    
    modalDate.textContent = new Date(entry.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    let content = '<div class="modal-body">';
    
    // 날씨
    if (entry.weather) {
        const weatherNames = {
            sunny: '☀️ 맑음', cloudy: '☁️ 흐림', overcast: '⛅ 구름많음',
            rainy: '🌧️ 비', windy: '💨 바람', snowy: '❄️ 눈'
        };
        content += `
            <div class="modal-section">
                <h4>🌤️ 날씨</h4>
                <p>${weatherNames[entry.weather]}</p>
            </div>
        `;
    }
    
    // 기분
    if (entry.mood) {
        content += `
            <div class="modal-section">
                <h4>😊 기분</h4>
                <p>${entry.mood}/10 ${getMoodEmoji(parseInt(entry.mood))}</p>
            </div>
        `;
    }
    
    // 에너지
    if (entry.energy) {
        content += `
            <div class="modal-section">
                <h4>⚡ 에너지</h4>
                <p>${entry.energy}/5</p>
            </div>
        `;
    }
    
    // 자기관리
    if (entry.selfCare && entry.selfCare.length > 0) {
        const careNames = {
            exercise: '운동', meditation: '명상', sleep: '충분한 잠', other: '기타'
        };
        content += `
            <div class="modal-section">
                <h4>🌱 자기관리</h4>
                <div>
        `;
        entry.selfCare.forEach(care => {
            content += `<span class="care-tag">${careNames[care] || care}</span>`;
        });
        if (entry.otherCare) {
            content += `<span class="care-tag">${entry.otherCare}</span>`;
        }
        content += `
                </div>
            </div>
        `;
    }
    
    // 일기
    if (entry.journal) {
        content += `
            <div class="modal-section">
                <h4>📖 감정일기</h4>
                <p style="white-space: pre-wrap;">${entry.journal}</p>
            </div>
        `;
    }
    
    content += '</div>';
    modalContent.innerHTML = content;
    modal.style.display = 'block';
}

// 최근 기록 로드
function loadHistory() {
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const historyList = document.getElementById('historyList');
    
    // 최근 5개 기록만 표시
    const recentEntries = entries.slice(0, 5);
    
    historyList.innerHTML = '';
    
    if (recentEntries.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #6c757d;">아직 기록이 없습니다. 첫 기록을 남겨보세요! 😊</p>';
        return;
    }
    
    recentEntries.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const leftDiv = document.createElement('div');
        leftDiv.innerHTML = `
            <div class="history-date">${new Date(entry.date).toLocaleDateString('ko-KR')}</div>
            <div class="history-details">
                기분: ${entry.mood || '-'}/10, 에너지: ${entry.energy || '-'}/5
            </div>
        `;
        
        const rightDiv = document.createElement('div');
        rightDiv.className = 'history-emoji';
        rightDiv.textContent = entry.mood ? getMoodEmoji(parseInt(entry.mood)) : '📝';
        
        historyItem.appendChild(leftDiv);
        historyItem.appendChild(rightDiv);
        
        // 클릭 이벤트
        historyItem.addEventListener('click', () => showEntryDetail(entry));
        
        historyList.appendChild(historyItem);
    });
}

// 모달 닫기
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// 도움말 모달 열기
function showHelpModal() {
    document.getElementById('helpModal').style.display = 'block';
}

// 도움말 모달 닫기
function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    const detailModal = document.getElementById('detailModal');
    const helpModal = document.getElementById('helpModal');
    if (event.target === detailModal) {
        closeModal();
    }
    if (event.target === helpModal) {
        closeHelpModal();
    }
}

// 월간 리포트 다운로드
function downloadMonthlyReport() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const monthlyEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });

    if (monthlyEntries.length === 0) {
        alert('이번 달 기록이 없습니다!');
        return;
    }

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                       '7월', '8월', '9월', '10월', '11월', '12월'];
    const monthName = monthNames[month];
    
    // 다운로드 옵션 선택
    const choice = confirm('📊 월간 리포트 다운로드\n\n확인: 이미지 파일 (모바일 추천) 📱\n취소: 텍스트 파일 (PC 추천) 💻');
    
    if (choice) {
        downloadReportAsImage(monthlyEntries, year, monthName);
    } else {
        const report = generateMonthlyReport(monthlyEntries, year, monthName);
        downloadTextFile(report, `무드다이어리_${year}년_${monthName}_리포트.txt`);
    }
}

// 이미지로 리포트 다운로드
function downloadReportAsImage(entries, year, monthName) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정 (세로로 긴 이미지)
    canvas.width = 800;
    canvas.height = 1200;
    
    // 배경색 설정
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 폰트 설정
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let y = 40; // 시작 y 좌표
    const lineHeight = 35;
    const margin = 50;
    
    // 제목
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(`📊 ${year}년 ${monthName} 무드 다이어리`, margin, y);
    y += 60;
    
    // 구분선
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    ctx.stroke();
    y += 40;
    
    // 기본 통계 계산
    const totalDays = entries.length;
    const moods = entries.filter(e => e.mood).map(e => parseInt(e.mood));
    const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : 0;
    const energies = entries.filter(e => e.energy).map(e => parseInt(e.energy));
    const avgEnergy = energies.length > 0 ? (energies.reduce((a, b) => a + b, 0) / energies.length).toFixed(1) : 0;
    
    // 자기관리 통계
    let exerciseCount = 0, meditationCount = 0, sleepCount = 0;
    entries.forEach(entry => {
        if (entry.selfCare) {
            if (entry.selfCare.includes('exercise')) exerciseCount++;
            if (entry.selfCare.includes('meditation')) meditationCount++;
            if (entry.selfCare.includes('sleep')) sleepCount++;
        }
    });
    
    // 이번 달 요약
    ctx.fillStyle = '#007bff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('📈 이번 달 요약', margin, y);
    y += 40;
    
    ctx.fillStyle = '#495057';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(`• 기록한 날: ${totalDays}일`, margin + 20, y);
    y += lineHeight;
    ctx.fillText(`• 평균 기분: ${avgMood}/10`, margin + 20, y);
    y += lineHeight;
    ctx.fillText(`• 평균 에너지: ${avgEnergy}/5`, margin + 20, y);
    y += 50;
    
    // 자기관리 현황
    ctx.fillStyle = '#28a745';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('🏆 자기관리 실천 현황', margin, y);
    y += 40;
    
    ctx.fillStyle = '#495057';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(`• 운동: ${exerciseCount}회 ${exerciseCount >= 10 ? '🔥' : exerciseCount >= 5 ? '👍' : '💪'}`, margin + 20, y);
    y += lineHeight;
    ctx.fillText(`• 명상: ${meditationCount}회 ${meditationCount >= 10 ? '🧘‍♀️' : meditationCount >= 5 ? '🌸' : '🌱'}`, margin + 20, y);
    y += lineHeight;
    ctx.fillText(`• 충분한 잠: ${sleepCount}회 ${sleepCount >= 15 ? '😴' : sleepCount >= 10 ? '💤' : '⏰'}`, margin + 20, y);
    y += 50;
    
    // 베스트 기분의 날
    const bestMood = moods.length > 0 ? Math.max(...moods) : 0;
    const bestDay = entries.find(e => e.mood && parseInt(e.mood) === bestMood);
    
    if (bestDay) {
        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('🌟 이번 달 베스트 기분의 날', margin, y);
        y += 40;
        
        ctx.fillStyle = '#495057';
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText(`${bestDay.date} (${bestDay.mood}/10점)`, margin + 20, y);
        y += lineHeight;
        
        if (bestDay.journal) {
            const journalText = bestDay.journal.length > 50 ? bestDay.journal.substring(0, 50) + '...' : bestDay.journal;
            ctx.fillText(`"${journalText}"`, margin + 20, y);
            y += lineHeight;
        }
        y += 30;
    }
    
    // 인사이트
    ctx.fillStyle = '#6f42c1';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('💡 이번 달 인사이트', margin, y);
    y += 40;
    
    ctx.fillStyle = '#495057';
    ctx.font = '18px Arial, sans-serif';
    let insight = '';
    if (avgMood >= 7) {
        insight = '• 전반적으로 좋은 한 달을 보내셨네요! 😊';
    } else if (avgMood >= 5) {
        insight = '• 평범한 한 달이었어요. 다음 달은 더 좋아질 거예요! 💪';
    } else {
        insight = '• 힘든 시간이었지만, 기록하며 노력하신 게 대단해요! 🌱';
    }
    ctx.fillText(insight, margin + 20, y);
    y += 80;
    
    // 마무리
    ctx.fillStyle = '#e91e63';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('🌸 작은 기록이 모여 큰 변화를 만듭니다!', margin, y);
    y += 50;
    
    // 크레딧
    ctx.fillStyle = '#6c757d';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('✨ made by 새벽숲', margin, y);
    y += 25;
    ctx.fillText(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, margin, y);
    
    // 이미지 다운로드
    canvas.toBlob(function(blob) {
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = `무드다이어리_${year}년_${monthName}_리포트.png`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        showAlert('월간 리포트 이미지가 다운로드되었습니다! 📊');
    }, 'image/png');
}

// 월간 리포트 생성
function generateMonthlyReport(entries, year, monthName) {
    const totalDays = entries.length;
    
    // 기분 통계
    const moods = entries.filter(e => e.mood).map(e => parseInt(e.mood));
    const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : 0;
    const bestMood = moods.length > 0 ? Math.max(...moods) : 0;
    const worstMood = moods.length > 0 ? Math.min(...moods) : 0;

    // 에너지 통계
    const energies = entries.filter(e => e.energy).map(e => parseInt(e.energy));
    const avgEnergy = energies.length > 0 ? (energies.reduce((a, b) => a + b, 0) / energies.length).toFixed(1) : 0;

    // 자기관리 통계
    let exerciseCount = 0, meditationCount = 0, sleepCount = 0;
    entries.forEach(entry => {
        if (entry.selfCare) {
            if (entry.selfCare.includes('exercise')) exerciseCount++;
            if (entry.selfCare.includes('meditation')) meditationCount++;
            if (entry.selfCare.includes('sleep')) sleepCount++;
        }
    });

    // 날씨별 기분 분석
    const weatherMoods = {};
    entries.forEach(entry => {
        if (entry.weather && entry.mood) {
            if (!weatherMoods[entry.weather]) weatherMoods[entry.weather] = [];
            weatherMoods[entry.weather].push(parseInt(entry.mood));
        }
    });

    const weatherNames = {
        sunny: '☀️ 맑음', cloudy: '☁️ 흐림', overcast: '⛅ 구름많음',
        rainy: '🌧️ 비', windy: '💨 바람', snowy: '❄️ 눈'
    };

    // 베스트 & 워스트 날
    const bestDay = entries.find(e => e.mood && parseInt(e.mood) === bestMood);
    const worstDay = entries.find(e => e.mood && parseInt(e.mood) === worstMood);

    let report = `📊 ${year}년 ${monthName} 무드 다이어리 리포트\n`;
    report += `=`.repeat(50) + '\n\n';

    report += `📈 이번 달 요약\n`;
    report += `• 기록한 날: ${totalDays}일\n`;
    report += `• 평균 기분: ${avgMood}/10\n`;
    report += `• 평균 에너지: ${avgEnergy}/5\n`;
    report += `• 최고 기분: ${bestMood}/10\n`;
    report += `• 최저 기분: ${worstMood}/10\n\n`;

    report += `🏆 자기관리 실천 현황\n`;
    report += `• 운동: ${exerciseCount}회 ${exerciseCount >= 10 ? '🔥' : exerciseCount >= 5 ? '👍' : '💪'}\n`;
    report += `• 명상: ${meditationCount}회 ${meditationCount >= 10 ? '🧘‍♀️' : meditationCount >= 5 ? '🌸' : '🌱'}\n`;
    report += `• 충분한 잠: ${sleepCount}회 ${sleepCount >= 15 ? '😴' : sleepCount >= 10 ? '💤' : '⏰'}\n\n`;

    if (Object.keys(weatherMoods).length > 0) {
        report += `🌤️ 날씨별 기분 분석\n`;
        Object.keys(weatherMoods).forEach(weather => {
            const moods = weatherMoods[weather];
            const avg = (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1);
            report += `• ${weatherNames[weather]}: 평균 ${avg}점 (${moods.length}일)\n`;
        });
        report += '\n';
    }

    if (bestDay) {
        report += `🌟 이번 달 베스트 기분의 날\n`;
        report += `${bestDay.date} (${bestDay.mood}/10점)\n`;
        if (bestDay.journal) {
            report += `"${bestDay.journal.substring(0, 100)}${bestDay.journal.length > 100 ? '...' : ''}"\n`;
        }
        report += '\n';
    }

    if (worstDay && worstDay !== bestDay) {
        report += `💙 힘들었던 날도 소중한 경험\n`;
        report += `${worstDay.date} (${worstDay.mood}/10점)\n`;
        if (worstDay.journal) {
            report += `"${worstDay.journal.substring(0, 100)}${worstDay.journal.length > 100 ? '...' : ''}"\n`;
        }
        report += '\n';
    }

    report += `💡 이번 달 인사이트\n`;
    if (avgMood >= 7) {
        report += `• 전반적으로 좋은 한 달을 보내셨네요! 😊\n`;
    } else if (avgMood >= 5) {
        report += `• 평범한 한 달이었어요. 다음 달은 더 좋아질 거예요! 💪\n`;
    } else {
        report += `• 힘든 시간이었지만, 기록하며 노력하신 게 대단해요! 🌱\n`;
    }

    if (exerciseCount >= 10) {
        report += `• 운동을 정말 열심히 하셨어요! 건강한 습관 👏\n`;
    }
    if (meditationCount >= 5) {
        report += `• 마음챙김을 잘 실천하고 계시네요! 🧘‍♀️\n`;
    }
    if (sleepCount >= 15) {
        report += `• 충분한 수면으로 건강 관리를 잘하고 계세요! 😴\n`;
    }

    report += `\n💝 다음 달 목표 제안\n`;
    if (exerciseCount < 10) report += `• 운동 횟수 늘리기 (목표: ${exerciseCount + 5}회)\n`;
    if (avgMood < 7) report += `• 기분 좋은 활동 늘리기 (목표: 평균 7점 이상)\n`;
    if (meditationCount < 5) report += `• 마음챙김 시간 갖기 (목표: 주 2회 이상)\n`;

    report += `\n🌸 마무리\n`;
    report += `작은 기록들이 모여 소중한 추억이 되었어요.\n`;
    report += `꾸준히 자신을 돌보시는 모습이 아름답습니다! 💜\n\n`;
    
    report += `✨ made by 새벽숲\n`;
    report += `무드 다이어리와 함께하는 ${year}년 ${monthName}\n`;
    report += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n`;

    return report;
}

// 텍스트 파일 다운로드
function downloadTextFile(content, filename) {
    // UTF-8 BOM 추가로 한글 인코딩 문제 해결
    const BOM = '\uFEFF';
    const element = document.createElement('a');
    const file = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showAlert('월간 리포트가 다운로드되었습니다! 📊');
}