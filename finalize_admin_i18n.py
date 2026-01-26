import os

file_path = '/home/puujee/visa/app/[locale]/admin/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Unified replacements for modals and managers
replaces = [
    # ApplicationDetailsModal
    ('text-2xl font-black">Application Details</h3>', 'text-2xl font-black">{t("modals.application.title")}</h3>'),
    ('Settings size={14} /> Full Control', 'Settings size={14} /> {t("modals.application.fullControl")}'),
    ('uppercase tracking-widest">Email</p>', 'uppercase tracking-widest">{t("modals.application.email")}</p>'),
    ('uppercase tracking-widest">Phone</p>', 'uppercase tracking-widest">{t("modals.application.phone")}</p>'),
    ('uppercase tracking-widest">Age</p>', 'uppercase tracking-widest">{t("modals.application.age")}</p>'),
    ('uppercase tracking-widest">Level</p>', 'uppercase tracking-widest">{t("modals.application.level")}</p>'),
    ('Detailed student profile not yet completed.', '{t("modals.application.notCompleted")}'),
    ('<User size={14} /> Personal Details', '<User size={14} /> {t("modals.application.personal")}'),
    ('<MapPin size={14} /> Address & Contact', '<MapPin size={14} /> {t("modals.application.address")}'),
    ('<Baby size={14} /> Experience', '<Baby size={14} /> {t("modals.application.experience")}'),
    ('uppercase">Ages</p>', 'uppercase">{t("modals.application.ages")}</p>'),
    ('<Heart size={14} /> Motivation Letter', '<Heart size={14} /> {t("modals.application.motivation")}'),
    ('No motivation provided.', '{t("modals.application.noMotivation")}'),

    # UserMasterManagementModal
    ('bg-emerald-100 text-emerald-700 px-2 py-1 rounded inline-block w-fit font-bold">Uploaded</span>', 'bg-emerald-100 text-emerald-700 px-2 py-1 rounded inline-block w-fit font-bold">{t("modals.master.uploaded")}</span>'),
    ('bg-slate-200 text-slate-500 px-2 py-1 rounded font-bold">Not Provided</span>', 'bg-slate-200 text-slate-500 px-2 py-1 rounded font-bold">{t("modals.master.notProvided")}</span>'),
    ('label="Direct URL Link"', 'label={t("modals.master.directUrl")}'),
    ('placeholder="Paste URL to change..."', 'placeholder={t("modals.master.pasteUrl")}'),
    ('text-[#E31B23] tracking-widest">Internal Review</h4>', 'text-[#E31B23] tracking-widest">{t("modals.master.internal")}</h4>'),
    ('uppercase mb-1">Reviewed By</p>', 'uppercase mb-1">{t("modals.master.reviewedBy")}</p>'),
    ('Not reviewed yet', '{t("modals.master.notReviewed")}'),
    ('uppercase mb-1">Approval Date</p>', 'uppercase mb-1">{t("modals.master.approvalDate")}</p>'),
    ('Discard Changes', '{t("modals.master.discard")}'),
    ('Save Master Record', '{t("modals.master.saveMaster")}'),
    ('uppercase text-slate-400">Address Info</p>', 'uppercase text-slate-400">{t("modals.master.addressInfo")}</p>'),

    # EventsManager / ContentManager leftovers
    ('">Cancel</button>', '">{t("events.manage.cancel")}</button>'),
    ('Upload failed.', '{t("events.manage.uploadFailed")}') # key check
]

for old, new in replaces:
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
"
