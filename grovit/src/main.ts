import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app"); 

if (!app) { 
  throw new Error("#app 요소를 찾을 수 없어요."); 
} 

type Page = 
| "home" 
| "diagnosis" 
| "market" 
| "missions" 
| "chat" 
| "analytics" 
|"history" 
| "mypage";

const menu: { id: Page; label: string; icon: string }[] = [ 
  { id: "home", label: "홈", icon: "⌂" }, 
  { id: "diagnosis", label: "진단 결과", icon: "◈" }, 
  { id: "market", label: "상권 분석", icon: "⌖" }, 
  { id: "missions", label: "성장 미션", icon: "✓" }, 
  { id: "chat", label: "AI 상담", icon: "✳" }, 
  { id: "analytics", label: "매출·고객", icon: "▥" }, 
  { id: "history", label: "진단 기록", icon: "◷" }, 
  { id: "mypage", label: "마이페이지", icon: "◎" }, 
  ];
function getPageFromPath(): Page { 
  const path = window.location.pathname.replace(/^\/+|\/+$/g, ""); 
  
  
  const pages: Page[] = [ 
    "home", 
    "diagnosis", 
    "market", 
    "missions", 
    "chat", 
    "analytics", 
    "history", 
    "mypage", 
  ]; 
  
  return pages.includes(path as Page) ? (path as Page) : "home"; 
} 
let currentPage: Page = getPageFromPath();
type UserRole = "general" | "owner"; 
let userRole = localStorage.getItem("grobit-role") as UserRole | null;
let storeName = localStorage.getItem("grobit-store") || "";
let storeType = localStorage.getItem("grobit-type") || "카페";
let storeLocation = localStorage.getItem("grobit-location") || "";
let completedMissions = JSON.parse(
  localStorage.getItem("grobit-missions") || "[]"
) as string[];
let chatMessages = [
  {
    from: "bot",
    text: "안녕하세요! 그로빗 AI 상담이에요. 가게 운영이나 마케팅에 대해 궁금한 점을 적어 주세요.",
  },
];

function go(page: Page) {
  currentPage = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function card(title: string, value: string, detail: string) {
  return `
    <article class="metric-card">
      <p class="muted">${title}</p>
      <strong>${value}</strong>
      <span>${detail}</span>
    </article>
  `;
}

function pageContent(): string {
  function roleSelection(): string {
  return `
    <section class="section">
      <span class="eyebrow">WELCOME TO GROBIT</span>
      <h2 class="page-title">그로빗을<br />어떻게 이용하시나요?</h2>
      <p class="muted">이용 목적에 맞는 서비스를 선택해 주세요.</p>

      <div class="link-list">
        <button class="link-card" data-role="general">
          <span class="menu-icon">⌖</span>
          <span>
            <strong>일반 사용자</strong>
            <small>동네 상권 지도와 주변 가게 둘러보기</small>
          </span>
          <span class="arrow">↗</span>
        </button>

        <button class="link-card" data-role="owner">
          <span class="menu-icon">▣</span>
          <span>
            <strong>자영업자</strong>
            <small>내 가게 진단과 상권 분석, 성장 미션</small>
          </span>
          <span class="arrow">↗</span>
        </button>
      </div>
    </section>
  `;
}
  switch (currentPage) {
    case "home":
      return `
        <section class="welcome">
          <span class="eyebrow">YOUR BUSINESS PARTNER</span>
          <h2>${storeName ? escapeHTML(storeName) + "의" : "우리 가게의"}<br />다음 성장을 준비해요.</h2>
          <p>데이터를 살펴보고 더 나은 내일을 계획해 보세요.</p>
          <button class="button light" data-page="diagnosis">성장 진단 시작하기 ↗</button>
          <div class="welcome-mark">g.</div>
        </section>

        <section class="section">
          <div class="section-heading">
            <div><span class="eyebrow">OVERVIEW</span><h3>우리 가게 현황</h3></div>
            <span class="pill">예시 지표</span>
          </div>
          <div class="metric-grid">
            ${card("성장 진단 점수", "72점", "예시 점수")}
            ${card("이번 달 매출", "320만원", "예시 매출")}
            ${card("방문 고객", "248명", "예시 고객 수")}
            ${card("미션 진행률", `${Math.round(completedMissions.length / 3 * 100)}%`, "3개 미션 기준")}
          </div>
          <p class="notice">※ 표시된 매출·고객·점수는 예시입니다. 실제 데이터 연결 후 교체됩니다.</p>
        </section>

        <section class="section">
          <div class="section-heading"><div><span class="eyebrow">EXPLORE</span><h3>그로빗 서비스</h3></div></div>
          <div class="link-list">
            ${menu.filter(item => item.id !== "home").map(item => `
              <button class="link-card" data-page="${item.id}">
                <span class="menu-icon">${item.icon}</span>
                <span><strong>${item.label}</strong><small>${description(item.id)}</small></span>
                <span class="arrow">↗</span>
              </button>
            `).join("")}
          </div>
        </section>
      `;

    case "diagnosis":
      return `
        <section class="section">
          <span class="eyebrow">BUSINESS CHECKUP</span>
          <h2 class="page-title">우리 가게 진단</h2>
          <p class="muted">가게 정보를 등록하고 성장 기회를 확인해 보세요.</p>
          <form id="store-form" class="form-card">
            <label for="store-name">가게 이름</label>
            <input id="store-name" name="storeName" value="${escapeHTML(storeName)}" placeholder="예: 행복한 카페" required />
            <label for="store-type">업종</label>
            <select id="store-type" name="storeType">
              ${["카페", "음식점", "소매점", "미용·뷰티", "서비스업", "기타"].map(type =>
                `<option ${storeType === type ? "selected" : ""}>${type}</option>`
              ).join("")}
            </select>
            <label for="store-location">가게 위치</label>
            <input id="store-location" name="location" value="${escapeHTML(storeLocation)}" placeholder="예: 성남시 분당구" required />
            <button class="button primary" type="submit">가게 정보 저장하기</button>
          </form>
          <div class="insight-card">
            <span class="eyebrow">NEXT STEP</span>
            <h3>진단을 준비하고 있어요</h3>
            <p>정보를 저장하면 분석에 필요한 항목을 확인할 수 있어요. 현재는 실제 AI 진단이 연결되어 있지 않습니다.</p>
          </div>
        </section>
      `;

    case "market":
      return `
        <section class="section">
          <span class="eyebrow">LOCAL MARKET</span>
          <h2 class="page-title">상권 분석</h2>
          <p class="muted">우리 가게 주변의 시장 환경을 살펴보세요.</p>
          <div class="insight-card">
            <span class="big-icon">⌖</span>
            <h3>${storeLocation ? escapeHTML(storeLocation) : "가게 위치를 등록해 주세요"}</h3>
            <p>상권 분석을 시작하려면 정확한 위치와 외부 상권 데이터가 필요해요.</p>
            <button class="button primary" data-page="diagnosis">가게 위치 등록하기</button>
          </div>
          <div class="metric-grid">
            ${card("주변 경쟁 점포", "미연결", "상권 데이터 필요")}
            ${card("유동 인구", "미연결", "인구 데이터 필요")}
            ${card("고객 특성", "미연결", "고객 데이터 필요")}
            ${card("상권 추이", "미연결", "기간별 데이터 필요")}
          </div>
          <p class="notice">실제 상권 분석 결과는 외부 데이터 연결 후 제공됩니다.</p>
        </section>
      `;

    case "missions": {
      const tasks = [
        { id: "profile", title: "우리 가게 정보 정리하기", desc: "가게 이름, 업종, 위치를 등록해요." },
        { id: "customer", title: "주요 고객 생각해 보기", desc: "우리 가게를 주로 방문하는 고객을 정리해요." },
        { id: "promotion", title: "이번 주 홍보 아이디어 정하기", desc: "실천할 수 있는 작은 홍보 계획을 세워요." },
      ];
      return `
        <section class="section">
          <span class="eyebrow">GROWTH ROUTINE</span>
          <h2 class="page-title">작은 실천이<br />성장을 만들어요.</h2>
          <p class="muted">오늘의 성장 미션을 하나씩 완료해 보세요.</p>
          <div class="progress-card">
            <div class="progress-head"><strong>이번 주 미션</strong><span>${completedMissions.length} / ${tasks.length}</span></div>
            <div class="progress-track"><div style="width:${completedMissions.length / tasks.length * 100}%"></div></div>
          </div>
          <div class="task-list">
            ${tasks.map(task => `
              <label class="task-card ${completedMissions.includes(task.id) ? "done" : ""}">
                <input type="checkbox" data-mission="${task.id}" ${completedMissions.includes(task.id) ? "checked" : ""} />
                <span class="task-check">${completedMissions.includes(task.id) ? "✓" : ""}</span>
                <span><strong>${task.title}</strong><small>${task.desc}</small></span>
              </label>
            `).join("")}
          </div>
        </section>
      `;
    }

    case "chat":
      return `
        <section class="section">
          <span class="eyebrow">GROBIT ASSISTANT</span>
          <h2 class="page-title">무엇이든 물어보세요.</h2>
          <p class="muted">가게 운영과 마케팅에 관한 생각을 정리해 볼 수 있어요.</p>
          <div class="chat-box">
            <div class="chat-messages" id="chat-messages">
              ${chatMessages.map(message => `
                <div class="chat-message ${message.from === "user" ? "user-message" : "bot-message"}">${escapeHTML(message.text)}</div>
              `).join("")}
            </div>
            <form id="chat-form" class="chat-form">
              <input id="chat-input" name="message" placeholder="예: 카페 홍보 아이디어가 필요해요" required />
              <button class="button primary" type="submit">전송</button>
            </form>
          </div>
          <p class="notice">현재는 상담 화면 예시입니다. 실제 AI 답변을 받으려면 AI 서비스 연결이 필요해요.</p>
        </section>
      `;

    case "analytics":
      return `
        <section class="section">
          <span class="eyebrow">BUSINESS INSIGHTS</span>
          <h2 class="page-title">매출 · 고객 분석</h2>
          <p class="muted">가게 데이터를 바탕으로 운영 흐름을 확인하세요.</p>
          <div class="metric-grid">
            ${card("월 매출", "320만원", "예시 데이터")}
            ${card("방문 고객", "248명", "예시 데이터")}
            ${card("평균 구매액", "12,900원", "예시 데이터")}
            ${card("재방문율", "미연결", "고객 데이터 필요")}
          </div>
          <div class="chart-card">
            <h3>주간 매출 추이</h3>
            <p class="muted">이해를 돕기 위한 예시 그래프</p>
            <div class="bar-chart">
              ${[35, 55, 42, 76, 60, 88, 68].map((height, i) => `
                <div class="bar-column"><div class="bar" style="height:${height}%"></div><small>${["월","화","수","목","금","토","일"][i]}</small></div>
              `).join("")}
            </div>
          </div>
          <p class="notice">※ 그래프와 수치는 실제 매출이 아닙니다. 매출 자료를 연결하면 실제 분석으로 확장할 수 있어요.</p>
        </section>
      `;

    case "history":
      return `
        <section class="section">
          <span class="eyebrow">YOUR HISTORY</span>
          <h2 class="page-title">진단 기록</h2>
          <p class="muted">저장된 가게 정보를 확인해 보세요.</p>
          <div class="history-card">
            <span class="history-icon">◷</span>
            <div>
              <strong>${storeName ? escapeHTML(storeName) : "아직 등록된 가게가 없어요"}</strong>
              <p>${storeName ? `${escapeHTML(storeType)} · ${escapeHTML(storeLocation || "위치 미등록")}` : "가게 정보를 먼저 등록해 주세요."}</p>
              <small>가게 정보 저장 상태</small>
            </div>
          </div>
          <p class="notice">과거 진단 결과의 저장·조회 기능은 실제 진단 시스템 연결 후 추가할 수 있어요.</p>
          <button class="button primary full" data-page="diagnosis">가게 정보 확인하기</button>
        </section>
      `;

    case "mypage":
      return `
        <section class="section">
          <span class="eyebrow">MY GROBIT</span>
          <h2 class="page-title">내 가게 관리</h2>
          <div class="profile-card">
            <div class="profile-avatar">g.</div>
            <div><strong>${storeName ? escapeHTML(storeName) : "내 가게"}</strong><p>${storeName ? escapeHTML(storeType) : "가게 정보를 등록해 주세요"}</p></div>
          </div>
          <div class="link-list">
            <button class="link-card" data-page="diagnosis"><span class="menu-icon">◈</span><span><strong>가게 정보 수정</strong><small>이름, 업종, 위치 관리</small></span><span class="arrow">›</span></button>
            <button class="link-card" data-page="history"><span class="menu-icon">◷</span><span><strong>진단 기록</strong><small>저장된 정보 확인</small></span><span class="arrow">›</span></button>
            <button class="link-card" data-page="chat"><span class="menu-icon">✳</span><span><strong>AI 상담</strong><small>가게 운영 관련 질문</small></span><span class="arrow">›</span></button>
          </div>
          <p class="notice">가게 정보는 현재 이 브라우저의 저장 공간에 보관됩니다. 다른 기기와 자동으로 동기화되지는 않아요.</p>
        </section>
      `;
  }
}

function description(page: Page): string {
  const descriptions: Record<Page, string> = {
    home: "우리 가게 요약",
    diagnosis: "가게 정보와 진단 준비",
    market: "주변 상권 정보 확인",
    missions: "오늘의 성장 과제",
    chat: "운영 아이디어 상담",
    analytics: "매출과 고객 지표",
    history: "저장된 가게 정보",
    mypage: "가게 정보와 메뉴 관리",
  };
  return descriptions[page];
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] || char);
}

function render() {
  app!.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand" data-page="home" aria-label="그로빗 홈">
          <span class="brand-mark">g.</span>
          <span>grobit<small>GROW YOUR BUSINESS</small></span>
        </button>
        <button class="profile-button" data-page="mypage" aria-label="마이페이지">◎</button>
      </header>

      <main class="main-content">
        <div class="page-meta"><span>GROBIT / ${menu.find(item => item.id === currentPage)?.label.toUpperCase()}</span><span class="status-dot">● YOUR GROWTH PARTNER</span></div>
        ${userRole ? pageContent() : roleSelection()}
      </main>

      <nav class="bottom-nav" aria-label="주요 메뉴">
        ${[
          { id: "home", label: "홈", icon: "⌂" },
          { id: "diagnosis", label: "진단", icon: "◈" },
          { id: "market", label: "상권", icon: "⌖" },
          { id: "missions", label: "미션", icon: "✓" },
          { id: "mypage", label: "MY", icon: "◎" },
        ].map(item => `
          <button class="nav-item ${currentPage === item.id ? "active" : ""}" data-page="${item.id}">
            <span>${item.icon}</span><small>${item.label}</small>
          </button>
        `).join("")}
      </nav>
    </div>
  `;
app!.querySelectorAll<HTMLElement>("[data-role]").forEach(button => { 
  button.addEventListener("click", () => {
    userRole = button.dataset.role as UserRole; 
    localStorage.setItem("grobit-role", userRole); 
    go("home"); }); });
  app!.querySelectorAll<HTMLElement>("[data-page]").forEach(button => {
    button.addEventListener("click", () => go(button.dataset.page as Page));
  });

  app!.querySelectorAll<HTMLInputElement>("[data-mission]").forEach(input => {
    input.addEventListener("change", () => {
      const id = input.dataset.mission!;
      completedMissions = input.checked
        ? [...new Set([...completedMissions, id])]
        : completedMissions.filter(item => item !== id);
      localStorage.setItem("grobit-missions", JSON.stringify(completedMissions));
      render();
    });
  });

  const storeForm = app!.querySelector<HTMLFormElement>("#store-form");
  storeForm?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(storeForm);
    storeName = String(data.get("storeName") || "").trim();
    storeType = String(data.get("storeType") || "기타");
    storeLocation = String(data.get("location") || "").trim();
    localStorage.setItem("grobit-store", storeName);
    localStorage.setItem("grobit-type", storeType);
    localStorage.setItem("grobit-location", storeLocation);
    go("diagnosis");
    alert("가게 정보를 저장했어요!");
  });

  const chatForm = app!.querySelector<HTMLFormElement>("#chat-form");
  chatForm?.addEventListener("submit", event => {
    event.preventDefault();
    const input = app!.querySelector<HTMLInputElement>("#chat-input");
    const message = input?.value.trim();
    if (!message) return;
    chatMessages.push({ from: "user", text: message });
    chatMessages.push({
      from: "bot",
      text: "질문을 확인했어요! 실제 AI 답변을 제공하려면 AI 서비스 연결이 필요해요. 우선 가게의 목표와 고객층을 정리해 보세요.",
    });
    render();
    const messages = app!.querySelector("#chat-messages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  });
}

render();



