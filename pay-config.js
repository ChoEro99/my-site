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
