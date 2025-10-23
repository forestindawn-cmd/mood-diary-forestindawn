function downloadMoodDiary() {
    // 실제 파일 경로로 변경해주세요
    const link = document.createElement('a');
    link.href = 'mood_diary_by_forestindawn.html'; // 실제 파일 경로
    link.download = 'mood_diary_by_forestindawn.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 다운로드 완료 알림
    alert('MOOD DIARY 다운로드가 시작되었습니다! 🎉\n\n다운로드 완료 후 브라우저로 파일을 열어서 사용하세요.');
}
