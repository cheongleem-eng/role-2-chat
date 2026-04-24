/* ============================================================
   제주항공 비상훈련 롤플레잉 — app.js
   ============================================================ */

// ============================================================
// 🔥 FIREBASE 설정 — 여기만 본인 프로젝트 값으로 교체하세요!
// ============================================================
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ============================================================
// DATA — 훈련 단계 정의
// ============================================================
const PHASES = [
  {
    id: 1,
    title: "주의집중 방송",
    instruction: "당신은 음악을 듣고 있는 승객입니다.\n이어폰을 착용하고 계속 음악을 듣고 있으세요.\n승무원의 별도 지시가 있을 때까지 역할을 유지하세요.",
    question: null,
    evalCriteria: [
      "이어폰 착용 승객에게 개별 접근하여 주의를 환기시켰는가",
      "명확하고 침착한 목소리로 안내했는가",
      "승객과 적절한 아이컨택을 유지했는가"
    ]
  },
  {
    id: 2,
    title: "서비스 용품 수거 및 승객 좌석 점검",
    instruction: "좌석에 착석한 후 등받이를 뒤로 젖혀주세요.\n승무원의 별도 지시가 있을 때까지 그대로 유지하세요.",
    question: null,
    evalCriteria: [
      "서비스 용품(트레이, 컵 등)을 신속하게 수거했는가",
      "등받이가 젖혀진 승객에게 직접 접근하여 원위치를 요청했는가",
      "정중하고 단호한 어조로 요청을 전달했는가",
      "좌석 상태를 꼼꼼하게 확인하며 이동했는가"
    ]
  },
  {
    id: 3,
    title: "탈출차림 준비 및 수하물 정리·보관",
    instruction: "소지한 가방을 선반에 넣으려 하지만 선반에 공간이 없습니다.\n앉지 말고 두리번거리며 승무원의 지시를 기다리세요.",
    question: null,
    evalCriteria: [
      "수하물 정리 안내를 명확하게 전달했는가",
      "선반 공간이 없는 승객에게 적절한 대안을 신속히 제시했는가",
      "탈출 시 방해가 되는 물품을 식별하고 조치했는가",
      "승객의 협조를 이끌어내는 커뮤니케이션을 수행했는가"
    ]
  },
  {
    id: 4,
    title: "좌석벨트 착용",
    instruction: "좌석벨트를 풀어보려 하지만 잘 풀어지지 않아 버클 부분을 계속 만지작거리세요.\n승무원의 별도 지시가 있을 때까지 역할을 유지하세요.",
    question: "저, 죄송한데요. 좌석벨트가 잘 안 풀려요.\n어떻게 푸는 건가요? 그리고 언제 풀어도 되나요?",
    evalCriteria: [
      "좌석벨트 착용 방법과 해제 방법을 정확하게 시범 보였는가",
      "착용 상태를 직접 확인하고 미착용 승객에게 조치했는가",
      "어려움을 겪는 승객을 신속하게 발견하고 도움을 제공했는가",
      "해제 가능 시점(비상착수 전/후)에 대해 명확히 설명했는가"
    ]
  },
  {
    id: 5,
    title: "충격방지자세",
    instruction: "충격방지자세를 언제 취해야 하는지 모릅니다.\n승무원이 지나갈 때 손을 들거나 질문하세요.",
    question: "저, 충격방지자세는 언제 취해야 하나요?\n방법도 알려주실 수 있나요?",
    evalCriteria: [
      "충격방지자세(Brace Position)를 정확하게 시범 보였는가",
      "자세를 취해야 하는 시점과 신호를 명확하게 설명했는가",
      "어린이·노약자 등 특수 승객에 대한 별도 안내를 했는가",
      "승객이 자세를 올바르게 취하는지 확인했는가"
    ]
  },
  {
    id: 6,
    title: "탈출구 위치 안내 (착수 시)",
    instruction: "항공기 후방에 앉은 승객입니다.\n뒤쪽 탈출구가 가깝지만 왜 사용 불가능한지 궁금합니다.\n승무원이 지나갈 때 질문하세요.",
    question: "저 뒤쪽에도 탈출구가 있는데, 왜 사용할 수 없다고 하나요?\n이유를 설명해 주실 수 있어요?",
    evalCriteria: [
      "각 탈출구 위치와 사용 가능 여부를 명확하게 안내했는가",
      "착수 시 사용 불가 탈출구에 대한 이유를 설명했는가",
      "대체 탈출구로 승객을 유도하는 능력을 발휘했는가",
      "패닉 상황에서 승객을 침착하게 안내했는가"
    ]
  },
  {
    id: 7,
    title: "협조자 선정",
    instruction: "당사 직원 티켓으로 탑승한 승무원입니다.\n승무원이 지나갈 때 손을 드세요.\n이후 승무원의 지시에 따르세요.",
    question: null,
    evalCriteria: [
      "비상시 협조 가능한 승객(직원 탑승자 포함)을 적극적으로 찾았는가",
      "협조자에게 명확한 역할과 임무를 부여했는가",
      "협조자와 효과적인 소통을 유지했는가",
      "비상 상황 전반에 걸쳐 팀워크를 발휘했는가"
    ]
  }
];

const EMOJI_MAP   = { 
  1: '<i class="ph-duotone ph-smiley-angry"></i>', 
  2: '<i class="ph-duotone ph-smiley-sad"></i>', 
  3: '<i class="ph-duotone ph-smiley-meh"></i>', 
  4: '<i class="ph-duotone ph-smiley"></i>', 
  5: '<i class="ph-duotone ph-star"></i>' 
};
const SCORE_LABEL = { 1: '매우 불만족', 2: '불만족', 3: '보통', 4: '만족', 5: '매우 만족' };

// ============================================================
// STATE
// ============================================================
let db      = null;
let fbReady = false;

let state = {
  evaluatorName: '',
  traineeName: '',
  date: '',
  currentPhase: 0,
  evaluations: {}
};

let selectedRating = null;

// ============================================================
// 🔥 FIREBASE INIT
// ============================================================
function initFirebase() {
  try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
      db      = firebase.firestore();
      fbReady = true;
      console.log('✅ Firebase Firestore 연결 성공');
    }
  } catch (e) {
    console.warn('⚠️ Firebase 초기화 실패 — 로컬 모드:', e.message);
    fbReady = false;
  }
}

function getPhaseRef(trainee, phaseId) {
  if (!db) return null;
  return db
    .collection('evaluations')
    .doc(`${state.date}_${trainee}`)
    .collection('phases')
    .doc(String(phaseId));
}

// ============================================================
// CORE ACTIONS
// ============================================================
async function startSession() {
  const eName = document.getElementById('input-evaluator-name').value.trim();
  const tName = document.getElementById('input-trainee-name').value.trim();
  const date  = document.getElementById('input-date').value;

  if (!eName) { alert('나의 이름(평가자)을 입력해주세요.'); return; }
  if (!tName) { alert('평가 대상(승무원)의 이름을 입력해주세요.'); return; }
  if (!date) { alert('훈련 날짜를 선택해주세요.'); return; }

  state.evaluatorName = eName;
  state.traineeName = tName;
  state.date = date;
  state.currentPhase = 0;
  state.evaluations = {};

  hideAllScreens();
  document.getElementById('screen-main').classList.add('active');
  document.getElementById('header-names').innerHTML = `<i class="ph-fill ph-user" style="color:var(--jeju-orange)"></i> ${eName} <i class="ph-bold ph-caret-right" style="margin:0 4px; color:var(--text-secondary)"></i> <i class="ph-fill ph-airplane-tilt" style="color:var(--jeju-orange)"></i> ${tName}`;

  buildPhaseNav();
  
  if (fbReady) {
    await loadSessionFromFirestore();
  }
  
  renderPhase(0);
}

function renderPhase(index) {
  const phase = PHASES[index];
  state.currentPhase = index;
  selectedRating = null;

  // Header
  document.getElementById('phase-number').textContent = phase.id;
  document.getElementById('phase-title').textContent  = phase.title;

  // Passenger Instruction
  document.getElementById('instruction-text').textContent = phase.instruction;
  const qBox = document.getElementById('question-box');
  if (phase.question) {
    document.getElementById('question-text').textContent = phase.question;
    qBox.style.display = 'block';
  } else {
    qBox.style.display = 'none';
  }

  // Reset or Load Rating
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('save-toast').style.display = 'none';

  const existing = state.evaluations[phase.id];
  if (existing) {
    selectedRating = existing.score;
    const btn = document.querySelector(`.emoji-btn[data-score="${existing.score}"]`);
    if (btn) btn.classList.add('selected');
  }

  // Navigation state
  document.getElementById('phase-indicator').textContent = `${index + 1} / ${PHASES.length}`;
  document.getElementById('btn-prev').disabled = index === 0;
  document.getElementById('btn-next').disabled = index === PHASES.length - 1;
  updatePhaseNavActive(index);
  
  // Scroll content area to top
  const scrollContent = document.querySelector('.scroll-content');
  if (scrollContent) scrollContent.scrollTo(0, 0);
}

async function setRatingAndSave(score) {
  selectedRating = score;
  
  // UI Feedback: Highlight selected
  document.querySelectorAll('.emoji-btn').forEach(b => {
    b.classList.remove('selected');
    if (parseInt(b.dataset.score) === score) b.classList.add('selected');
  });

  // Save (Async)
  saveEvaluation(score, "");

  // Show Toast
  const toast = document.getElementById('save-toast');
  toast.style.display = 'block';

  // Auto-next after short delay
  setTimeout(() => {
    if (state.currentPhase < PHASES.length - 1) {
      changePhase(1);
    } else {
      showSummary();
    }
  }, 1000);
}

async function saveEvaluation(score, comment) {
  const phaseId = PHASES[state.currentPhase].id;
  const record = {
    score,
    comment,
    phaseId,
    phaseTitle: PHASES[state.currentPhase].title,
    trainee: state.traineeName,
    evaluator: state.evaluatorName,
    date: state.date,
    timestamp: new Date().toISOString()
  };

  state.evaluations[phaseId] = record;
  markPillDone(state.currentPhase);

  if (fbReady) {
    try {
      // Upsert session meta first
      await db.collection('evaluations').doc(`${state.date}_${state.traineeName}`).set({
        trainee: state.traineeName,
        evaluator: state.evaluatorName,
        date: state.date,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Save phase data
      await getPhaseRef(state.traineeName, phaseId).set({
        ...record,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Save error:", e);
    }
  }
}

function changePhase(delta, direct) {
  const next = direct !== undefined ? direct : state.currentPhase + delta;
  if (next < 0 || next >= PHASES.length) return;
  renderPhase(next);
}

async function loadSessionFromFirestore() {
  if (!fbReady || !state.traineeName) return;
  try {
    showLoadingOverlay(true);
    const snap = await db
      .collection('evaluations')
      .doc(`${state.date}_${state.traineeName}`)
      .collection('phases')
      .get();

    snap.forEach(doc => {
      state.evaluations[parseInt(doc.id)] = doc.data();
    });
    refreshPhasePills();
  } catch (e) {
    console.error('Firestore 불러오기 실패:', e);
  } finally {
    showLoadingOverlay(false);
  }
}

// ============================================================
// UI HELPERS
// ============================================================
function buildPhaseNav() {
  const nav = document.getElementById('phase-nav');
  nav.innerHTML = '';
  PHASES.forEach((p, i) => {
    const pill = document.createElement('button');
    pill.className = 'phase-pill' + (i === 0 ? ' active' : '');
    pill.textContent = `${p.id}. ${p.title}`;
    pill.dataset.index = i;
    pill.onclick = () => changePhase(null, i);
    nav.appendChild(pill);
  });
}

function updatePhaseNavActive(activeIndex) {
  const nav = document.getElementById('phase-nav');
  document.querySelectorAll('#phase-nav .phase-pill').forEach((p, i) => {
    p.classList.toggle('active', i === activeIndex);
    if (i === activeIndex) {
      const scrollLeft = p.offsetLeft - (nav.offsetWidth / 2) + (p.offsetWidth / 2);
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  });
}

function markPillDone(index) {
  const pills = document.querySelectorAll('#phase-nav .phase-pill');
  if (pills[index]) pills[index].classList.add('done');
}

function refreshPhasePills() {
  PHASES.forEach((p, i) => { 
    if (state.evaluations[p.id]) markPillDone(i); 
  });
}

function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

function goHome() {
  if (confirm('메인 화면으로 이동하시겠습니까? 현재까지 평가한 내용은 유지됩니다.')) {
    hideAllScreens();
    document.getElementById('screen-login').classList.add('active');
  }
}

function showSummary() {
  hideAllScreens();
  document.getElementById('screen-summary').classList.add('active');

  const container = document.getElementById('summary-content');
  container.innerHTML = '';

  const headerInfo = document.createElement('div');
  headerInfo.className = 'summary-header-info';
  headerInfo.innerHTML = `
    <h2><i class="ph-fill ph-airplane-tilt" style="color:var(--jeju-orange)"></i> 대상: ${state.traineeName}</h2>
    <p>평가자: ${state.evaluatorName} | ${state.date}</p>
  `;
  container.appendChild(headerInfo);

  const listCard = document.createElement('div');
  listCard.className = 'summary-card';
  
  let listHtml = '<div style="display: flex; flex-direction: column;">';
  PHASES.forEach(phase => {
    const ev = state.evaluations[phase.id];
    listHtml += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; font-weight: 700; color: white; background: var(--jeju-orange); width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">${phase.id}</span>
          <span style="font-size: 14px; font-weight: 600;">${phase.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 22px;">${ev ? EMOJI_MAP[ev.score] : '<i class="ph ph-minus"></i>'}</span>
          <span style="font-size: 13px; font-weight: 700; color: var(--jeju-orange);">${ev ? SCORE_LABEL[ev.score] : '미평가'}</span>
        </div>
      </div>
    `;
  });
  listHtml += '</div>';
  listCard.innerHTML = listHtml;
  container.appendChild(listCard);
}

function backToMain() {
  hideAllScreens();
  document.getElementById('screen-main').classList.add('active');
}

async function promptAdminLogin() {
  const pw = prompt("관리자 비밀번호를 입력하세요.");
  if (pw === "Jeju@ir1") {
    hideAllScreens();
    document.getElementById('screen-admin').classList.add('active');
    await loadAndRenderAdminData();
  } else if (pw !== null) {
    alert("비밀번호가 일치하지 않습니다.");
  }
}

function showLoadingOverlay(visible) {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    el.innerHTML = '<div style="background:white;padding:28px 36px;border-radius:16px;font-weight:700;text-align:center;">불러오는 중...</div>';
    document.body.appendChild(el);
  }
  el.style.display = visible ? 'flex' : 'none';
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('input-date')) {
    document.getElementById('input-date').value = new Date().toISOString().split('T')[0];
  }
  initFirebase();
});