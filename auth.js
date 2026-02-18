(function () {
  const USERS_KEY = "siteUsersV1";
  const SESSION_KEY = "siteSessionV1";

  function safeParse(raw, fallback) {
    try {
      return JSON.parse(raw || "");
    } catch (e) {
      return fallback;
    }
  }

  function hashPassword(password) {
    try {
      return btoa(unescape(encodeURIComponent(String(password || ""))));
    } catch (e) {
      return String(password || "");
    }
  }

  function getUsers() {
    const users = safeParse(localStorage.getItem(USERS_KEY), []);
    return Array.isArray(users) ? users : [];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users || []));
  }

  function getCurrentUser() {
    const session = safeParse(localStorage.getItem(SESSION_KEY), null);
    if (!session || !session.id) return null;
    const users = getUsers();
    return users.find((u) => u.id === session.id) || null;
  }

  function setSession(user) {
    if (!user || !user.id) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, email: user.email, name: user.name || "" }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function register(email, password, name) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const pwd = String(password || "");
    if (!normalizedEmail) throw new Error("이메일을 입력해주세요.");
    if (pwd.length < 6) throw new Error("비밀번호는 6자 이상이어야 합니다.");

    const users = getUsers();
    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error("이미 가입된 이메일입니다.");
    }

    const user = {
      id: "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
      email: normalizedEmail,
      passwordHash: hashPassword(pwd),
      name: String(name || "").trim(),
      createdAt: Date.now()
    };
    users.push(user);
    saveUsers(users);
    setSession(user);
    return user;
  }

  function login(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const pwdHash = hashPassword(password);
    const users = getUsers();
    const user = users.find((u) => u.email === normalizedEmail && u.passwordHash === pwdHash);
    if (!user) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    setSession(user);
    return user;
  }

  function logout() {
    clearSession();
  }

  window.Auth = {
    getCurrentUser,
    register,
    login,
    logout
  };
})();
