# mypetlog API 기능 통합 테스트 스크립트
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "🚀 mypetlog 백엔드 API 통신 테스트 개시" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

$BaseUrl = "http://localhost:5000/api"
# 실제 환경의 JWT 토큰 샘플이나 테스트용 세션 세팅 필요
$Headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer TEST_TOKEN_PLACEHOLDER"
}

# 1. 신고하기 POST API 모의 전송 테스트
$ReportBody = @{
    post_id = 7
    comment_id = $null
    reason = "PowerShell 자동화 스크립트 발송 테스트 신고 건"
} | ConvertTo-Json

Write-Host "`n[테스트 1] 신규 게시글 신고 API (/api/reports) 호출 요청 중..." -ForegroundColor Cyan
try {
    $ReportRes = Invoke-RestMethod -Uri "$BaseUrl/reports" -Method Post -Headers $Headers -Body $ReportBody
    Write-Host "✅ 결과: 성공!" -ForegroundColor Green
    $ReportRes | Format-List
} catch {
    Write-Host "❌ 결과: 실패 (서버 구동 상태 및 토큰 검증 필요)" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2. 관리자 로그 타임라인 GET API 호출 테스트
Write-Host "`n[테스트 2] 어드민 로그 타임라인 API (/api/admin/logs) 조회 요청 중..." -ForegroundColor Cyan
try {
    $AdminRes = Invoke-RestMethod -Uri "$BaseUrl/admin/logs" -Method Get -Headers $Headers
    Write-Host "✅ 결과: 성공!" -ForegroundColor Green
    $AdminRes.logs | Format-Table -AutoSize
} catch {
    Write-Host "❌ 결과: 실패" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
