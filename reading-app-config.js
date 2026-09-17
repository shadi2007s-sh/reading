/*
 * إعدادات مشتركة لجميع صفحات التطبيق (القراءة، الإملاء، الفحص).
 * هذا هو المكان الوحيد الذي يجب تعديله عند تغيير رابط الخادم أو الصوت أو المنطقة —
 * كل الصفحات تقرأ من هنا بدل أن يكرّر كل ملف نفس القيم.
 */
window.READING_APP_CONFIG = window.READING_APP_CONFIG || {
  TOKEN_ENDPOINT: 'https://reading-speech-api-e9hbc8fscfaxacgv.israelcentral-01.azurewebsites.net/api/speech-token',
  REGION: 'eastus',
  VOICE: 'ar-JO-SanaNeural',
  SDK_URL: 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.46.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js',
  // النص المشترك: صفحة القراءة هي المصدر، والإملاء يقرأ آخر نص محفوظ هنا.
  SHARED_TEXT_KEY: 'sana_current_learning_text_v1'
};

// أسماء بديلة يستخدمها كل ملف تاريخيًا — تشير كلها لنفس الكائن أعلاه،
// حتى لا نضطر لتعديل بقية الكود في كل صفحة.
window.DICTATION_APP_CONFIG = window.READING_APP_CONFIG;



/* ============================================================
 * النص المشترك بين القراءة والإملاء
 * القراءة = المصدر الرئيسي
 * الإملاء = يستهلك آخر نص محفوظ تلقائيًا
 * ============================================================ */
window.sanaTextSync = window.sanaTextSync || (() => {
  const CONFIG = window.READING_APP_CONFIG;
  const KEY = CONFIG.SHARED_TEXT_KEY;

  function publish(text, meta = {}) {
    const value = String(text || '').trim();
    if (!value) return false;
    const payload = {
      text: value,
      name: String(meta.name || ''),
      textId: String(meta.textId || ''),
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  function get() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (!value || typeof value.text !== 'string' || !value.text.trim()) return null;
      return value;
    } catch (_) {
      return null;
    }
  }

  function onChange(callback) {
    if (typeof callback !== 'function') return () => {};
    const handler = event => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        const value = JSON.parse(event.newValue);
        if (value && typeof value.text === 'string' && value.text.trim()) {
          callback(value);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  return Object.freeze({ key: KEY, publish, get, onChange });
})();

/* ============================================================
 * التنقل المركزي بين صفحات التطبيق
 * غيّر أسماء الملفات هنا فقط إذا تغيّر هيكل المشروع.
 * ============================================================ */
window.READING_APP_CONFIG.PAGES = window.READING_APP_CONFIG.PAGES || {
  home:         { file: 'index.html',       label: '🏠 الرئيسية',   title: 'الرئيسية' },
  reading:      { file: 'reading.html',     label: '📖 القراءة',    title: 'تدريب القراءة' },
  dictation:    { file: 'dictation.html',   label: '✍️ الإملاء',    title: 'تدريب الإملاء' },
  diagnostics:  { file: 'diagnostics.html', label: '🩺 فحص النظام', title: 'فحص النظام' }
};

window.initSanaNavigation = window.initSanaNavigation || (() => {
  const CONFIG = window.READING_APP_CONFIG;
  const NAV_ID = 'central-app-nav';
  const STYLE_ID = 'central-app-nav-style';

  function currentPage() {
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return Object.entries(CONFIG.PAGES).find(([, page]) => page.file.toLowerCase() === current)?.[0] || 'home';
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${NAV_ID}{
        max-width:860px;margin:0 auto 10px;padding:8px;display:flex;gap:7px;
        flex-wrap:wrap;align-items:center;justify-content:center;background:rgba(255,255,255,.88);
        border:2px solid #d8e8f0;border-radius:18px;box-shadow:0 6px 16px rgba(40,75,95,.08);
        direction:rtl;font-family:"Baloo Bhaijaan 2","Noto Naskh Arabic",system-ui,sans-serif;
      }
      #${NAV_ID} a{
        flex:1 1 120px;min-width:108px;text-align:center;text-decoration:none;color:#253844;
        background:#fff;border:2px solid #cfe4ee;border-radius:13px;padding:9px 10px;font-weight:800;
        line-height:1.25;transition:transform .12s,background .12s,border-color .12s;touch-action:manipulation;
      }
      #${NAV_ID} a:hover{transform:translateY(-1px)}
      #${NAV_ID} a[aria-current="page"]{background:#eef9ff;border-color:#67b8e9}
      @media(max-width:620px){#${NAV_ID} a{flex:1 1 calc(50% - 7px);min-width:0;font-size:.9rem}}
    `;
    document.head.appendChild(style);
  }

  function buildNav() {
    if (!document.body || document.getElementById(NAV_ID)) return;
    injectStyles();
    const nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.setAttribute('aria-label', 'التنقل بين صفحات التطبيق');
    const page = currentPage();

    Object.entries(CONFIG.PAGES).forEach(([key, item]) => {
      const a = document.createElement('a');
      a.href = item.file;
      a.textContent = item.label;
      a.title = item.title;
      if (key === page) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function wireDataLinks() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      const item = CONFIG.PAGES[el.getAttribute('data-nav')];
      if (!item) return;
      if (el.tagName === 'A') el.href = item.file;
      el.setAttribute('data-nav-resolved', item.file);
    });
  }

  function init() { buildNav(); wireDataLinks(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return Object.freeze({ pages: CONFIG.PAGES, current: currentPage, init });
})();
