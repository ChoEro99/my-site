window.PAY_CONFIG = window.PAY_CONFIG || {
  portone: {
    impCode: "", // 예: imp12345678
    pgStarter: "", // 예: html5_inicis.INIpayTest
    pgFull: "" // 예: html5_inicis.INIpayTest
  }
};

// 이용권 정책
window.VOUCHER_PACKAGES = window.VOUCHER_PACKAGES || {
  generation_1: {
    id: "generation_1",
    label: "테스트 생성권 1개",
    price: 1900,
    generationCredits: 1,
    reportCredits: 0
  },
  report_2: {
    id: "report_2",
    label: "리포트 이용권 2개",
    price: 1900,
    generationCredits: 0,
    reportCredits: 2
  },
  combo_1_2: {
    id: "combo_1_2",
    label: "생성권 1개 + 리포트권 2개",
    price: 2900,
    generationCredits: 1,
    reportCredits: 2
  }
};

// 리포트 소모량: starter=1, full=2
window.REPORT_VOUCHER_COST = window.REPORT_VOUCHER_COST || {
  starter: 1,
  full: 2
};

// 하위 호환
window.TEST_GENERATION_PACKAGE = window.TEST_GENERATION_PACKAGE || window.VOUCHER_PACKAGES.generation_1;
