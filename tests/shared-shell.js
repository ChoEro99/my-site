(function () {
  const TEST = window.TEST;
  if (!TEST) {
    document.body.innerHTML = "<p style='padding:20px'>TEST 데이터가 없습니다.</p>";
    return;
  }

  const title = TEST.ogTitle || document.title || '심리 테스트';
  const questionCount = Array.isArray(TEST.questions) ? TEST.questions.length : 0;

  document.body.innerHTML = `
  <div class="wrap">
    <header>
      <div class="brand">
        <b>${title}</b>
        <span>${questionCount}문항 · 결과 공유</span>
      </div>
      <button class="theme-toggle" id="themeToggle" aria-label="테마 전환">🌙</button>
      <div class="pill" id="pill">로딩…</div>
    </header>
    <div class="grid">
      <main class="card hero" id="screenStart">
        <h1>${title}</h1>
        <p>2~3분이면 결과가 나와요.</p>
        <div class="btns">
          <button class="primary" id="btnStart">테스트 시작</button>
          <button id="btnShowLast" class="hidden">마지막 결과</button>
          <a class="pill" href="/">🏠 홈</a>
        </div>
        <div class="note">* 재미/콘텐츠용</div>
      </main>

      <main class="card hidden" id="screenQuiz">
        <div class="progress"><div class="bar" id="bar"></div></div>
        <div class="pill" id="qMeta"></div>
        <div class="qtitle" id="qTitle"></div>
        <div class="choices" id="choices"></div>
        <div class="btns" style="margin-top:12px">
          <button id="btnBack">이전</button>
          <button id="btnRestart">처음으로</button>
        </div>
      </main>

      <main class="card hidden" id="screenResult">
        <div class="resultTitle"><div class="emoji" id="rEmoji"></div><h2 id="rTitle"></h2></div>
        <p class="resultDesc" id="rDesc"></p><div class="tags" id="rTags"></div>

        <div class="twoCol">
          <div class="card mini" style="padding:14px"><h4>강점</h4><ul id="rStrengths"></ul></div>
          <div class="card mini" style="padding:14px"><h4>주의</h4><ul id="rPitfalls"></ul></div>
        </div>

        <div class="card mini" style="padding:14px;margin-top:12px"><h4>추천 루틴</h4><ul id="rRoutine"></ul></div>

        <div class="adbox"><b>[광고 자리 - 결과]</b></div>

        <div class="btns">
          <button class="primary" id="btnCopy">결과 링크 복사</button>
          <button id="btnKakao">카카오톡 공유</button>
          <button id="btnAgain">다시하기</button>
          <a class="pill" href="/">🏠 홈</a>
        </div>

        <div class="note" id="shareHint"></div><div id="otherTests"></div>
      </main>

      <aside class="card side">
        <div class="adbox"><b>[광고 자리]</b></div>
      </aside>
    </div>
  </div>
  <div class="toast" id="toast"></div>
  `;

  const KAKAO_APP_KEY = window.KAKAO_APP_KEY || 'e810a3d9eddcf0271884bbe79e1ac6f3';

  function loadQuizRuntime() {
    const quizScript = document.createElement('script');
    quizScript.src = '/quiz.js';
    quizScript.onload = function () {
      if (typeof window.initQuiz === 'function') {
        window.initQuiz();
      }
    };
    document.body.appendChild(quizScript);
  }

  function initKakaoThenStart() {
    if (!window.Kakao) {
      loadQuizRuntime();
      return;
    }

    if (!window.Kakao.isInitialized()) {
      try {
        window.Kakao.init(KAKAO_APP_KEY);
      } catch (e) {}
    }

    loadQuizRuntime();
  }

  const kakaoScript = document.createElement('script');
  kakaoScript.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
  kakaoScript.onload = initKakaoThenStart;
  kakaoScript.onerror = loadQuizRuntime;
  document.head.appendChild(kakaoScript);
})();
