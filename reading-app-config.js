/*
 * إعدادات مشتركة لجميع صفحات التطبيق (القراءة، الإملاء، الفحص).
 * هذا هو المكان الوحيد الذي يجب تعديله عند تغيير رابط الخادم أو الصوت أو المنطقة —
 * كل الصفحات تقرأ من هنا بدل أن يكرّر كل ملف نفس القيم.
 */
window.READING_APP_CONFIG = window.READING_APP_CONFIG || {
  TOKEN_ENDPOINT: 'https://reading-speech-api-e9hbc8fscfaxacgv.israelcentral-01.azurewebsites.net/api/speech-token',
  REGION: 'eastus',
  VOICE: 'ar-JO-SanaNeural',
  SDK_URL: 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.46.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js'
};

// أسماء بديلة يستخدمها كل ملف تاريخيًا — تشير كلها لنفس الكائن أعلاه،
// حتى لا نضطر لتعديل بقية الكود في كل صفحة.
window.DICTATION_APP_CONFIG = window.READING_APP_CONFIG;
