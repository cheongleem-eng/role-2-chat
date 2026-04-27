/* ============================================================
   Pattern Lock Component — main.js (High Sensitivity)
   ============================================================ */

class PatternLock {
  constructor(containerId, onUnlock) {
    this.container = document.getElementById(containerId);
    this.onUnlock = onUnlock;
    this.dots = [];
    this.path = [];
    this.isDrawing = false;
    this.correctPattern = "412369";
    this.dotCenters = []; // 점들의 중심 좌표 캐싱
    
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="pattern-grid">
        ${Array.from({ length: 9 }, (_, i) => `<div class="dot" data-index="${i + 1}"></div>`).join('')}
        <svg class="pattern-svg"></svg>
      </div>
    `;
    
    this.grid = this.container.querySelector('.pattern-grid');
    this.svg = this.container.querySelector('.pattern-svg');
    this.dotElements = this.container.querySelectorAll('.dot');
    
    // 모바일 드래그 최적화
    this.grid.style.touchAction = 'none';
    this.grid.style.userSelect = 'none';
    this.grid.style.webkitUserSelect = 'none';
    
    this.addEventListeners();
  }

  // 드래그 시작 시 점들의 실시간 좌표를 미리 계산하여 성능 향상
  cacheDotPositions() {
    this.dotCenters = [];
    this.dotElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      this.dotCenters.push({
        index: index + 1,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    });
  }

  addEventListeners() {
    const start = (e) => {
      // 드래그 시 브라우저 기본 동작(스크롤 등) 원천 차단
      if (e.cancelable) e.preventDefault();
      
      this.isDrawing = true;
      this.path = [];
      this.clearStatus();
      this.cacheDotPositions(); // 시작할 때 좌표 캐싱
      
      const point = this.getEventPoint(e);
      this.handleMoveAt(point.x, point.y);
    };

    const move = (e) => {
      if (!this.isDrawing) return;
      if (e.cancelable) e.preventDefault();
      
      const point = this.getEventPoint(e);
      this.handleMoveAt(point.x, point.y);
    };

    const end = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.checkPattern();
    };

    // Grid 영역에서 이벤트 리스너 등록
    this.grid.addEventListener('touchstart', start, { passive: false });
    this.grid.addEventListener('touchmove', move, { passive: false });
    this.grid.addEventListener('touchend', end, { passive: false });

    this.grid.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  }

  getEventPoint(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  handleMoveAt(x, y) {
    const targetDot = this.findNearestDot(x, y);
    
    if (targetDot && !this.path.includes(targetDot)) {
      this.path.push(targetDot);
      this.dotElements[targetDot - 1].classList.add('active');
      
      // 햅틱 피드백
      if (navigator.vibrate) navigator.vibrate(15);
    }
    
    this.renderLines(x, y);
  }

  findNearestDot(x, y) {
    // 캐싱된 좌표를 바탕으로 가장 가까운 점 찾기 (성능 우수)
    for (const dot of this.dotCenters) {
      const dist = Math.hypot(x - dot.x, y - dot.y);
      if (dist < 38) { // 인식 범위 약간 더 확대
        return dot.index;
      }
    }
    return null;
  }

  renderLines(currentX, currentY) {
    if (this.path.length === 0) return;

    let svgHtml = '';
    const svgRect = this.svg.getBoundingClientRect();

    for (let i = 0; i < this.path.length; i++) {
      const dotIdx = this.path[i];
      const center = this.dotCenters[dotIdx - 1];
      
      const x1 = center.x - svgRect.left;
      const y1 = center.y - svgRect.top;

      if (i < this.path.length - 1) {
        // 이미 연결된 점들 사이의 선
        const nextDotIdx = this.path[i + 1];
        const nextCenter = this.dotCenters[nextDotIdx - 1];
        const x2 = nextCenter.x - svgRect.left;
        const y2 = nextCenter.y - svgRect.top;
        svgHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="pattern-line" />`;
      } else if (this.isDrawing) {
        // 마지막 점과 현재 손가락 위치 사이의 실시간 선
        const x2 = currentX - svgRect.left;
        const y2 = currentY - svgRect.top;
        svgHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="pattern-line active" />`;
      }
    }
    this.svg.innerHTML = svgHtml;
  }

  checkPattern() {
    const userPattern = this.path.join('');
    if (userPattern === this.correctPattern) {
      this.grid.classList.add('success');
      setTimeout(() => this.onUnlock(), 300);
    } else {
      if (this.path.length > 0) {
        this.grid.classList.add('error');
        if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
        setTimeout(() => this.clearStatus(), 1000);
      }
    }
  }

  clearStatus() {
    this.path = [];
    this.isDrawing = false;
    this.grid.classList.remove('error', 'success');
    this.dotElements.forEach(dot => dot.classList.remove('active'));
    this.svg.innerHTML = '';
  }
}

// 초기화
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pattern-container');
  if (container) {
    new PatternLock('pattern-container', () => {
      document.getElementById('screen-lock').style.display = 'none';
      document.getElementById('screen-portal').classList.add('active');
    });
  }
});
