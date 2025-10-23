// 알림 표시 함수
function showAlert(message) {
    const alert = document.getElementById('downloadAlert');
    const messageElement = alert.querySelector('.alert-message');
    
    messageElement.textContent = message;
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

// 텍스트 파일 다운로드 함수
function downloadTextFile(content, filename) {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// 개별 파일 다운로드
function downloadFile(type) {
    const message = `${type.toUpperCase()} 파일 다운로드 기능은 실제 구현이 필요합니다.`;
    alert(message);
    showAlert(message);
}

// 전체 파일 다운로드
function downloadAllFiles() {
    alert('전체 파일 다운로드 기능은 실제 구현이 필요합니다.');
    showAlert('전체 파일 다운로드 기능은 실제 구현이 필요합니다.');
}

// ZIP 파일 다운로드
function downloadZip() {
    alert('ZIP 다운로드 기능은 개발 중입니다. 현재는 개별 파일로 다운로드해주세요! 😊');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('무드 다이어리 다운로드 페이지가 로드되었습니다!');
    
    // 스크롤 애니메이션 초기 설정
    const elements = document.querySelectorAll('.feature-card, .step');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
    });
});

// 스크롤 애니메이션
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.feature-card, .step');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});