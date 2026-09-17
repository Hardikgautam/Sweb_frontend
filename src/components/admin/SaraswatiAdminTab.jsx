// src/components/admin/SaraswatiAdminTab.jsx
// Saraswati AI knowledge base — everything the chatbot is allowed to say.
//
// Two ways in, as requested: type an entry directly, or upload a document
// (.pdf/.docx/.txt/.md/.csv) whose text is extracted server-side and split
// into retrieval-sized entries.
//
// The "Test a question" box runs retrieval only (no model call), so an admin
// can confirm coverage — and see the gaps — before parents hit them.

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  listKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  uploadKnowledgeFile,
  previewKnowledgeAnswer,
} from '../../api/knowledge';
import { getEngineStatus } from '../../api/chat';
import './SaraswatiAdminTab.css';

const CATEGORY_LABELS = {
  admissions: 'Admissions',
  fees: 'Fees & Scholarships',
  academics: 'Academics',
  facilities: 'Facilities',
  calendar: 'Calendar',
  transport: 'Transport',
  contact: 'Contact',
  policies: 'Policies',
  general: 'General',
};

const ACCEPTED = '.pdf,.docx,.txt,.md,.csv';

const BLANK_FORM = {
  title: '',
  category: 'general',
  content: '',
  tags: '',
  priority: 0,
  is_active: true,
};

function extractError(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

export default function SaraswatiAdminTab({ token, toast }) {
  const [docs, setDocs] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0 });
  const [categories, setCategories] = useState(Object.keys(CATEGORY_LABELS));
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState(BLANK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [uploadMeta, setUploadMeta] = useState({ category: 'general', tags: '', title: '' });
  const [uploading, setUploading] = useState(false);

  const [testQuestion, setTestQuestion] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (search.trim()) params.search = search.trim();
      const data = await listKnowledge(token, params);
      setDocs(data.items || []);
      setCounts({ total: data.total || 0, active: data.active || 0 });
      if (data.categories?.length) setCategories(data.categories);
    } catch (err) {
      toast?.(extractError(err, 'Could not load the knowledge base'), 'error');
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [token, filterCategory, search, toast]);

  useEffect(() => {
    // Debounce so typing in the search box doesn't hammer the API.
    const t = setTimeout(load, search ? 380 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    getEngineStatus(token).then(setEngine).catch(() => setEngine(null));
  }, [token]);

  // ── Create / update ──────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setFormError('');
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setForm({
      title: doc.title || '',
      category: doc.category || 'general',
      content: doc.content || '',
      tags: doc.tags || '',
      priority: doc.priority ?? 0,
      is_active: doc.is_active !== false,
    });
    setFormError('');
    document.getElementById('sar-kb-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.title.trim().length < 2) {
      setFormError('Give the entry a title of at least 2 characters.');
      return;
    }
    if (!form.content.trim()) {
      setFormError('Add the answer text — this is what Saraswati AI will say.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim(),
        tags: form.tags.trim() || null,
        priority: Number(form.priority) || 0,
        is_active: form.is_active,
      };
      if (editingId) {
        await updateKnowledge(token, editingId, payload);
        toast?.('Knowledge entry updated', 'success');
      } else {
        await createKnowledge(token, payload);
        toast?.('Knowledge entry added — Saraswati AI can use it now', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(extractError(err, 'Could not save this entry'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (doc) => {
    try {
      await updateKnowledge(token, doc.id, { is_active: !doc.is_active });
      toast?.(
        doc.is_active
          ? `"${doc.title}" is now hidden from Saraswati AI`
          : `"${doc.title}" is live for Saraswati AI`,
        'success',
      );
      load();
    } catch (err) {
      toast?.(extractError(err, 'Could not change this entry'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteKnowledge(token, confirmDelete.id);
      toast?.('Knowledge entry deleted', 'success');
      if (editingId === confirmDelete.id) resetForm();
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast?.(extractError(err, 'Could not delete this entry'), 'error');
    }
  };

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const created = await uploadKnowledgeFile(token, file, uploadMeta);
      toast?.(
        created.length === 1
          ? `Added 1 entry from ${file.name}`
          : `Added ${created.length} entries from ${file.name}`,
        'success',
      );
      setUploadMeta((m) => ({ ...m, title: '' }));
      load();
    } catch (err) {
      toast?.(extractError(err, 'Could not read that document'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = (e) => {
    const file = e.target.files?.[0];
    handleUpload(file);
    e.target.value = ''; // allow re-picking the same file
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // ── Test a question ──────────────────────────────────────────────────────
  const runTest = async (e) => {
    e.preventDefault();
    if (!testQuestion.trim() || testQuestion.trim().length < 2) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await previewKnowledgeAnswer(token, testQuestion.trim());
      setTestResult(res);
    } catch (err) {
      toast?.(extractError(err, 'Could not run that test'), 'error');
    } finally {
      setTesting(false);
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    docs.forEach((d) => {
      const key = d.category || 'general';
      (map[key] = map[key] || []).push(d);
    });
    return map;
  }, [docs]);

  return (
    <div className="sk-wrap">

      {/* ── Engine status ─────────────────────────────────────────────── */}
      <div className="sk-status-bar">
        <div className="sk-status-bar__main">
          <h2 className="sk-h2">Saraswati AI — Knowledge Base</h2>
          <p className="sk-sub">
            Everything the website chatbot is allowed to say. Type an answer, or upload a
            document and its text becomes searchable answers. Nothing else in the database
            is ever read into a reply.
          </p>
        </div>

        <div className="sk-status-chips">
          <span className="sk-chip">
            <strong>{counts.active}</strong> live
            {counts.total !== counts.active && <> / {counts.total} total</>}
          </span>
          {engine && (
            <span className={`sk-chip ${engine.llm_configured ? 'sk-chip--ok' : 'sk-chip--warn'}`}>
              {engine.llm_configured
                ? `AI answers on · ${engine.model || engine.provider}`
                : 'Knowledge-base answers only'}
            </span>
          )}
          {engine && (
            <span className={`sk-chip ${engine.google_signin_configured ? 'sk-chip--ok' : 'sk-chip--warn'}`}>
              {engine.google_signin_configured ? 'Google sign-in on' : 'Google sign-in off'}
            </span>
          )}
        </div>
      </div>

      {engine && !engine.llm_configured && (
        <div className="sk-callout">
          <strong>No AI key configured.</strong> Saraswati AI is answering by returning the
          closest knowledge entry, which works but reads less conversationally. Set{' '}
          <code>CHAT_LLM_PROVIDER</code> and <code>CHAT_LLM_API_KEY</code> on the backend to
          turn on generated answers. Every entry below is used either way.
        </div>
      )}

      <div className="sk-grid">

        {/* ── Left: add / edit + upload ──────────────────────────────── */}
        <div className="sk-col">

          <section className="sk-card" id="sar-kb-form">
            <header className="sk-card__head">
              <h3 className="sk-h3">{editingId ? 'Edit entry' : 'Add an answer'}</h3>
              {editingId && (
                <button type="button" className="sk-btn sk-btn--ghost" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </header>

            <form className="sk-form" onSubmit={handleSave}>
              <div className="sk-field">
                <label className="sk-label" htmlFor="sk-title">
                  Title / question <span aria-hidden="true">*</span>
                </label>
                <input
                  id="sk-title"
                  className="sk-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Admission process for 2027-28"
                  maxLength={255}
                />
                <p className="sk-help">
                  Words here carry the most weight when matching a parent's question.
                </p>
              </div>

              <div className="sk-row">
                <div className="sk-field">
                  <label className="sk-label" htmlFor="sk-category">Category</label>
                  <select
                    id="sk-category"
                    className="sk-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                    ))}
                  </select>
                </div>

                <div className="sk-field">
                  <label className="sk-label" htmlFor="sk-priority">Priority</label>
                  <input
                    id="sk-priority"
                    className="sk-input"
                    type="number"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  />
                  <p className="sk-help">Higher wins when two entries match equally.</p>
                </div>
              </div>

              <div className="sk-field">
                <label className="sk-label" htmlFor="sk-content">
                  Answer text <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="sk-content"
                  className="sk-input sk-textarea"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={'Write the facts plainly, as you would tell a parent.\n\ne.g. Admissions open on 1 November. Submit the enquiry form, attend a campus interaction, and bring the birth certificate and last report card.'}
                  rows={7}
                />
                <p className="sk-help">
                  Include the specifics — dates, amounts, class ranges. The chatbot will not
                  invent anything that is not written here.
                </p>
              </div>

              <div className="sk-field">
                <label className="sk-label" htmlFor="sk-tags">Extra keywords</label>
                <input
                  id="sk-tags"
                  className="sk-input"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="apply, enrol, join, registration, form"
                  maxLength={500}
                />
                <p className="sk-help">
                  Comma-separated. Add the words parents actually use that the answer text misses.
                </p>
              </div>

              <label className="sk-check">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span>Live — Saraswati AI may use this entry</span>
              </label>

              {formError && <p className="sk-form-error" role="alert">{formError}</p>}

              <div className="sk-actions">
                <button type="submit" className="sk-btn sk-btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add entry'}
                </button>
              </div>
            </form>
          </section>

          {/* ── Upload ────────────────────────────────────────────────── */}
          <section className="sk-card">
            <header className="sk-card__head">
              <h3 className="sk-h3">Upload a document</h3>
            </header>

            <div className="sk-form">
              <div className="sk-row">
                <div className="sk-field">
                  <label className="sk-label" htmlFor="sk-up-cat">Category</label>
                  <select
                    id="sk-up-cat"
                    className="sk-input"
                    value={uploadMeta.category}
                    onChange={(e) => setUploadMeta({ ...uploadMeta, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                    ))}
                  </select>
                </div>
                <div className="sk-field">
                  <label className="sk-label" htmlFor="sk-up-title">Title (optional)</label>
                  <input
                    id="sk-up-title"
                    className="sk-input"
                    value={uploadMeta.title}
                    onChange={(e) => setUploadMeta({ ...uploadMeta, title: e.target.value })}
                    placeholder="Defaults to the file name"
                  />
                </div>
              </div>

              <div className="sk-field">
                <label className="sk-label" htmlFor="sk-up-tags">Extra keywords (optional)</label>
                <input
                  id="sk-up-tags"
                  className="sk-input"
                  value={uploadMeta.tags}
                  onChange={(e) => setUploadMeta({ ...uploadMeta, tags: e.target.value })}
                  placeholder="prospectus, handbook, rules"
                />
              </div>

              <label
                className={`sk-drop${uploading ? ' is-busy' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <input
                  type="file"
                  accept={ACCEPTED}
                  onChange={onFileInput}
                  disabled={uploading}
                  className="sk-drop__input"
                />
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="sk-drop__title">
                  {uploading ? 'Reading the document…' : 'Drop a file here, or click to choose'}
                </span>
                <span className="sk-drop__hint">PDF, Word (.docx), text, Markdown or CSV · up to 10 MB</span>
              </label>

              <p className="sk-help">
                The text is extracted and long documents are split into several entries, so each
                one answers a focused question. Scanned image-only PDFs cannot be read — type
                those in instead.
              </p>
            </div>
          </section>

          {/* ── Test ──────────────────────────────────────────────────── */}
          <section className="sk-card">
            <header className="sk-card__head">
              <h3 className="sk-h3">Test a question</h3>
            </header>

            <form className="sk-form" onSubmit={runTest}>
              <div className="sk-field">
                <div className="sk-inline">
                  <input
                    className="sk-input"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    placeholder="What are the fees for class 5?"
                    maxLength={500}
                    aria-label="Question to test"
                  />
                  <button type="submit" className="sk-btn sk-btn--primary" disabled={testing || !testQuestion.trim()}>
                    {testing ? 'Testing…' : 'Test'}
                  </button>
                </div>
                <p className="sk-help">
                  Shows what the chatbot would retrieve. No AI credits are used.
                </p>
              </div>
            </form>

            {testResult && (
              <div className="sk-test">
                {testResult.has_grounding ? (
                  <p className="sk-test__verdict sk-test__verdict--ok">
                    Covered — Saraswati AI can answer this.
                  </p>
                ) : (
                  <p className="sk-test__verdict sk-test__verdict--gap">
                    Not covered. The chatbot will say it doesn't know and offer a human.
                    Add an entry above for this topic.
                  </p>
                )}

                {testResult.matched_entries?.length > 0 && (
                  <ol className="sk-test__list">
                    {testResult.matched_entries.map((m) => (
                      <li key={m.id}>
                        <span className="sk-test__score">{m.score}</span>
                        <span className="sk-test__title">{m.title}</span>
                        <span className="sk-test__cat">{CATEGORY_LABELS[m.category] || m.category}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {testResult.published_data_used?.length > 0 && (
                  <p className="sk-test__note">
                    Also using live website data: {testResult.published_data_used.join(' · ')}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ── Right: the corpus ─────────────────────────────────────────── */}
        <div className="sk-col">
          <section className="sk-card sk-card--list">
            <header className="sk-card__head sk-card__head--stack">
              <h3 className="sk-h3">Entries ({docs.length})</h3>
              <div className="sk-filters">
                <input
                  className="sk-input sk-input--sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entries…"
                  aria-label="Search knowledge entries"
                />
                <select
                  className="sk-input sk-input--sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                  ))}
                </select>
              </div>
            </header>

            {loading ? (
              <div className="sk-list">
                {[0, 1, 2, 3].map((i) => <div key={i} className="sk-skel" />)}
              </div>
            ) : docs.length === 0 ? (
              <div className="sk-empty">
                <p><strong>No entries yet.</strong></p>
                <p>
                  Saraswati AI currently answers only from live website data (fees, subjects,
                  calendar, news). Add entries — or upload the prospectus — so it can handle
                  admissions questions, timings, uniform, transport and policies too.
                </p>
              </div>
            ) : (
              <div className="sk-list">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div className="sk-group" key={cat}>
                    <h4 className="sk-group__title">
                      {CATEGORY_LABELS[cat] || cat}
                      <span className="sk-group__count">{items.length}</span>
                    </h4>

                    {items.map((doc) => (
                      <article
                        key={doc.id}
                        className={`sk-item${doc.is_active ? '' : ' is-inactive'}${editingId === doc.id ? ' is-editing' : ''}`}
                      >
                        <div className="sk-item__head">
                          <h5 className="sk-item__title">{doc.title}</h5>
                          <div className="sk-item__badges">
                            {doc.source_type === 'upload' && (
                              <span className="sk-badge" title={doc.file_name || 'Uploaded'}>file</span>
                            )}
                            {doc.priority > 0 && (
                              <span className="sk-badge sk-badge--pri">P{doc.priority}</span>
                            )}
                            {!doc.is_active && <span className="sk-badge sk-badge--off">hidden</span>}
                          </div>
                        </div>

                        <p className="sk-item__excerpt">
                          {doc.content.length > 190 ? `${doc.content.slice(0, 190)}…` : doc.content}
                        </p>

                        {doc.tags && <p className="sk-item__tags">{doc.tags}</p>}

                        <div className="sk-item__actions">
                          <button type="button" className="sk-btn sk-btn--ghost sk-btn--xs" onClick={() => startEdit(doc)}>
                            Edit
                          </button>
                          <button type="button" className="sk-btn sk-btn--ghost sk-btn--xs" onClick={() => toggleActive(doc)}>
                            {doc.is_active ? 'Hide' : 'Make live'}
                          </button>
                          <button type="button" className="sk-btn sk-btn--danger sk-btn--xs" onClick={() => setConfirmDelete(doc)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Delete confirmation ───────────────────────────────────────── */}
      {confirmDelete && (
        <div
          className="sk-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div className="sk-modal" role="dialog" aria-modal="true" aria-labelledby="sk-del-title">
            <h3 className="sk-h3" id="sk-del-title">Delete this entry?</h3>
            <p className="sk-modal__body">
              <strong>{confirmDelete.title}</strong> will be removed permanently. Saraswati AI
              will no longer be able to answer questions from it.
            </p>
            <div className="sk-modal__actions">
              <button type="button" className="sk-btn sk-btn--ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button type="button" className="sk-btn sk-btn--danger" onClick={handleDelete}>
                Delete entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
