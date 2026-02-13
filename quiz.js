// quiz.js (FINAL) - Kakao share + shareUrl + absolute OG image + other tests
const $ = (id) => document.getElementById(id);

function track(eventName, data = {}) {
  if (typeof gtag === "function") {
    gtag('event', eventName, data);
  }
}

function showToast(msg){
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1200);
}

function makeOtherTestsLinks(){
  return `
  <div class="card mini" style="padding:14px;margin-top:12px">
    <h4>다른 테스트 더 하기</h4>
    <ul>
      <li><a href="/tests/travel.html">여행 성향 테스트</a></li>
      <li><a href="/tests/love.html">연애 스타일 테스트</a></li>
      <li><a href="/tests/spend.html">소비 습관 테스트</a></li>
      <li><a href="/tests/stress.html">직장 스트레스 유형</a></li>
      <li><a href="/tests/money.html">돈 모으는 스타일</a></li>
      <li><a href="/tests/work.html">업무 스타일 테스트</a></li>
      <li><a href="/">🏠 홈으로</a></li>
    </ul>
  </div>`;
}

function initQuiz(){
  const TEST = window.TEST;
  if (!TEST) {
    document.body.innerHTML = "<p style='padding:20px'>TEST 데이터가 없습니다.</p>";
    return;
  }

  // 스크린
  const screens = {
    start: $("screenStart"),
    quiz: $("screenQuiz"),
    result: $("screenResult"),
  };

  const state = {
    idx: 0,
    scores: Object.fromEntries(TEST.types.map(t=>[t,0])),
    answers: []
  };

  function setPill(text){
    const p = $("pill");
    if (p) p.textContent = text;
  }

  function switchScreen(name){
    Object.values(screens).forEach(el => el && el.classList.add("hidden"));
    screens[name] && screens[name].classList.remove("hidden");
  }

  function applyScore(obj){
    for (const k in obj) state.scores[k] = (state.scores[k] || 0) + obj[k];
  }
  function unapplyScore(obj){
    for (const k in obj) state.scores[k] = (state.scores[k] || 0) - obj[k];
  }

  function topResult(){
    const order = TEST.types;
    let best = order[0];
    for (const k of order){
      if (state.scores[k] > state.scores[best]) best = k;
    }
    return best;
  }

  function setProgress(){
    const total = TEST.questions.length;
    const pct = Math.round((state.idx / total) * 100);
    const bar = $("bar");
    const meta = $("qMeta");
    if (bar) bar.style.width = pct + "%";
    if (meta) meta.textContent = `${state.idx+1} / ${total}`;
  }

  function renderQuestion(){
    setProgress();
    const q = TEST.questions[state.idx];
    const title = $("qTitle");
    const choices = $("choices");
    if (title) title.textContent = q.q;
    if (!choices) return;

    choices.innerHTML = "";
    q.c.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";
      btn.textContent = choice.t;
      btn.onclick = () => pick(i);
      choices.appendChild(btn);
    });

    const back = $("btnBack");
    if (back) back.disabled = (state.idx === 0);
  }

  function renderResult(resultId, fromParam=false){
    const r = TEST.results[resultId];
    if (!r) return;

    $("rEmoji").textContent = r.emoji || "✨";
    $("rTitle").textContent = r.title || "결과";
    $("rDesc").textContent  = r.desc  || "";

    const tags = $("rTags"); tags.innerHTML="";
    (r.tags||[]).forEach(t=>{
      const s=document.createElement("span");
      s.className="tag";
      s.textContent="#"+t;
      tags.appendChild(s);
    });

    const s1=$("rStrengths"); s1.innerHTML="";
    (r.strengths||[]).forEach(x=>{ const li=document.createElement("li"); li.textContent=x; s1.appendChild(li); });

    const s2=$("rPitfalls"); s2.innerHTML="";
    (r.pitfalls||[]).forEach(x=>{ const li=document.createElement("li"); li.textContent=x; s2.appendChild(li); });

    const s3=$("rRoutine"); s3.innerHTML="";
    (r.routine||[]).forEach(x=>{ const li=document.createElement("li"); li.textContent=x; s3.appendChild(li); });

    // 저장
    localStorage.setItem(TEST.storageKey, resultId);

    // 공유 링크 (?r=) - 항상 절대 URL
    const url = new URL(location.href);
    url.searchParams.set("r", resultId);
    const shareUrl = url.toString();
    $("shareHint").textContent = `공유 링크: ${shareUrl}`;

    // 다른 테스트 유도
    $("otherTests").innerHTML = makeOtherTestsLinks();

    // ✅ 카카오 공유 (버튼/링크 안 뜨는 이슈 방지: imageUrl 절대주소 강제)
    const kbtn = document.getElementById("btnKakao");
    if (kbtn && window.Kakao && window.Kakao.isInitialized()) {
      kbtn.onclick = () => {
        const imageAbs =
          (TEST.ogImage && String(TEST.ogImage).startsWith("http"))
            ? TEST.ogImage
            : (location.origin + "/og.png"); // 반드시 절대주소

        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: TEST.ogTitle || document.title,
            description: TEST.ogDesc || "2~3분 심리테스트! 결과를 확인해보세요.",
            imageUrl: imageAbs,
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl }
          },
          buttons: [
            { title: "결과 보러가기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }
          ]
        });

        track("share_kakao", { test: TEST.slug, resultId });
      };
    }

    switchScreen("result");
    track("quiz_result", { test: TEST.slug, resultId, fromParam });
  }

  function reset(){
    state.idx = 0;
    state.scores = Object.fromEntries(TEST.types.map(t=>[t,0]));
    state.answers = [];
    renderQuestion();
    switchScreen("quiz");
    setPill(TEST.badge || "테스트 진행");
    track("quiz_start", { test: TEST.slug });
  }

  function pick(choiceIndex){
    const q = TEST.questions[state.idx];
    const picked = q.c[choiceIndex];
    applyScore(picked.s);
    state.answers[state.idx] = choiceIndex;

    if (state.idx < TEST.questions.length - 1){
      state.idx += 1;
      renderQuestion();
    } else {
      const bar = $("bar");
      if (bar) bar.style.width = "100%";
      renderResult(topResult());
    }
  }

  // 버튼 이벤트
  $("btnStart") && ($("btnStart").onclick = reset);
  $("btnAgain") && ($("btnAgain").onclick = reset);

  $("btnBack") && ($("btnBack").onclick = () => {
    if (state.idx === 0) return;
    const prevIdx = state.idx - 1;
    const prevQ = TEST.questions[prevIdx];
    const prevChoice = state.answers[prevIdx];

    state.idx = prevIdx;
    if (typeof prevChoice === "number"){
      unapplyScore(prevQ.c[prevChoice].s);
      state.answers[prevIdx] = undefined;
    }
    renderQuestion();
    track("quiz_back", { test: TEST.slug, idx: state.idx });
  });

  $("btnRestart") && ($("btnRestart").onclick = () => {
    switchScreen("start");
    setPill("");
  });

  $("btnCopy") && ($("btnCopy").onclick = async () => {
    const last = localStorage.getItem(TEST.storageKey);
    const u = new URL(location.href);
    if (last) u.searchParams.set("r", last);
    try{
      await navigator.clipboard.writeText(u.toString());
      showToast("결과 링크 복사 완료!");
    }catch(e){
      const tmp=document.createElement("textarea");
      tmp.value=u.toString();
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      showToast("복사 완료!");
    }
    track("share_copy", { test: TEST.slug });
  });

  // 공유 링크로 진입
  const params = new URLSearchParams(location.search);
  const r = params.get("r");
  const last = localStorage.getItem(TEST.storageKey);

  if (last) $("btnShowLast") && $("btnShowLast").classList.remove("hidden");
  $("btnShowLast") && ($("btnShowLast").onclick = () => renderResult(last, true));

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();

  if (r && TEST.results[r]) {
    setPill("공유 결과 보기");
    renderResult(r, true);
    return;
  }

  setPill("");
  switchScreen("start");
}
