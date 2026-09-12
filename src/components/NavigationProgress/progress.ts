class ProgressManager {
  el: HTMLDivElement | null = null;
  progress = 0;
  target = 0;
  speed = 0.08;
  rafId: number | null = null;
  finishTimer: ReturnType<typeof setTimeout> | null = null;
  requests = 0;

  mount() {
    if (this.el) return;

    this.el = document.createElement('div');

    Object.assign(this.el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '2px',
      width: '0%',
      background: 'var(--gvray-color-primary, #1677ff)',
      boxShadow: '0 0 10px var(--gvray-color-primary, #1677ff)',
      zIndex: '99999',
      opacity: '0',
      transition: 'opacity 0.35s ease',
      willChange: 'width, opacity',
    });

    // antd ConfigProvider 的 cssVar 作用域挂在 .ant-app 根节点（非 :root），
    // 进度条必须挂到该作用域内才能解析 --gvray-color-primary。
    const container = document.querySelector('.ant-app') || document.body;
    container.appendChild(this.el);
  }

  private loop = () => {
    if (!this.el) return;
    const diff = this.target - this.progress;
    if (Math.abs(diff) < 0.2) {
      this.progress = this.target;
    } else {
      this.progress += diff * this.speed;
    }
    this.el.style.width = `${this.progress}%`;

    if (this.progress !== this.target) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.rafId = null;
    }
  };

  private animate() {
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  show() {
    if (!this.el) return;
    this.el.style.opacity = '1';
  }

  hide() {
    if (!this.el) return;
    this.el.style.opacity = '0';
    setTimeout(() => {
      if (this.el) {
        this.el.style.width = '0%';
        this.progress = 0;
        this.target = 0;
      }
    }, 350);
  }

  start() {
    this.mount();
    this.show();

    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }

    // 缓动逼近加载区(90%),渐近不触底,自然减速
    this.speed = 0.08;
    this.target = 90;
    this.progress = Math.max(this.progress, 10);
    this.animate();
  }

  inc() {
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
    this.requests++;
    this.start();
  }

  dec() {
    this.requests = Math.max(0, this.requests - 1);

    if (this.requests === 0) {
      if (this.finishTimer) clearTimeout(this.finishTimer);
      this.finishTimer = setTimeout(() => {
        this.finishTimer = null;
        this.finish();
      }, 100);
    }
  }

  finish() {
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }

    // 加速收尾到 100%,再淡出
    this.speed = 0.3;
    this.target = 100;
    this.animate();

    setTimeout(() => {
      this.hide();
      this.reset();
    }, 260);
  }

  reset() {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
  }
}

export const progress = new ProgressManager();
