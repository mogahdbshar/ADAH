(()=>{'use strict';
const dict={
'الأدوات':'Tools','الأقسام':'Categories','مكتبة الأدوات':'Tools library','عن ADAH':'About ADAH','المساعدة':'Help','الرئيسية':'Home','الخصوصية':'Privacy','الشروط':'Terms','خريطة الموقع':'Sitemap','العودة للرئيسية':'Back to home','العودة إلى المكتبة':'Back to library',
'عن ADAH':'About ADAH','المساعدة والأسئلة الشائعة':'Help & FAQ','خريطة الموقع':'Sitemap','سياسة الخصوصية':'Privacy policy','شروط الاستخدام':'Terms of use',
'اكتب، رتّب، وأنجز.':'Write, organize, get things done.','حسابات يومية بلا تعقيد.':'Everyday calculations, made simple.','أمانك يبدأ من كلمة مرور قوية.':'Your security starts with a strong password.',
'عداد الكلمات':'Word counter','منسّق JSON':'JSON formatter','مولّد كلمات المرور':'Password generator','الحاسبة السريعة':'Quick calculator','محول الوحدات':'Unit converter','حاسبة العمر':'Age calculator',
'النصوص والكتابة':'Writing & text','الصور والتصميم':'Images & design','الملفات والمستندات':'Files & documents','الحساب والتحويل':'Calculation & conversion','الأمان والخصوصية':'Security & privacy','الإنترنت والشبكات':'Internet & networks','المطورون والتقنية':'Developers & technology','الإنتاجية والتنظيم':'Productivity & organization',
'ابدأ الكتابة هنا...':'Start typing here...','نسخ النص':'Copy text','مسح النص':'Clear text','نسخ النتيجة':'Copy result','مسح الحقول':'Clear fields','افتح الأداة':'Open tool','استخدم الأداة':'Use tool','أداة مجانية':'Free tool','قريباً':'Coming soon',
'هل أحتاج إلى حساب؟':'Do I need an account?','لا، الأدوات المتاحة حالياً لا تتطلب إنشاء حساب.':'No. Available tools currently do not require an account.','هل الأدوات مجانية؟':'Are the tools free?','هل تُرسل بياناتي إلى الخادم؟':'Is my data sent to a server?','هل يعمل الموقع دون إنترنت؟':'Does the site work offline?',
'مبادئنا':'Our principles','التطوير':'Development','آخر تحديث: نوفمبر 2026':'Last updated: November 2026','اتفاق الاستخدام':'Terms of use','الشفافية والثقة':'Transparency & trust',
'استكشاف جميع الأدوات':'Explore all tools','ثمانية مجالات منظمة لتصل إلى ما تحتاجه بسهولة.':'Eight organized areas to help you find what you need.',
'أدوات عملية للتعامل مع النصوص والبيانات بسرعة، بتصميم واضح وتجربة عربية.':'Practical tools for text and data, with a clear experience.','مجموعة أدوات خفيفة للحساب والتحويل، تعمل مباشرة من متصفحك.':'Lightweight calculation and conversion tools that run in your browser.',
'تتم المعالجة داخل متصفحك فقط.':'Processing happens only in your browser.','آخر تحديث':'Last updated','التواصل':'Contact'
};
const reverse=Object.fromEntries(Object.entries(dict).map(([a,b])=>[b,a]));
const key='adah-language';let lang='ar';try{lang=localStorage.getItem(key)||'ar'}catch{}
function translate(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-lang-switch]').forEach(b=>{b.textContent=lang==='ar'?'English':'العربية';b.setAttribute('aria-label',lang==='ar'?'Switch to English':'التبديل إلى العربية')});
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const raw=n.nodeValue,trim=raw.trim();if(!trim)continue;const value=lang==='en'?dict[trim]:reverse[trim];if(value)n.nodeValue=raw.replace(trim,value)}
document.querySelectorAll('[placeholder]').forEach(el=>{const v=lang==='en'?dict[el.placeholder]:reverse[el.placeholder];if(v)el.placeholder=v});
document.querySelectorAll('[aria-label]').forEach(el=>{const v=lang==='en'?dict[el.getAttribute('aria-label')]:reverse[el.getAttribute('aria-label')];if(v)el.setAttribute('aria-label',v)});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-lang-switch]');if(!b)return;lang=lang==='ar'?'en':'ar';try{localStorage.setItem(key,lang)}catch{}location.reload()});
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.topbar').forEach(h=>{if(!h.querySelector('[data-lang-switch]')){const b=document.createElement('button');b.type='button';b.className='tool-btn secondary language-switch';b.dataset.langSwitch='';b.textContent=lang==='ar'?'English':'العربية';b.addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';try{localStorage.setItem(key,lang)}catch{}location.reload()});h.append(b)}});translate()});
})();