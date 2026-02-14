diff --git a/quiz.js b/quiz.js
index 9e6cab4e1f160e0147c0c9f4babb85b06a47b1f8..f2a30fdae4519457ff3eb63eb79ae53a0c45a8ba 100644
--- a/quiz.js
+++ b/quiz.js
@@ -9,68 +9,130 @@ function track(eventName, data = {}) {
 
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
 

function upsertMeta(selector, attr, value) {
  if (!value) return;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    const [k, v] = attr;
    node.setAttribute(k, v);
    document.head.appendChild(node);
  }
  node.setAttribute("content", value);
}

function applySeoMeta(TEST) {
  const title = `${TEST.ogTitle || document.title} | 2~3분 심리테스트`;
  const desc = TEST.ogDesc || "2~3분 심리테스트 결과를 바로 확인해보세요.";
  const image = (TEST.ogImage && String(TEST.ogImage).startsWith("http"))
    ? TEST.ogImage
    : `${location.origin}/og.png`;

  document.title = title;
  upsertMeta('meta[name="description"]', ["name", "description"], desc);
  upsertMeta('meta[property="og:title"]', ["property", "og:title"], title);
  upsertMeta('meta[property="og:description"]', ["property", "og:description"], desc);
  upsertMeta('meta[property="og:type"]', ["property", "og:type"], "website");
  upsertMeta('meta[property="og:image"]', ["property", "og:image"], image);
  upsertMeta('meta[property="og:url"]', ["property", "og:url"], location.href);
}

 function initQuiz(){
   const TEST = window.TEST;
   if (!TEST) {
     document.body.innerHTML = "<p style='padding:20px'>TEST 데이터가 없습니다.</p>";
     return;
   }
 
  applySeoMeta(TEST);

  function readStats(){
    try {
      const raw = localStorage.getItem(`quizStats:${TEST.slug}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return { starts: parsed?.starts || 0, completions: parsed?.completions || 0 };
    } catch (e) {
      return { starts: 0, completions: 0 };
    }
  }

  function saveStats(stats){
    localStorage.setItem(`quizStats:${TEST.slug}`, JSON.stringify(stats));
  }

  function updateStats(type){
    const stats = readStats();
    if (type === "start") stats.starts += 1;
    if (type === "completion") stats.completions += 1;
    saveStats(stats);

    const completionRate = stats.starts ? Math.round((stats.completions / stats.starts) * 100) : 0;
    track("quiz_completion_stats", {
      test: TEST.slug,
      starts: stats.starts,
      completions: stats.completions,
      completionRate
    });
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
    answers: [],
    runCounted: false,
    completedCounted: false
   };
 
 function setPill(text){
   if (!text) {
     $("pill").style.display = "none";
     return;
   }
   $("pill").style.display = "inline-block";
   $("pill").textContent = text;
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
@@ -154,83 +216,101 @@ function setPill(text){
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
 
    if (!fromParam && !state.completedCounted) {
      updateStats("completion");
      state.completedCounted = true;
    }

     switchScreen("result");
     track("quiz_result", { test: TEST.slug, resultId, fromParam });
   }
 
   function reset(){
     state.idx = 0;
     state.scores = Object.fromEntries(TEST.types.map(t=>[t,0]));
     state.answers = [];
    state.completedCounted = false;

    if (!state.runCounted) {
      updateStats("start");
      state.runCounted = true;
    }

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
  $("btnStart") && ($("btnStart").onclick = () => {
    state.runCounted = false;
    reset();
  });
  $("btnAgain") && ($("btnAgain").onclick = () => {
    state.runCounted = false;
    reset();
  });
 
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

