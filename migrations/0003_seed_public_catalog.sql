-- ADAH Phase 5: initial bilingual public catalogue.
-- Safe to re-run: stable IDs and INSERT OR IGNORE prevent duplicate records.
-- All seeded records are published because they correspond to existing live static content.

INSERT OR IGNORE INTO categories (id, slug, sort_order, status) VALUES
('cat-text','text',1,'published'),
('cat-images','images',2,'published'),
('cat-files','files',3,'published'),
('cat-utility','utility',4,'published'),
('cat-security','security',5,'published'),
('cat-network','network',6,'published'),
('cat-developer','developer',7,'published'),
('cat-productivity','productivity',8,'published');

INSERT OR IGNORE INTO translations (id,entity_type,entity_id,locale,field_name,value) VALUES
('tr-cat-text-ar','category','cat-text','ar','title','النصوص والكتابة'),
('tr-cat-text-en','category','cat-text','en','title','Writing & text'),
('tr-cat-images-ar','category','cat-images','ar','title','الصور والتصميم'),
('tr-cat-images-en','category','cat-images','en','title','Images & design'),
('tr-cat-files-ar','category','cat-files','ar','title','الملفات والمستندات'),
('tr-cat-files-en','category','cat-files','en','title','Files & documents'),
('tr-cat-utility-ar','category','cat-utility','ar','title','الحساب والتحويل'),
('tr-cat-utility-en','category','cat-utility','en','title','Calculation & conversion'),
('tr-cat-security-ar','category','cat-security','ar','title','الأمان والخصوصية'),
('tr-cat-security-en','category','cat-security','en','title','Security & privacy'),
('tr-cat-network-ar','category','cat-network','ar','title','الإنترنت والشبكات'),
('tr-cat-network-en','category','cat-network','en','title','Internet & networks'),
('tr-cat-developer-ar','category','cat-developer','ar','title','المطورون والتقنية'),
('tr-cat-developer-en','category','cat-developer','en','title','Developers & technology'),
('tr-cat-productivity-ar','category','cat-productivity','ar','title','الإنتاجية والتنظيم'),
('tr-cat-productivity-en','category','cat-productivity','en','title','Productivity & organization');

INSERT OR IGNORE INTO tools (id,slug,category_id,route,icon_key,status,is_local_only,version) VALUES
('tool-counter','word-counter','cat-text','?tool=counter','type','published',1,1),
('tool-json','json-formatter','cat-text','?tool=json','code','published',1,1),
('tool-password','password-generator','cat-security','?tool=password','shield','published',1,1),
('tool-calculator','quick-calculator','cat-utility','?tool=calculator','calculator','published',1,1),
('tool-converter','unit-converter','cat-utility','?tool=convert','arrows','published',1,1),
('tool-age','age-calculator','cat-utility','?tool=age','clock','published',1,1),
('tool-image','image-resizer','cat-images','?tool=image','image','published',1,1),
('tool-filehash','file-checksum','cat-files','?tool=filehash','file','published',1,1),
('tool-base64','base64-codec','cat-developer','?tool=base64','code','published',1,1),
('tool-textcase','text-case','cat-productivity','?tool=textcase','type','published',1,1),
('tool-urlcodec','url-codec','cat-network','?tool=urlcodec','link','published',1,1),
('tool-uuid','uuid-generator','cat-developer','?tool=uuid','code','published',1,1),
('tool-lines','line-organizer','cat-productivity','?tool=lines','list','published',1,1);

INSERT OR IGNORE INTO translations (id,entity_type,entity_id,locale,field_name,value) VALUES
('tr-tool-counter-ar-title','tool','tool-counter','ar','title','عداد الكلمات'),
('tr-tool-counter-en-title','tool','tool-counter','en','title','Word counter'),
('tr-tool-counter-ar-desc','tool','tool-counter','ar','description','احسب الكلمات والحروف والمسافات في نصك فوراً.'),
('tr-tool-counter-en-desc','tool','tool-counter','en','description','Count words, characters and spaces instantly.'),
('tr-tool-json-ar-title','tool','tool-json','ar','title','منسّق JSON'),
('tr-tool-json-en-title','tool','tool-json','en','title','JSON formatter'),
('tr-tool-json-ar-desc','tool','tool-json','ar','description','رتّب بيانات JSON وتحقق من صحتها بسهولة.'),
('tr-tool-json-en-desc','tool','tool-json','en','description','Format JSON and validate it easily.'),
('tr-tool-password-ar-title','tool','tool-password','ar','title','مولّد كلمات المرور'),
('tr-tool-password-en-title','tool','tool-password','en','title','Password generator'),
('tr-tool-password-ar-desc','tool','tool-password','ar','description','أنشئ كلمات مرور قوية وعشوائية على جهازك.'),
('tr-tool-password-en-desc','tool','tool-password','en','description','Generate strong random passwords on your device.'),
('tr-tool-calculator-ar-title','tool','tool-calculator','ar','title','الحاسبة السريعة'),
('tr-tool-calculator-en-title','tool','tool-calculator','en','title','Quick calculator'),
('tr-tool-calculator-ar-desc','tool','tool-calculator','ar','description','نفّذ العمليات الحسابية اليومية بسرعة ودقة.'),
('tr-tool-calculator-en-desc','tool','tool-calculator','en','description','Perform everyday calculations quickly and accurately.'),
('tr-tool-converter-ar-title','tool','tool-converter','ar','title','محول الوحدات'),
('tr-tool-converter-en-title','tool','tool-converter','en','title','Unit converter'),
('tr-tool-converter-ar-desc','tool','tool-converter','ar','description','حوّل بين وحدات الطول والوزن ودرجات الحرارة.'),
('tr-tool-converter-en-desc','tool','tool-converter','en','description','Convert length, weight and temperature units.'),
('tr-tool-age-ar-title','tool','tool-age','ar','title','حاسبة العمر'),
('tr-tool-age-en-title','tool','tool-age','en','title','Age calculator'),
('tr-tool-age-ar-desc','tool','tool-age','ar','description','اعرف عمرك بالتفصيل انطلاقاً من تاريخ ميلادك.'),
('tr-tool-age-en-desc','tool','tool-age','en','description','Calculate your age from your date of birth.'),
('tr-tool-image-ar-title','tool','tool-image','ar','title','تغيير أبعاد الصورة'),
('tr-tool-image-en-title','tool','tool-image','en','title','Image resizer'),
('tr-tool-image-ar-desc','tool','tool-image','ar','description','غيّر أبعاد الصورة محلياً مع الحفاظ على التناسب.'),
('tr-tool-image-en-desc','tool','tool-image','en','description','Resize images locally while preserving their aspect ratio.'),
('tr-tool-filehash-ar-title','tool','tool-filehash','ar','title','بصمة الملفات'),
('tr-tool-filehash-en-title','tool','tool-filehash','en','title','File checksum'),
('tr-tool-filehash-ar-desc','tool','tool-filehash','ar','description','احسب SHA-256 أو SHA-384 أو SHA-512 للتحقق من الملفات.'),
('tr-tool-filehash-en-desc','tool','tool-filehash','en','description','Calculate SHA-256, SHA-384 or SHA-512 file checksums.'),
('tr-tool-base64-ar-title','tool','tool-base64','ar','title','ترميز Base64'),
('tr-tool-base64-en-title','tool','tool-base64','en','title','Base64 encoder'),
('tr-tool-base64-ar-desc','tool','tool-base64','ar','description','رمّز النصوص وفك ترميز Base64 مع دعم العربية.'),
('tr-tool-base64-en-desc','tool','tool-base64','en','description','Encode and decode Base64 with UTF-8 support.'),
('tr-tool-textcase-ar-title','tool','tool-textcase','ar','title','تحويل حالة النص'),
('tr-tool-textcase-en-title','tool','tool-textcase','en','title','Text case converter'),
('tr-tool-textcase-ar-desc','tool','tool-textcase','ar','description','حوّل الأحرف الإنجليزية أو اعكس ترتيب النص.'),
('tr-tool-textcase-en-desc','tool','tool-textcase','en','description','Convert English letter case or reverse text.'),
('tr-tool-urlcodec-ar-title','tool','tool-urlcodec','ar','title','ترميز الروابط'),
('tr-tool-urlcodec-en-title','tool','tool-urlcodec','en','title','URL encoder / decoder'),
('tr-tool-urlcodec-ar-desc','tool','tool-urlcodec','ar','description','رمّز الروابط والنصوص وفك الترميز محلياً.'),
('tr-tool-urlcodec-en-desc','tool','tool-urlcodec','en','description','Encode and decode URL text locally.'),
('tr-tool-uuid-ar-title','tool','tool-uuid','ar','title','مولّد UUID'),
('tr-tool-uuid-en-title','tool','tool-uuid','en','title','UUID generator'),
('tr-tool-uuid-ar-desc','tool','tool-uuid','ar','description','أنشئ معرّفات فريدة باستخدام العشوائية الآمنة.'),
('tr-tool-uuid-en-desc','tool','tool-uuid','en','description','Generate unique identifiers with secure randomness.'),
('tr-tool-lines-ar-title','tool','tool-lines','ar','title','منظّم الأسطر'),
('tr-tool-lines-en-title','tool','tool-lines','en','title','Line organizer'),
('tr-tool-lines-ar-desc','tool','tool-lines','ar','description','نظّف القوائم واحذف التكرار ورتّب الأسطر.'),
('tr-tool-lines-en-desc','tool','tool-lines','en','description','Clean lists, remove duplicates and sort lines.');

INSERT OR IGNORE INTO content_pages (id,slug,content_type,status,published_at) VALUES
('page-services','services','service','published',CURRENT_TIMESTAMP),
('page-learning','learning','page','published',CURRENT_TIMESTAMP),
('page-resources','resources','page','published',CURRENT_TIMESTAMP),
('page-about','about','page','published',CURRENT_TIMESTAMP),
('page-help','help','page','published',CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO translations (id,entity_type,entity_id,locale,field_name,value) VALUES
('tr-services-ar-title','page','page-services','ar','title','الخدمات الرقمية'),
('tr-services-en-title','page','page-services','en','title','Digital services'),
('tr-learning-ar-title','page','page-learning','ar','title','التعلم والمعرفة'),
('tr-learning-en-title','page','page-learning','en','title','Learning & knowledge'),
('tr-resources-ar-title','page','page-resources','ar','title','الموارد والملفات'),
('tr-resources-en-title','page','page-resources','en','title','Resources & files'),
('tr-about-ar-title','page','page-about','ar','title','عن ADAH'),
('tr-about-en-title','page','page-about','en','title','About ADAH'),
('tr-help-ar-title','page','page-help','ar','title','المساعدة'),
('tr-help-en-title','page','page-help','en','title','Help');

-- Record this API-applied migration in the project-owned ledger.
INSERT OR IGNORE INTO adah_schema_migrations (migration_name)
VALUES ('0003_seed_public_catalog.sql');
