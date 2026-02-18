window.PAY_CONFIG = window.PAY_CONFIG || {
  portone: {
    impCode: "", // 예: imp12345678
    pgStarter: "", // 예: html5_inicis.INIpayTest
    pgFull: "" // 예: html5_inicis.INIpayTest
  }
};

// 필요 시 결과별 금액을 전역으로 변경
window.REPORT_PRICES = window.REPORT_PRICES || {
  starter: 900,
  full: 1900
};

// 플랜별 리포트 생성 가능 횟수
window.REPORT_CREDITS = window.REPORT_CREDITS || {
  starter: 1,
  full: 2
};

// AI 테스트 생성 결제 패키지
window.TEST_GENERATION_PACKAGE = window.TEST_GENERATION_PACKAGE || {
  price: 1900,
  generationCredits: 1,
  reportDownloadsPerTest: 2
};
