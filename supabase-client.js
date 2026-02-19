(function () {
  let client = null;

  function isEnabled() {
    return !!(window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
  }

  function getClient() {
    if (!isEnabled()) return null;
    if (!client) {
      client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return client;
  }

  async function getCurrentUser() {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  }

  async function signUpWithEmail(email, password) {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const { data, error } = await c.auth.signUp({ email, password });
    if (error) throw error;
    return data?.user || null;
  }

  async function signInWithEmail(email, password) {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data?.user || null;
  }

  async function signInWithGoogle() {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const { error } = await c.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin + "/create-test.html" }
    });
    if (error) {
      const msg = String(error.message || "");
      if (msg.toLowerCase().includes("provider is not enabled")) {
        throw new Error("Supabase에서 Google Provider가 비활성화되어 있습니다. Authentication > Providers > Google을 활성화해주세요.");
      }
      throw error;
    }
  }

  async function signOut() {
    const c = getClient();
    if (!c) return;
    await c.auth.signOut();
  }

  async function getCredits(userId) {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c
      .from("generation_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return Number(data?.credits || 0);
  }

  async function getReportCredits(userId) {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c
      .from("generation_credits")
      .select("report_credits")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return Number(data?.report_credits || 0);
  }

  async function setCredits(userId, credits) {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const { error } = await c.from("generation_credits").upsert(
      { user_id: userId, credits: Math.max(0, Number(credits || 0)), updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  }

  async function setReportCredits(userId, reportCredits) {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const { error } = await c.from("generation_credits").upsert(
      { user_id: userId, report_credits: Math.max(0, Number(reportCredits || 0)), updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  }

  async function addCredits(userId, amount) {
    const current = await getCredits(userId);
    const next = Number(current || 0) + Number(amount || 0);
    await setCredits(userId, next);
    return next;
  }

  async function addReportCredits(userId, amount) {
    const current = await getReportCredits(userId);
    const next = Number(current || 0) + Number(amount || 0);
    await setReportCredits(userId, next);
    return next;
  }

  async function decrementCredit(userId) {
    const current = await getCredits(userId);
    if (Number(current || 0) <= 0) throw new Error("생성권이 부족합니다.");
    const next = Number(current) - 1;
    await setCredits(userId, next);
    return next;
  }

  async function decrementReportCredit(userId, amount) {
    const need = Math.max(0, Number(amount || 1));
    const current = await getReportCredits(userId);
    if (Number(current || 0) < need) throw new Error("리포트 이용권이 부족합니다.");
    const next = Number(current) - need;
    await setReportCredits(userId, next);
    return next;
  }

  async function listGeneratedTests(userId) {
    const c = getClient();
    if (!c) return [];
    const { data, error } = await c
      .from("generated_tests")
      .select("id,user_id,test_json,paid,report_downloads_remaining,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      ownerId: r.user_id,
      test: r.test_json,
      paid: !!r.paid,
      reportDownloadsRemaining: Number(r.report_downloads_remaining || 0),
      createdAt: r.created_at
    }));
  }

  async function saveGeneratedTest(userId, testObj, reportDownloads) {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const payload = {
      user_id: userId,
      test_json: testObj,
      paid: true,
      report_downloads_remaining: Math.max(0, Number(reportDownloads ?? 0))
    };
    const { data, error } = await c.from("generated_tests").insert(payload).select().single();
    if (error) throw error;
    return {
      id: data.id,
      ownerId: data.user_id,
      test: data.test_json,
      paid: !!data.paid,
      reportDownloadsRemaining: Number(data.report_downloads_remaining || 0),
      createdAt: data.created_at
    };
  }

  async function getGeneratedTest(id, userId) {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c
      .from("generated_tests")
      .select("id,user_id,test_json,paid,report_downloads_remaining,created_at")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      ownerId: data.user_id,
      test: data.test_json,
      paid: !!data.paid,
      reportDownloadsRemaining: Number(data.report_downloads_remaining || 0),
      createdAt: data.created_at
    };
  }

  async function decrementGeneratedReport(id, userId) {
    const c = getClient();
    if (!c) throw new Error("Supabase 설정이 필요합니다.");
    const current = await getGeneratedTest(id, userId);
    if (!current) throw new Error("생성 테스트를 찾을 수 없습니다.");
    if (current.reportDownloadsRemaining <= 0) throw new Error("다운로드 가능 횟수를 모두 사용했습니다.");
    const next = current.reportDownloadsRemaining - 1;
    const { error } = await c
      .from("generated_tests")
      .update({ report_downloads_remaining: next, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    current.reportDownloadsRemaining = next;
    return current;
  }

  window.Supa = {
    isEnabled,
    getClient,
    getCurrentUser,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    getCredits,
    getReportCredits,
    setCredits,
    setReportCredits,
    addCredits,
    addReportCredits,
    decrementCredit,
    decrementReportCredit,
    listGeneratedTests,
    saveGeneratedTest,
    getGeneratedTest,
    decrementGeneratedReport
  };
})();
