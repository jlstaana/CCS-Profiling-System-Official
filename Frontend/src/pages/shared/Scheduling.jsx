import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS    = ['A', 'B', 'C'];
const PROGRAMS    = ['BSCS', 'BSIT'];

const COLORS = {
  '1st Year': '#4e73df',
  '2nd Year': '#1cc88a',
  '3rd Year': '#36b9cc',
  '4th Year': '#f6c23e',
};

const timeSlots = [
  '7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
];
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const BLANK = {
  course_id: '', day: 'Monday', time_start: '7:00 AM', time_end: '9:00 AM',
  room: '', year_level: '1st Year', section: 'A', program: 'BSCS',
};

const Scheduling = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'faculty';

  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);

  // ── Filters ──────────────────────────────────────────────
  const [filterProgram, setFilterProgram] = useState('');
  const [filterYear, setFilterYear]       = useState('');
  const [filterSection, setFilterSection] = useState('');

  // ── Schedule modal ────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(BLANK);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  // ── Course modal (Removed) ──────────────────────────────────

  /* ──────────────────────────────── data fetching */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, courseRes] = await Promise.all([
        axios.get('/schedules'),
        axios.get('/courses'),
      ]);
      setSchedules(schedRes.data);
      setCourses(courseRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  /* ──────────────────────────────── derived state */
  const visibleSchedules = schedules.filter(s => {
    if (filterProgram && s.program    !== filterProgram) return false;
    if (filterYear    && s.year_level !== filterYear)   return false;
    if (filterSection && s.section    !== filterSection) return false;
    return true;
  });

  // Sections that actually exist for the selected year/program (for filter dropdown)
  const availableSections = filterYear
    ? [...new Set(schedules.filter(s => s.year_level === filterYear).map(s => s.section).filter(Boolean))]
    : SECTIONS;

  const getSlot = (day, time) =>
    visibleSchedules.find(s => s.day === day && s.time_start === time);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  /* ──────────────────────────────── modal openers */
  const openNew = (day, time) => {
    if (!canEdit) return;
    setEditId(null);
    setForm({ ...BLANK, day, time_start: time });
    setError('');
    setShowModal(true);
  };

  const openEdit = (s) => {
    if (!canEdit) return;
    setEditId(s.id);
    setForm({
      course_id: s.course_id, day: s.day,
      time_start: s.time_start, time_end: s.time_end,
      room: s.room,
      year_level: s.year_level || '1st Year',
      section:    s.section    || 'A',
      program:    s.program    || 'BSCS',
    });
    setError('');
    setShowModal(true);
  };

  /* ──────────────────────────────── CRUD */
  const handleSave = async () => {
    if (!form.course_id) { setError('Please select a course.'); return; }
    if (!form.room.trim()) { setError('Room is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editId) await axios.delete(`/schedules/${editId}`);
      await axios.post(`/courses/${form.course_id}/schedules`, {
        day:        form.day,
        time_start: form.time_start,
        time_end:   form.time_end,
        room:       form.room,
        year_level: form.year_level,
        section:    form.section,
        program:    form.program,
      });
      setShowModal(false);
      fetchData();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save schedule.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await axios.delete(`/schedules/${editId}`);
      setShowModal(false);
      fetchData();
    } catch (e) { setError('Failed to delete.'); }
  };

  /* ──────────────────────────────── render */
  return (
    <div>
      {/* ── Header ── */}
      <div style={S.header}>
        <h1 style={S.pageTitle}>Class Scheduling</h1>
        {canEdit && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={S.btn}  onClick={() => openNew('Monday', '7:00 AM')}>+ Add Schedule</button>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={S.filters}>
        <div style={S.filterGroup}>
          <label style={S.filterLabel}>🎓 Program</label>
          <select
            id="filter-program"
            style={S.filterSel}
            value={filterProgram}
            onChange={e => setFilterProgram(e.target.value)}
          >
            <option value="">All Programs</option>
            {PROGRAMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={S.filterGroup}>
          <label style={S.filterLabel}>📅 Year Level</label>
          <select
            id="filter-year-level"
            style={S.filterSel}
            value={filterYear}
            onChange={e => { setFilterYear(e.target.value); setFilterSection(''); }}
          >
            <option value="">All Years</option>
            {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div style={S.filterGroup}>
          <label style={S.filterLabel}>🏷 Section</label>
          <select
            id="filter-section"
            style={S.filterSel}
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
          >
            <option value="">All Sections</option>
            {availableSections.map(s => <option key={s}>Section {s}</option>)}
          </select>
        </div>
        {(filterProgram || filterYear || filterSection) && (
          <button
            style={S.clearBtn}
            onClick={() => { setFilterProgram(''); setFilterYear(''); setFilterSection(''); }}
          >✕ Clear</button>
        )}
        {(filterProgram || filterYear) && (
          <div style={{ ...S.badge, backgroundColor: COLORS[filterYear] || '#999' }}>
            {filterProgram && `${filterProgram} `}{filterYear}{filterSection ? ` · Sec ${filterSection}` : ''}
          </div>
        )}
      </div>

      {/* ── Calendar Grid ── */}
      {loading ? (
        <div style={S.empty}>Loading schedule…</div>
      ) : (
        <div style={S.wrapper}>
          {/* Time column */}
          <div style={S.timesCol}>
            <div style={S.corner} />
            {timeSlots.map(t => <div key={t} style={S.timeCell}>{t}</div>)}
          </div>

          {/* Day columns */}
          {days.map(day => (
            <div key={day} style={S.dayCol}>
              <div style={S.dayHeader}>{day}</div>
              {timeSlots.map(time => {
                const slot   = getSlot(day, time);
                const course = slot ? courses.find(c => c.id === slot.course_id) : null;
                const color  = slot ? (COLORS[slot.year_level] || '#4e73df') : 'transparent';
                return (
                  <div
                    key={`${day}-${time}`}
                    id={`slot-${day}-${time.replace(/[: ]/g,'-')}`}
                    style={{ ...S.slotCell, backgroundColor: color, cursor: canEdit ? 'pointer' : slot ? 'default' : 'default' }}
                    onClick={() => slot ? openEdit(slot) : openNew(day, time)}
                  >
                    {slot && (
                      <div style={S.slotContent}>
                        <div style={S.slotCourse}>{course?.code || 'Course'}</div>
                        <div style={{ fontSize: 10.5, color: '#ffea00', fontWeight: 800, margin: '2px 0', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                          ⏰ {slot.time_start} - {slot.time_end}
                        </div>
                        <div style={S.slotMeta}>
                          {slot.program} {slot.year_level ? slot.year_level.replace(' Year', 'Y') : ''}{slot.section ? ` · §${slot.section}` : ''}
                        </div>
                        <div style={S.slotRoom}>{slot.room}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Schedule Modal ── */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <h3 style={{ margin: 0 }}>{editId ? 'Edit Schedule' : 'Add Schedule'}</h3>
              <button onClick={() => setShowModal(false)} style={S.close}>×</button>
            </div>
            <div style={S.modalBody}>
              {error && <div style={S.errBox}>{error}</div>}

              {/* Course */}
              <div style={S.fg}>
                <label style={S.label}>Course *</label>
                <select id="schedule-course" style={S.sel} value={form.course_id} onChange={set('course_id')}>
                  <option value="">Select course…</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                </select>
              </div>

              {/* Program, Year & Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
                <div style={S.fg}>
                  <label style={S.label}>Program *</label>
                  <select id="schedule-program" style={S.sel} value={form.program} onChange={set('program')}>
                    {PROGRAMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={S.fg}>
                  <label style={S.label}>Year Level *</label>
                  <select id="schedule-year" style={S.sel} value={form.year_level} onChange={set('year_level')}>
                    {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div style={S.fg}>
                  <label style={S.label}>Section *</label>
                  <select id="schedule-section" style={S.sel} value={form.section} onChange={set('section')}>
                    {SECTIONS.map(s => <option key={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>

              {/* Day & Room */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={S.fg}>
                  <label style={S.label}>Day</label>
                  <select id="schedule-day" style={S.sel} value={form.day} onChange={set('day')}>
                    {days.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div style={S.fg}>
                  <label style={S.label}>Room *</label>
                  <input id="schedule-room" style={S.inp} value={form.room} onChange={set('room')} placeholder="e.g. Room 301" />
                </div>
              </div>

              {/* Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={S.fg}>
                  <label style={S.label}>Start Time</label>
                  <select id="schedule-time-start" style={S.sel} value={form.time_start} onChange={set('time_start')}>
                    {timeSlots.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={S.fg}>
                  <label style={S.label}>End Time</label>
                  <select id="schedule-time-end" style={S.sel} value={form.time_end} onChange={set('time_end')}>
                    {timeSlots.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={S.modalFoot}>
              {editId && <button onClick={handleDelete} style={S.delBtn}>🗑 Delete</button>}
              <button onClick={() => setShowModal(false)} style={S.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={S.saveBtn} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div style={S.legend}>
        {YEAR_LEVELS.map(y => (
          <div key={y} style={S.legendItem}>
            <div style={{ ...S.legendDot, backgroundColor: COLORS[y] }} />
            <span>{y}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const S = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 16 },
  pageTitle:   { fontSize: 24, fontWeight: 600, color: '#1f2f70', margin: 0 },
  btn:         { padding: '9px 18px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  // Filter bar
  filters:     { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabel: { fontSize: 11, fontWeight: 600, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em' },
  filterSel:   { padding: '8px 12px', border: '1.5px solid #d1d3e2', borderRadius: 8, fontSize: 13, backgroundColor: 'white', cursor: 'pointer', minWidth: 150 },
  clearBtn:    { padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #d1d3e2', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#e74a3b', alignSelf: 'flex-end' },
  badge:       { padding: '6px 14px', borderRadius: 20, color: 'white', fontSize: 12, fontWeight: 700, alignSelf: 'flex-end' },
  // Grid
  empty:       { padding: 60, textAlign: 'center', color: '#858796' },
  wrapper:     { display: 'flex', backgroundColor: 'white', borderRadius: 12, overflow: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  timesCol:    { width: 90, flexShrink: 0, borderRight: '1px solid #e3e6f0' },
  corner:      { height: 50, borderBottom: '1px solid #e3e6f0', backgroundColor: '#f8f9fc' },
  timeCell:    { height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e3e6f0', fontSize: 11, fontWeight: 500, color: '#5a5c69' },
  dayCol:      { flex: 1, borderRight: '1px solid #e3e6f0', minWidth: 110 },
  dayHeader:   { height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e3e6f0', backgroundColor: '#f8f9fc', fontWeight: 600, color: '#1f2f70', fontSize: 13 },
  slotCell:    { height: 80, borderBottom: '1px solid #e3e6f0', padding: 6, transition: 'opacity .2s' },
  slotContent: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 },
  slotCourse:  { fontSize: 11, fontWeight: 700, color: 'white' },
  slotMeta:    { fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 600 },
  slotRoom:    { fontSize: 9,  color: 'rgba(255,255,255,0.75)' },
  // Modal
  overlay:     { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { backgroundColor: 'white', borderRadius: 14, width: '90%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto' },
  modalHead:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #e3e6f0' },
  close:       { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#858796', lineHeight: 1 },
  modalBody:   { padding: '18px 24px' },
  modalFoot:   { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #e3e6f0' },
  fg:          { marginBottom: 14 },
  label:       { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#5a5c69' },
  inp:         { width: '100%', padding: '9px 12px', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' },
  sel:         { width: '100%', padding: '9px 12px', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14 },
  errBox:      { backgroundColor: '#fdecea', border: '1px solid #f5c6cb', color: '#842029', padding: '9px 12px', borderRadius: 7, marginBottom: 12, fontSize: 13 },
  saveBtn:     { padding: '9px 20px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn:   { padding: '9px 18px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14, cursor: 'pointer' },
  delBtn:      { padding: '9px 16px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: 7, fontSize: 14, cursor: 'pointer', marginRight: 'auto' },
  // Legend
  legend:      { display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' },
  legendItem:  { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5a5c69' },
  legendDot:   { width: 12, height: 12, borderRadius: '50%' },
};

export default Scheduling;