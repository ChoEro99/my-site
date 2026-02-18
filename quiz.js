// quiz.js (FINAL) - Kakao share + shareUrl + absolute OG image + other tests
const $ = (id) => document.getElementById(id);

const ENABLE_PREMIUM_REPORT_UPSELL = false; // 임시: 유료 리포트 UI 숨김

// showToast and track are now in utils.js

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

function getReportPrice(TEST, resultId, plan){
  const planPricing = TEST.reportPricing?.[resultId]?.[plan] || TEST.reportPricing?.default?.[plan];
  if (planPricing) return planPricing;
  return plan === "starter" ? "900원" : "1,900원";
}

function buildReportCheckoutUrl(TEST, resultId, plan){
  const checkoutBase = TEST.reportCheckoutUrl || window.REPORT_CHECKOUT_URL || "/pay/report.html";
  const url = new URL(checkoutBase, location.origin);
  url.searchParams.set("test", TEST.slug);
  url.searchParams.set("result", resultId);
  url.searchParams.set("plan", plan);
  return url.toString();
}

function saveReportDraft(TEST, resultId, plan, result){
  const key = `reportDraft:${TEST.slug}:${resultId}:${plan}`;
  const payload = {
    slug: TEST.slug,
    testTitle: TEST.ogTitle || document.title,
    resultId,
    resultTitle: result?.title || "결과",
    plan,
    createdAt: Date.now(),
    result: {
      emoji: result?.emoji || "",
      desc: result?.desc || "",
      tags: result?.tags || [],
      strengths: result?.strengths || [],
      pitfalls: result?.pitfalls || [],
      routine: result?.routine || []
    }
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {}
}

function buildFullReportExampleUrl(TEST, resultId){
  const url = new URL('/report/example-full.html', location.origin);
  url.searchParams.set('test', TEST.slug);
  url.searchParams.set('result', resultId);
  return url.toString();
}

function makePremiumReportUpsell(TEST, resultId, result){
  const starterPrice = getReportPrice(TEST, resultId, "starter");
  const fullPrice = getReportPrice(TEST, resultId, "full");
  const starterLink = buildReportCheckoutUrl(TEST, resultId, "starter");
  const fullLink = buildReportCheckoutUrl(TEST, resultId, "full");
  const fullExampleLink = buildFullReportExampleUrl(TEST, resultId);
  const resultTitle = result?.title || "결과";

  return `
  <section class="premium-upsell" aria-label="심층 보고서 안내">
    <h4>${resultTitle} PDF 심층 분석 보고서</h4>
    <p class="premium-sub">현재 결과에 맞춘 맞춤형 PDF를 결제 후 바로 확인할 수 있어요.</p>
    <div class="premium-grid">
      <article class="premium-plan">
        <p class="premium-label">Starter 보고서</p>
        <ul>
          <li>✔︎ 기본 심층 분석</li>
          <li>✔︎ 예시 사례 포함</li>
        </ul>
        <p class="premium-price">💵 ${starterPrice}</p>
        <a class="go premium-cta" href="${starterLink}" data-plan="starter" data-result-id="${resultId}">Starter PDF 결제하기</a>
      </article>
      <article class="premium-plan premium-plan-full">
        <p class="premium-label">Full 보고서 (2회권)</p>
        <ul>
          <li>✔︎ 선호 유형 해석</li>
          <li>✔︎ 개선 포인트</li>
          <li>✔︎ AI 심층 리포트 2회</li>
        </ul>
        <p class="premium-price">💵 ${fullPrice}</p>
        <a class="go premium-cta" href="${fullLink}" data-plan="full" data-result-id="${resultId}">Full 2회권 결제하기</a>
        <a class="premium-example-link" href="${fullExampleLink}" target="_blank" rel="noopener">리포트 예시 보기</a>
      </article>
    </div>
  </section>`;
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
  upsertMeta('meta[name="twitter:card"]', ["name", "twitter:card"], "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', ["name", "twitter:title"], title);
  upsertMeta('meta[name="twitter:description"]', ["name", "twitter:description"], desc);
  upsertMeta('meta[name="twitter:image"]', ["name", "twitter:image"], image);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', location.origin + location.pathname);

  const oldSchema = document.getElementById('quizSchema');
  if (oldSchema) oldSchema.remove();
  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.id = 'quizSchema';
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: TEST.ogTitle || document.title,
    description: desc,
    inLanguage: 'ko-KR',
    educationalLevel: 'beginner',
    about: (TEST.badge || TEST.slug || '심리 테스트')
  });
  document.head.appendChild(schema);
}

function initQuiz(){
  const TEST = window.TEST;
  if (!TEST) {
    document.body.innerHTML = "<p style='padding:20px'>TEST 데이터가 없습니다.</p>";
    return;
  }

    applySeoMeta(TEST);

  // Use shared utility functions from utils.js
  function readStats(){
    return getQuizStats(TEST.slug);
  }

  function saveStats(stats){
    saveQuizStats(TEST.slug, stats);
  }

  function updateStats(type){
    const stats = readStats();
    if (type === "start") stats.starts += 1;
    if (type === "completion") stats.completions += 1;
    saveStats(stats);

    const completionRate = stats.starts ? Math.round((stats.completions / stats.starts) * 100) : 0;
    track("quiz_completion_stats", {
      test_slug: TEST.slug,
      starts: stats.starts,
      completions: stats.completions,
      completion_rate: completionRate,
      page_type: "quiz"
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
  const pill = $("pill");
  if (!pill) return;
  pill.style.display = "none";
  pill.textContent = "";
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
    if (meta) meta.textContent = `${state.idx+1}/${total}`;
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
    const descEl = $("rDesc");
    descEl.textContent  = r.desc  || "";

    let aiHint = $("rAiHint");
    if (!aiHint && descEl && descEl.parentNode) {
      aiHint = document.createElement("p");
      aiHint.id = "rAiHint";
      aiHint.className = "note";
      descEl.parentNode.insertBefore(aiHint, descEl.nextSibling);
    }
    if (aiHint) {
      aiHint.textContent = "아래 결과와 루틴은 AI가 추천한 맞춤 제안이에요.";
    }

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

    let premiumUpsell = $("premiumUpsell");
    if (!premiumUpsell) {
      premiumUpsell = document.createElement("div");
      premiumUpsell.id = "premiumUpsell";
      const routineCard = s3 && s3.closest(".card.mini");
      if (routineCard && routineCard.parentNode) {
        routineCard.parentNode.insertBefore(premiumUpsell, routineCard.nextSibling);
      }
    }
    if (premiumUpsell) {
      if (!ENABLE_PREMIUM_REPORT_UPSELL) {
        premiumUpsell.innerHTML = "";
      } else {
        premiumUpsell.innerHTML = makePremiumReportUpsell(TEST, resultId, r);
        premiumUpsell.querySelectorAll(".premium-cta").forEach((link) => {
          link.onclick = (event) => {
            const plan = link.dataset.plan || "starter";
            saveReportDraft(TEST, resultId, plan, r);
            const checkoutUrl = new URL(link.href);
            checkoutUrl.searchParams.set("draft", `${TEST.slug}:${resultId}:${plan}`);
            link.href = checkoutUrl.toString();
            track("report_checkout_click", {
              test_slug: TEST.slug,
              result_id: resultId,
              plan,
              href: link.href,
              page_type: "result"
            });
          };
        });
      }
    }

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

        track("share_kakao", { test_slug: TEST.slug, result_id: resultId, page_type: "result" });
      };
    }
    
    if (!fromParam && !state.completedCounted) {
      updateStats("completion");
      state.completedCounted = true;
    }

    switchScreen("result");
    track("quiz_result", { test_slug: TEST.slug, result_id: resultId, from_param: fromParam, page_type: "result" });
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
    track("quiz_start", { test_slug: TEST.slug, page_type: "quiz" });
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
    track("quiz_back", { test_slug: TEST.slug, question_index: state.idx, page_type: "quiz" });
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
    track("share_copy", { test_slug: TEST.slug, page_type: "result" });
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

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="http"]');
    if (!link) return;
    if (link.hostname === location.hostname) return;
    track('outbound_click', { test_slug: TEST.slug, href: link.href, page_type: 'quiz' });
  });

  // Initialize theme toggle button
  const themeToggle = $("themeToggle");
  if (themeToggle) {
    const isLight = document.documentElement.classList.contains("light-theme");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
    themeToggle.addEventListener("click", toggleTheme);
  }

  setPill("");
  switchScreen("start");
}
