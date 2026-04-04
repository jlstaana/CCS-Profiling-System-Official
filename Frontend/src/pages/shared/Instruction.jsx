import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICONS = { Syllabus: '📋', 'Lesson Plan': '📅', 'Lecture Slides': '📊', Assignment: '📝', 'Reference Material': '📚', 'Video Recording': '🎥' };

const Instruction = () => {
  const { user } = useAuth();
  const canUpload = user?.role === 'admin' || user?.role === 'faculty';

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matLoading, setMatLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Syllabus' });
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/courses');
      setCourses(res.data);
      if (res.data.length > 0 && !selectedCourse) {
        setSelectedCourse(res.data[0]);
        fetchMaterials(res.data[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMaterials = async (courseId) => {
    setMatLoading(true);
    try {
      const res = await axios.get(`/courses/${courseId}/materials`);
      setMaterials(res.data);
    } catch (e) { console.error(e); }
    finally { setMatLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchMaterials(course.id);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!selectedCourse) { setError('No course selected.'); return; }
    setSaving(true); setError('');
    try {
      await axios.post(`/courses/${selectedCourse.id}/materials`, {
        title: `[${form.type}] ${form.title}`,
        file_base64: fileBase64 || null,
      });
      setShowModal(false);
      setForm({ title: '', type: 'Syllabus' });
      setFileBase64('');
      setFileName('');
      fetchMaterials(selectedCourse.id);
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await axios.delete(`/materials/${id}`);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const getTypeIcon = (title) => {
    for (const [key, icon] of Object.entries(TYPE_ICONS)) {
      if (title.startsWith(`[${key}]`)) return icon;
    }
    return '📄';
  };

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.pageTitle}>Instruction &amp; Course Materials</h1>
        {canUpload && selectedCourse && (
          <button style={S.btn} onClick={() => { setError(''); setShowModal(true); }}>
            + Upload Material
          </button>
        )}
      </div>

      {loading ? (
        <div style={S.empty}>Loading courses…</div>
      ) : courses.length === 0 ? (
        <div style={S.empty}>No courses yet. An admin can add courses via the Scheduling page.</div>
      ) : (
        <div style={S.layout}>
          {/* Sidebar course list */}
          <div style={S.sidebar}>
            <div style={S.sidebarTitle}>Courses</div>
            {courses.map(c => (
              <div
                key={c.id}
                style={{ ...S.courseItem, backgroundColor: selectedCourse?.id === c.id ? '#1f2f70' : 'white', color: selectedCourse?.id === c.id ? 'white' : '#1f2f70' }}
                onClick={() => handleCourseSelect(c)}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.code}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{c.title}</div>
              </div>
            ))}
          </div>

          {/* Materials panel */}
          <div style={S.panel}>
            {selectedCourse && (
              <>
                <div style={S.panelHeader}>
                  <span style={{ fontWeight: 700, color: '#1f2f70', fontSize: 16 }}>{selectedCourse.code} — {selectedCourse.title}</span>
                  <span style={{ fontSize: 13, color: '#858796' }}>{materials.length} material{materials.length !== 1 ? 's' : ''}</span>
                </div>
                {matLoading ? (
                  <div style={S.empty}>Loading…</div>
                ) : materials.length === 0 ? (
                  <div style={S.empty}>No materials uploaded yet for this course.</div>
                ) : (
                  <div style={S.materialsList}>
                    {materials.map(m => (
                      <div key={m.id} style={S.materialRow}>
                        <div style={S.matIcon}>{getTypeIcon(m.title)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={S.matTitle}>{m.title}</div>
                          <div style={S.matMeta}>
                            Uploaded by {m.uploader?.name || 'Unknown'} · {new Date(m.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {m.file_base64 && (
                            <a href={m.file_base64} download={m.title} style={S.dlBtn}>⬇ Download</a>
                          )}
                          {canUpload && (
                            <button onClick={() => handleDelete(m.id)} style={S.delBtn}>🗑</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <h3 style={{ margin: 0 }}>Upload Material — {selectedCourse?.code}</h3>
              <button onClick={() => setShowModal(false)} style={S.close}>×</button>
            </div>
            <div style={S.modalBody}>
              {error && <div style={S.errBox}>{error}</div>}
              <div style={S.fg}>
                <label style={S.label}>Type</label>
                <select style={S.sel} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {Object.keys(TYPE_ICONS).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={S.fg}>
                <label style={S.label}>Title *</label>
                <input style={S.inp} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Week 1 Lecture" />
              </div>
              <div style={S.fg}>
                <label style={S.label}>File (optional)</label>
                <div style={S.fileZone} onClick={() => fileRef.current.click()}>
                  <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                  {fileName ? (
                    <span style={{ color: '#1f2f70', fontWeight: 500 }}>📎 {fileName}</span>
                  ) : (
                    <span style={{ color: '#858796' }}>Click to browse a file</span>
                  )}
                </div>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button onClick={() => setShowModal(false)} style={S.cancelBtn}>Cancel</button>
              <button onClick={handleUpload} style={S.saveBtn} disabled={saving}>{saving ? 'Uploading…' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 600, color: '#1f2f70', margin: 0 },
  btn: { padding: '9px 18px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  empty: { padding: 60, textAlign: 'center', color: '#858796' },
  layout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 },
  sidebar: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: 'fit-content' },
  sidebarTitle: { padding: '14px 16px', borderBottom: '1px solid #e3e6f0', fontWeight: 700, color: '#1f2f70', fontSize: 13, backgroundColor: '#f8f9fc' },
  courseItem: { padding: '12px 16px', borderBottom: '1px solid #e3e6f0', cursor: 'pointer', transition: 'background .2s' },
  panel: { backgroundColor: 'white', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', minHeight: 300 },
  panelHeader: { padding: '16px 20px', borderBottom: '1px solid #e3e6f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  materialsList: { padding: '8px 0' },
  materialRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid #f0f0f0' },
  matIcon: { fontSize: 24, width: 40, height: 40, backgroundColor: '#f8f9fc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  matTitle: { fontSize: 14, fontWeight: 500, marginBottom: 2 },
  matMeta: { fontSize: 12, color: '#858796' },
  dlBtn: { padding: '5px 12px', backgroundColor: 'transparent', color: '#1f2f70', border: '1px solid #1f2f70', borderRadius: 6, fontSize: 12, cursor: 'pointer', textDecoration: 'none' },
  delBtn: { padding: '5px 10px', backgroundColor: '#fee', color: '#e74a3b', border: '1px solid #f5c6cb', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: 14, width: '90%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e3e6f0' },
  close: { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#858796', lineHeight: 1 },
  modalBody: { padding: '18px 24px' },
  modalFoot: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #e3e6f0' },
  fg: { marginBottom: 14 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#5a5c69' },
  inp: { width: '100%', padding: '9px 12px', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' },
  sel: { width: '100%', padding: '9px 12px', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14 },
  errBox: { backgroundColor: '#fdecea', border: '1px solid #f5c6cb', color: '#842029', padding: '9px 12px', borderRadius: 7, marginBottom: 12, fontSize: 13 },
  fileZone: { border: '2px dashed #d1d3e2', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer' },
  saveBtn: { padding: '9px 20px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { padding: '9px 18px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14, cursor: 'pointer' },
};

export default Instruction;