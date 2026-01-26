import os

file_path = '/home/puujee/visa/app/[locale]/admin/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Inject useTranslations into EventsManager
events_comp = 'function EventsManager({ events, opportunities, onRefresh }: any) {'
if 'const t = useTranslations(\"admin\");' not in content[content.find(events_comp):content.find(events_comp)+200]:
    content = content.replace(events_comp, events_comp + '\n   const t = useTranslations(\"admin\");')

# 2. Inject useTranslations into ContentManager
content_comp = 'function ContentManager({ blogs, onRefresh }: any) {'
if 'const t = useTranslations(\"admin\");' not in content[content.find(content_comp):content.find(content_comp)+200]:
    content = content.replace(content_comp, content_comp + '\n   const t = useTranslations(\"admin\");')

# 3. Replace strings in EventsManager
# Tabs
content = content.replace('label=\"Events\"', 'label={t(\"events.tabs.event\")}')
content = content.replace('label=\"Jobs & Opps\"', 'label={t(\"events.tabs.opportunity\")}')
# Post button
content = content.replace('Post New {activeTab === \"event\" ? \"Event\" : \"Opportunity\"}', '{t(\"events.postNew\", { type: activeTab === \"event\" ? t(\"events.tabs.event\") : t(\"events.tabs.opportunity\") })}')
# Modal title
content = content.replace('formData.id ? \"Edit Item\" : \"Create Item\"', 'formData.id ? t(\"events.manage.edit\") : t(\"events.manage.create\")')
# Cover Image
content = content.replace('uppercase mb-2\">1. Cover Image</h4>', 'uppercase mb-2\">{t(\"events.manage.cover\")}</h4>')
content = content.replace('<p>Click to upload</p>', '<p>{t(\"events.manage.upload\")}</p>')
# Inputs
content = content.replace('label=\"Title (MN)\"', 'label={t(\"events.manage.titleMn\")}')
content = content.replace('label=\"Title (EN)\"', 'label={t(\"events.manage.titleEn\")}')
content = content.replace('label=\"Provider (MN)\"', 'label={t(\"events.manage.providerMn\")}')
content = content.replace('label=\"Provider (EN)\"', 'label={t(\"events.manage.providerEn\")}')
content = content.replace('label=\"Type (volunteer/internship/scholarship)\"', 'label={t(\"events.manage.type\")}')
content = content.replace('label=\"External Link\"', 'label={t(\"events.manage.externalLink\")}')
content = content.replace('label=\"Location (MN)\"', 'label={t(\"events.manage.locationMn\")}')
content = content.replace('label=\"Location (EN)\"', 'label={t(\"events.manage.locationEn\")}')
content = content.replace('label={activeTab === \"event\" ? \"Event Date\" : \"Deadline\"}', 'label={activeTab === \"event\" ? t(\"events.manage.eventDate\") : t(\"events.manage.deadline\")}')
content = content.replace('label=\"Category\"', 'label={t(\"events.manage.category\")}')
content = content.replace('label=\"Registration Link\"', 'label={t(\"events.manage.regLink\")}')
content = content.replace('label=\"Description (MN)\"', 'label={t(\"events.manage.descMn\")}')
content = content.replace('label=\"Description (EN)\"', 'label={t(\"events.manage.descEn\")}')
# Buttons
content = content.replace('\"Cancel\"</button>', '{t(\"events.manage.cancel\")}</button>')
content = content.replace('{loading ? \"Saving...\" : \"Save Now\"}', '{loading ? t(\"events.manage.saving\") : t(\"events.manage.save\")}')
# Table
content = content.replace('<th className=\"p-4\">Image</th>', '<th className=\"p-4\">{t(\"events.table.image\")}</th>')
content = content.replace('<th className=\"p-4\">Title</th>', '<th className=\"p-4\">{t(\"events.table.title\")}</th>')
content = content.replace('<th className=\"p-4\">Date/Deadline</th>', '<th className=\"p-4\">{t(\"events.table.date\")}</th>')
content = content.replace('<th className=\"p-4 text-right\">Actions</th>', '<th className=\"p-4 text-right\">{t(\"events.table.actions\")}</th>')

# 4. Replace strings in ContentManager
content = content.replace('<h2 className=\"text-xl font-bold text-slate-800\">Articles & Content</h2>', '<h2 className=\"text-xl font-bold text-slate-800\">{t(\"blog.title\")}</h2>')
content = content.replace('shadow-lg\">\n               <FaPlus /> Add Content\n            </button>', "shadow-lg\">\n               <FaPlus /> {t(\"blog.add\")}\n            </button>")
content = content.replace('Manage Article</h3>', '{t(\"blog.manage\")}</h3>')
content = content.replace('<p>Upload Image</p>', '<p>{t(\"blog.upload\")}</p>')
content = content.replace('label=\"Summary (MN)\"', 'label={t(\"blog.summaryMn\")}')
content = content.replace('label=\"Summary (EN)\"', 'label={t(\"blog.summaryEn\")}')
content = content.replace('label=\"Content (MN)\"', 'label={t(\"blog.contentMn\")}')
content = content.replace('label=\"Content (EN)\"', 'label={t(\"blog.contentEn\")}')
content = content.replace('text-white rounded-lg\">Save Article</button>', 'text-white rounded-lg\">{t(\"blog.save\")}</button>')
# Table in blog
content = content.replace('<th className=\"p-4\">Media</th>', '<th className=\"p-4\">{t(\"blog.table.media\")}</th>') # Need to check key
# Actually let's use events table keys for title/actions if possible or add to blog
# I have: "blog": { "title": ..., "add": ..., "manage": ..., "upload": ..., "titleMn": ..., "titleEn": ..., "summaryMn": ..., "summaryEn": ..., "contentMn": ..., "contentEn": ..., "save": ... }
# I'll add "table" to blog namespace in stats script later if needed.

with open(file_path, 'w') as f:
    f.write(content)
"
