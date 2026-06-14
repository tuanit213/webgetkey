const STORAGE_KEYS = {
  session: "wgk_session",
  localGames: "wgk_local_games",
  localAccounts: "wgk_local_accounts",
  legacyCleared: "wgk_legacy_key_store_cleared_v5",
};

const LEGACY_KEY_STORE_KEYS = ["wgk_keys", "wgk_seed_version"];

const seedUsers = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user", password: "user123", role: "user" },
];

const gameIcons = {
  lienQuan: "https://play-lh.googleusercontent.com/DduNvUMc6rXuH1v9ErjwBcLQ5VUxHNnRK2EVL9odjJ7vGubZZh0_M0VfsBjK-4TsQMg%3Dw240-h480",
  pubg: "https://play-lh.googleusercontent.com/zCSGnBtZk0Lmp1BAbyaZfLktDzHmC6oke67qzz3G1lBegAF2asyt5KzXOJ2PVdHDYkU%3Dw240-h480",
  freeFire: "https://play-lh.googleusercontent.com/1wE91ae_1YIJtIjQ1YJz5RhAajxEpF1TfrXGg7tcrKl90MOnF7XdFj71pw_MSQbyhM5PYz-eRdeBFQBzSGrV%3Dw240-h480",
  freeFireMax: "https://play-lh.googleusercontent.com/EJ83sg58Oo2gAjMHFxFVLM6Z53kuH4_R0M7Yq7gts5fWSIlFchUlmskG1vJKMoncmfOxBXcgJyIaO-nak6sO-MM%3Dw240-h480",
  fcOnline: "https://play-lh.googleusercontent.com/KjEM7U-WBSbhBHGsSPlylm5c-Mv2KkguCm2Om2QNgJG-TTeyEGYk3BRf3Yh3iXp4v5s%3Dw240-h480",
  codm: "https://play-lh.googleusercontent.com/qbOiSlyprOTjbV2_VrOrlhsxeSmxuNW1Ug0-BQglEdEh6hfZOUxg2FcxUCW9AXMwCxybgEBtyVAJY0ZUaM87%3Dw240-h480",
};

const seedGames = [
  gameSeed("local-lien-quan", "lien-quan-mobile", "Liên Quân Mobile", gameIcons.lienQuan, "iOS", "3 giờ", "15K", "iOS | FREE | 3 giờ", 1),
  gameSeed("local-pubg", "pubg-mobile", "PUBG Mobile", gameIcons.pubg, "iOS", "6 giờ", "8K", "iOS | FREE | 6 giờ", 2),
  gameSeed("local-free-fire", "free-fire", "Free Fire", gameIcons.freeFire, "iOS", "3 giờ", "186", "iOS | FREE | Mới cập nhật", 3),
  gameSeed("local-free-fire-max", "free-fire-max", "Free Fire MAX", gameIcons.freeFireMax, "Android", "2 giờ", "2K", "Android | FREE", 4),
  gameSeed("local-fc-online", "fc-online-m", "FC Online M", gameIcons.fcOnline, "iOS", "3 giờ", "4K", "iOS | FREE | 3 giờ", 5),
  gameSeed("local-codm", "codm-garena", "CODM Garena", gameIcons.codm, "Android", "Bảo trì", "1K", "Android | Đang bảo trì", 6),
];

const appState = {
  games: [],
  accounts: [],
  session: null,
  supabase: createSupabaseClient(),
};

function gameSeed(id, slug, name, image, platform, expires, downloads, note, sortOrder) {
  return {
    id,
    slug,
    name,
    image,
    platform,
    price: "FREE",
    expires,
    downloads,
    note,
    is_active: true,
    stock_count: 0,
    sort_order: sortOrder,
    keys: [],
  };
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createSupabaseClient() {
  const config = window.WGK_CONFIG || {};
  const url = String(config.supabaseUrl || "").trim();
  const anonKey = String(config.supabaseAnonKey || "").trim();
  if (!url || !anonKey || !window.supabase) return null;
  return window.supabase.createClient(url, anonKey);
}

function isDatabaseEnabled() {
  return Boolean(appState.supabase);
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clearLegacyKeyStore() {
  if (localStorage.getItem(STORAGE_KEYS.legacyCleared) === "1") return;
  LEGACY_KEY_STORE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(STORAGE_KEYS.localGames);
  localStorage.setItem(STORAGE_KEYS.legacyCleared, "1");
}

function getLocalGames() {
  const stored = loadJson(STORAGE_KEYS.localGames, null);
  if (stored) return stored;
  saveJson(STORAGE_KEYS.localGames, seedGames);
  return seedGames;
}

function saveLocalGames(games) {
  saveJson(STORAGE_KEYS.localGames, games);
}

function getLocalAccounts() {
  return loadJson(STORAGE_KEYS.localAccounts, []);
}

function saveLocalAccounts(accounts) {
  saveJson(STORAGE_KEYS.localAccounts, accounts);
}

function setLocalSession(user) {
  saveJson(STORAGE_KEYS.session, { username: user.username, role: user.role, source: "local" });
}

function getLocalSession() {
  return loadJson(STORAGE_KEYS.session, null);
}

function clearLocalSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeLoginEmail(value) {
  const input = String(value || "").trim();
  if (input === "admin") return "admin@example.com";
  if (input === "user") return "user@example.com";
  return input;
}

function redirectByRole(user) {
  window.location.href = user.role === "admin" ? "admin.html" : "user.html";
}

async function getAppSession() {
  if (!isDatabaseEnabled()) return getLocalSession();

  const { data: sessionData } = await appState.supabase.auth.getSession();
  const authSession = sessionData.session;
  if (!authSession) return null;

  const { data: profile, error } = await appState.supabase
    .from("profiles")
    .select("username, role")
    .eq("id", authSession.user.id)
    .single();

  if (error || !profile) {
    console.error("Cannot load profile", error);
    return { username: authSession.user.email || "user", role: "user", source: "supabase" };
  }

  return { username: profile.username, role: profile.role, source: "supabase" };
}

async function requireLogin() {
  const session = await getAppSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  appState.session = session;
  return session;
}

async function requireAdmin() {
  const session = await requireLogin();
  if (!session) return null;
  if (session.role !== "admin") {
    window.location.href = "user.html";
    return null;
  }
  return session;
}

async function fetchGames() {
  if (!isDatabaseEnabled()) {
    return getLocalGames().map((item) => ({ ...item, stock_count: Array.isArray(item.keys) ? item.keys.length : 0 }));
  }

  const { data, error } = await appState.supabase.rpc("wgk_list_games");
  if (error) {
    console.error("Cannot load games", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    image: item.image_url,
    platform: item.platform,
    price: item.price,
    expires: item.expires_label,
    downloads: item.downloads,
    note: item.note,
    is_active: item.is_active,
    stock_count: Number(item.stock_count || 0),
  }));
}

async function fetchAccounts() {
  if (!isDatabaseEnabled()) return getLocalAccounts();

  const { data, error } = await appState.supabase
    .from("accounts")
    .select("id, service, username, password, note")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Cannot load accounts", error);
    return [];
  }
  return data;
}

async function loadDashboard(isAdmin) {
  appState.games = await fetchGames();
  appState.accounts = await fetchAccounts();
  renderKeys(isAdmin);
  renderAccounts(isAdmin);
  populateGameKeySelect();
}

function getStockCount(item) {
  return Number(item.stock_count || 0);
}

async function claimNextKey(gameId) {
  if (!isDatabaseEnabled()) {
    const games = getLocalGames();
    const game = games.find((item) => item.id === gameId);
    if (!game || !Array.isArray(game.keys) || !game.keys.length) return null;
    const nextKey = game.keys.shift();
    game.stock_count = game.keys.length;
    saveLocalGames(games);
    return nextKey;
  }

  const { data, error } = await appState.supabase.rpc("wgk_claim_next_key", { p_game_id: gameId });
  if (error) throw error;
  return data || null;
}

function setupHeader(session) {
  const currentUserLabel = document.querySelector("#currentUserLabel");
  const logoutBtn = document.querySelector("#logoutBtn");

  if (currentUserLabel) currentUserLabel.textContent = `${session.username} (${session.role})`;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (isDatabaseEnabled()) await appState.supabase.auth.signOut();
      clearLocalSession();
      window.location.href = "login.html";
    });
  }
}

function setupKeyModal() {
  const modal = document.querySelector("#keyModal");
  if (!modal) return;

  const title = document.querySelector("#keyModalTitle");
  const note = document.querySelector("#keyModalNote");
  const result = document.querySelector("#keyResult");
  const revealBtn = document.querySelector("#revealKeyBtn");
  const copyBtn = document.querySelector("#copyKeyBtn");
  const closeBtn = document.querySelector("#closeKeyModal");
  const copyMessage = document.querySelector("#copyMessage");
  let selectedGameId = null;
  let revealedKey = "";

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();

    try {
      if (!document.execCommand("copy")) throw new Error("Copy command failed");
    } finally {
      textarea.remove();
    }
  }

  function resetModal(item) {
    selectedGameId = item.id;
    revealedKey = "";
    title.textContent = item.name;
    note.textContent = `${item.note || "Key sẵn sàng để lấy."} - Còn ${getStockCount(item)} key`;
    result.textContent = "Bấm Get key để hiện key.";
    result.classList.remove("visible");
    revealBtn.hidden = false;
    copyBtn.hidden = true;
    copyMessage.textContent = "";
  }

  function closeModal() {
    modal.hidden = true;
    selectedGameId = null;
    revealedKey = "";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const gameId = target.dataset.openKey;
    if (!gameId) return;

    const item = appState.games.find((game) => game.id === gameId);
    if (!item || !item.is_active || getStockCount(item) === 0) return;

    resetModal(item);
    modal.hidden = false;
  });

  revealBtn.addEventListener("click", async () => {
    if (!selectedGameId) return;
    revealBtn.disabled = true;
    try {
      const nextKey = await claimNextKey(selectedGameId);
      if (!nextKey) {
        result.textContent = "Game này đã hết key.";
        result.classList.remove("visible");
        revealBtn.hidden = true;
        copyBtn.hidden = true;
        await loadDashboard(document.body.dataset.page === "admin");
        return;
      }

      revealedKey = nextKey;
      result.textContent = nextKey;
      result.classList.add("visible");
      revealBtn.hidden = true;
      copyBtn.hidden = false;
      copyMessage.textContent = "";
      await loadDashboard(document.body.dataset.page === "admin");
    } catch (error) {
      console.error("Cannot claim key", error);
      result.textContent = "Không lấy được key. Hãy thử lại.";
    } finally {
      revealBtn.disabled = false;
    }
  });

  copyBtn.addEventListener("click", async () => {
    if (!revealedKey) return;
    try {
      await copyTextToClipboard(revealedKey);
      copyMessage.textContent = "Đã copy key.";
    } catch {
      copyMessage.textContent = "Không copy tự động được, hãy bôi đen key và copy thủ công.";
    }
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}

function renderKeys(isAdmin = false) {
  const container = document.querySelector("#keyList");
  if (!container) return;

  if (!appState.games.length) {
    container.innerHTML = '<div class="empty-state">Chưa có game nào.</div>';
    return;
  }

  container.innerHTML = appState.games
    .map((item) => {
      const stockCount = getStockCount(item);
      const isDisabled = !item.is_active || stockCount === 0;
      const statusText = stockCount > 0 ? `còn ${stockCount} key` : "hết key";
      const actions = isAdmin
        ? `<div class="card-actions">
            <button class="button small primary" type="button" data-open-key="${item.id}" ${isDisabled ? "disabled" : ""}>Nhận key</button>
            <button class="button small ghost" type="button" data-edit-key="${item.id}">Sửa</button>
            <button class="button small danger" type="button" data-delete-key="${item.id}">Xóa</button>
          </div>`
        : `<button class="button small primary" type="button" data-open-key="${item.id}" ${isDisabled ? "disabled" : ""}>Nhận key</button>`;

      return `<article class="product-card">
        <div class="product-media">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
          <span class="hot-badge">HOT</span>
          <span class="download-badge">${escapeHtml(item.downloads)}</span>
        </div>
        <div class="product-body">
          <img class="product-icon" src="${escapeHtml(item.image)}" alt="" />
          <div class="product-info">
            <h3>${escapeHtml(item.name)}</h3>
            <div class="tag-row">
              <span>${escapeHtml(item.platform)}</span>
              <span>${escapeHtml(item.price)}</span>
              <span>${escapeHtml(item.expires)}</span>
            </div>
            <p><code>${escapeHtml(stockCount)} key trong kho</code></p>
          </div>
          <span class="status ${isDisabled ? "disabled" : "active"}">${escapeHtml(statusText)}</span>
          ${actions}
        </div>
      </article>`;
    })
    .join("");
}

function renderAccounts(isAdmin = false) {
  const container = document.querySelector("#accountList");
  if (!container) return;

  if (!appState.accounts.length) {
    container.innerHTML = '<div class="empty-state">Chưa có acc nào.</div>';
    return;
  }

  const actionHead = isAdmin ? "<th>Thao tac</th>" : "";
  const rows = appState.accounts
    .map((item) => {
      const actions = isAdmin
        ? `<td><div class="row-actions">
            <button class="button small ghost" type="button" data-edit-account="${item.id}">Sửa</button>
            <button class="button small danger" type="button" data-delete-account="${item.id}">Xóa</button>
          </div></td>`
        : "";

      return `<tr>
        <td>${escapeHtml(item.service)}</td>
        <td>${escapeHtml(item.username)}</td>
        <td><code>${escapeHtml(item.password)}</code></td>
        <td>${escapeHtml(item.note)}</td>
        ${actions}
      </tr>`;
    })
    .join("");

  container.innerHTML = `<table>
    <thead>
      <tr>
        <th>Dịch vụ</th>
        <th>Username</th>
        <th>Password</th>
        <th>Ghi chú</th>
        ${actionHead}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

async function setupLoginPage() {
  const session = await getAppSession();
  if (session) {
    redirectByRole(session);
    return;
  }

  const form = document.querySelector("#loginForm");
  const message = document.querySelector("#loginMessage");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const formData = new FormData(form);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!isDatabaseEnabled()) {
      const user = seedUsers.find((item) => item.username === username && item.password === password);
      if (!user) {
        message.textContent = "Tài khoản hoặc mật khẩu không đúng.";
        return;
      }
      setLocalSession(user);
      redirectByRole(user);
      return;
    }

    const email = normalizeLoginEmail(username);
    const { error } = await appState.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      message.textContent = "Đăng nhập Supabase thất bại. Kiểm tra email/mật khẩu.";
      return;
    }

    const user = await getAppSession();
    if (!user) {
      message.textContent = "Đăng nhập thành công nhưng tài khoản chưa có quyền truy cập.";
      return;
    }
    redirectByRole(user);
  });
}

async function setupUserPage() {
  const session = await requireLogin();
  if (!session) return;
  setupHeader(session);
  setupKeyModal();
  await loadDashboard(false);
}

async function setupAdminPage() {
  const session = await requireAdmin();
  if (!session) return;
  setupHeader(session);
  setupKeyModal();
  setupAdminForms();
  setupAdminActions();
  await loadDashboard(true);
}

function setupAdminForms() {
  const keyForm = document.querySelector("#keyForm");
  const accountForm = document.querySelector("#accountForm");
  const keyFormMessage = document.querySelector("#keyFormMessage");
  const clearGameKeysBtn = document.querySelector("#clearGameKeysBtn");

  keyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(keyForm);
    const gameId = String(data.get("gameId") ?? "");
    const bulkKeys = String(data.get("bulkKeys") ?? "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!gameId || !bulkKeys.length) {
      keyFormMessage.textContent = "Hãy chọn game và nhập ít nhất 1 key.";
      return;
    }

    const uniqueKeys = bulkKeys.filter((item, index, list) => list.indexOf(item) === index);

    try {
      if (isDatabaseEnabled()) {
        const rows = uniqueKeys.map((keyValue) => ({ game_id: gameId, key_value: keyValue }));
        const { error } = await appState.supabase
          .from("key_pool")
          .upsert(rows, { onConflict: "game_id,key_value", ignoreDuplicates: true });
        if (error) throw error;
      } else {
        const games = getLocalGames();
        const game = games.find((item) => item.id === gameId);
        if (!game) throw new Error("Game not found");
        const currentStock = Array.isArray(game.keys) ? game.keys : [];
        const existing = new Set(currentStock);
        game.keys = [...uniqueKeys.filter((item) => !existing.has(item)), ...currentStock];
        game.stock_count = game.keys.length;
        saveLocalGames(games);
      }

      keyForm.elements.bulkKeys.value = "";
      keyFormMessage.textContent = `Đã thêm ${uniqueKeys.length} key vào kho.`;
      await loadDashboard(true);
      populateGameKeySelect(gameId);
    } catch (error) {
      console.error("Cannot add keys", error);
      keyFormMessage.textContent = "Không thêm được key. Kiểm tra quyền admin/database.";
    }
  });

  clearGameKeysBtn.addEventListener("click", async () => {
    const gameId = keyForm.elements.gameId.value;
    const game = appState.games.find((item) => item.id === gameId);
    if (!game) return;
    if (!confirm(`Xóa tất cả key của ${game.name}?`)) return;

    try {
      if (isDatabaseEnabled()) {
        const { error } = await appState.supabase.from("key_pool").delete().eq("game_id", gameId);
        if (error) throw error;
      } else {
        const games = getLocalGames();
        const localGame = games.find((item) => item.id === gameId);
        localGame.keys = [];
        localGame.stock_count = 0;
        saveLocalGames(games);
      }

      keyFormMessage.textContent = `Đã xóa kho key của ${game.name}.`;
      await loadDashboard(true);
      populateGameKeySelect(gameId);
    } catch (error) {
      console.error("Cannot clear keys", error);
      keyFormMessage.textContent = "Không xóa được kho key.";
    }
  });

  accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(accountForm);
    const payload = {
      service: String(data.get("service") ?? "").trim(),
      username: String(data.get("username") ?? "").trim(),
      password: String(data.get("password") ?? "").trim(),
      note: String(data.get("note") ?? "").trim(),
    };

    try {
      if (isDatabaseEnabled()) {
        const { error } = await appState.supabase.from("accounts").insert(payload);
        if (error) throw error;
      } else {
        const accounts = getLocalAccounts();
        accounts.push({ id: createId(), ...payload });
        saveLocalAccounts(accounts);
      }
      accountForm.reset();
      await loadDashboard(true);
    } catch (error) {
      console.error("Cannot save account", error);
      alert("Không lưu được acc. Kiểm tra quyền admin/database.");
    }
  });
}

function populateGameKeySelect(selectedId = "") {
  const select = document.querySelector("#gameKeySelect");
  if (!select) return;

  select.innerHTML = appState.games
    .map((item) => {
      const isSelected = selectedId === item.id ? "selected" : "";
      return `<option value="${escapeHtml(item.id)}" ${isSelected}>${escapeHtml(item.name)} - còn ${getStockCount(item)} key</option>`;
    })
    .join("");
}

function setupAdminActions() {
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const keyIdToDelete = target.dataset.deleteKey;
    const keyIdToEdit = target.dataset.editKey;
    const accountIdToDelete = target.dataset.deleteAccount;
    const accountIdToEdit = target.dataset.editAccount;

    if (keyIdToDelete) await deleteGame(keyIdToDelete);
    if (keyIdToEdit) await editGame(keyIdToEdit);
    if (accountIdToDelete) await deleteAccount(accountIdToDelete);
    if (accountIdToEdit) await editAccount(accountIdToEdit);
  });
}

async function deleteGame(id) {
  const game = appState.games.find((item) => item.id === id);
  if (!game || !confirm(`Xóa game ${game.name}?`)) return;

  try {
    if (isDatabaseEnabled()) {
      const { error } = await appState.supabase.from("games").delete().eq("id", id);
      if (error) throw error;
    } else {
      saveLocalGames(getLocalGames().filter((item) => item.id !== id));
    }
    await loadDashboard(true);
  } catch (error) {
    console.error("Cannot delete game", error);
    alert("Không xóa được game.");
  }
}

async function editGame(id) {
  const item = appState.games.find((game) => game.id === id);
  if (!item) return;

  const name = prompt("Tên game", item.name);
  if (name === null) return;
  const note = prompt("Ghi chú", item.note);
  if (note === null) return;
  const activeInput = prompt("Trạng thái: active hoặc disabled", item.is_active ? "active" : "disabled");
  if (activeInput === null) return;
  const isActive = activeInput.trim() !== "disabled";

  try {
    if (isDatabaseEnabled()) {
      const { error } = await appState.supabase
        .from("games")
        .update({ name: name.trim(), note: note.trim(), is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    } else {
      const games = getLocalGames();
      const game = games.find((localItem) => localItem.id === id);
      game.name = name.trim();
      game.note = note.trim();
      game.is_active = isActive;
      saveLocalGames(games);
    }
    await loadDashboard(true);
  } catch (error) {
    console.error("Cannot update game", error);
    alert("Không sửa được game.");
  }
}

async function deleteAccount(id) {
  if (!confirm("Xóa acc này?")) return;
  try {
    if (isDatabaseEnabled()) {
      const { error } = await appState.supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    } else {
      saveLocalAccounts(getLocalAccounts().filter((item) => item.id !== id));
    }
    await loadDashboard(true);
  } catch (error) {
    console.error("Cannot delete account", error);
    alert("Không xóa được acc.");
  }
}

async function editAccount(id) {
  const item = appState.accounts.find((account) => account.id === id);
  if (!item) return;

  const service = prompt("Dịch vụ", item.service);
  if (service === null) return;
  const username = prompt("Username", item.username);
  if (username === null) return;
  const password = prompt("Password", item.password);
  if (password === null) return;
  const note = prompt("Ghi chú", item.note);
  if (note === null) return;

  const payload = {
    service: service.trim(),
    username: username.trim(),
    password: password.trim(),
    note: note.trim(),
  };

  try {
    if (isDatabaseEnabled()) {
      const { error } = await appState.supabase.from("accounts").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const accounts = getLocalAccounts();
      const account = accounts.find((localItem) => localItem.id === id);
      Object.assign(account, payload);
      saveLocalAccounts(accounts);
    }
    await loadDashboard(true);
  } catch (error) {
    console.error("Cannot update account", error);
    alert("Không sửa được acc.");
  }
}

async function setupHomePage() {
  const session = await getAppSession();
  window.location.href = session ? (session.role === "admin" ? "admin.html" : "user.html") : "login.html";
}

async function initPage() {
  clearLegacyKeyStore();
  const page = document.body.dataset.page;
  if (page === "home") await setupHomePage();
  if (page === "login") await setupLoginPage();
  if (page === "user") await setupUserPage();
  if (page === "admin") await setupAdminPage();
}

initPage();
