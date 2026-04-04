import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EVENT_TYPES = ['academic', 'lecture', 'career', 'workshop', 'social'];

const TYPE_COLORS = {
  academic:  '#4e73df',
  lecture:   '#1cc88a',
  career:    '#f6c23e',
  workshop:  '#36b9cc',
  social:    '#e74a3b',
};

const BLANK = { title: '', description: '', type: 'social', location: '', start_at: '', end_at: '' };

const Events = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'faculty';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'calendar'

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/events');
      setEvents(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const openNew = () => {
    setEditEvent(null);
    setForm(BLANK);
    setError('');
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setEditEvent(ev);
    setForm({
      title:       ev.title,
      description: ev.description || '',
      type:        ev.type,
      location:    ev.location || '',
      start_at:    ev.start_at?.slice(0, 16) || '',
      end_at:      ev.end_at?.slice(0, 16) || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.start_at) { setError('Start date/time is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editEvent) {
        await axios.put(`/events/${editEvent.id}`, form);
      } else {
        await axios.post('/events', form);
      }
      setShowModal(false);
      fetchEvents();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save event.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!editEvent || !window.confirm(`Delete "${editEvent.title}"?`)) return;
    try {
      await axios.delete(`/events/${editEvent.id}`);
      setShowModal(false);
      fetchEvents();
    } catch (e) { setError(e.response?.data?.message || 'Delete failed.'); }
  };

  // Group events by date for calendar-style list
  const groupedByDate = events.reduce((acc, ev) => {
    const key = new Date(ev.start_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.pageTitle}>Events &amp; Calendar</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ ...S.viewBtn, ...(view === 'list' ? S.viewBtnActive : {}) }} onClick={() => setView('list')}>☰ List</button>
          <button style={{ ...S.viewBtn, ...(view === 'calendar' ? S.viewBtnActive : {}) }} onClick={() => setView('calendar')}>📅 Calendar</button>
          {canCreate && (
            <button style={S.addBtn} onClick={openNew}>+ Create Event</button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={S.legend}>
        {EVENT_TYPES.map(t => (
          <div key={t} style={S.legendItem}>
            <div style={{ ...S.dot, backgroundColor: TYPE_COLORS[t] }} />
            <span style={{ fontSize: 13, textTransform: 'capitalize', color: '#5a5c69' }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={S.empty}>Loading events…</div>
      ) : events.length === 0 ? (
        <div style={S.empty}>No events scheduled. {canCreate ? 'Create the first one!' : ''}</div>
      ) : view === 'list' ? (
        /* ── List View ── */
        <div style={S.eventList}>
          {events.map(ev => (
            <div key={ev.id} style={{ ...S.eventCard, borderLeftColor: TYPE_COLORS[ev.type] || '#858796' }}>
              <div style={{ ...S.typeDot, backgroundColor: TYPE_COLORS[ev.type] || '#858796' }} />
              <div style={{ flex: 1 }}>
                <div style={S.eventTitle}>{ev.title}</div>
                <div style={S.eventMeta}>
                  {ev.location && <span>📍 {ev.location} &nbsp;·&nbsp;</span>}
                  <span>🕐 {new Date(ev.start_at).toLocaleString()}</span>
                  {ev.end_at && <span> – {new Date(ev.end_at).toLocaleString()}</span>}
                </div>
                {ev.description && <div style={S.eventDesc}>{ev.description}</div>}
                <div style={S.eventFooter}>
                  <span style={{ ...S.typeBadge, backgroundColor: TYPE_COLORS[ev.type] + '20', color: TYPE_COLORS[ev.type] }}>{ev.type}</span>
                  <span style={{ fontSize: 12, color: '#858796' }}>by {ev.creator?.name}</span>
                </div>
              </div>
              {(canCreate || ev.created_by === user?.id) && (
                <button style={S.editBtn} onClick={() => openEdit(ev)}>Edit</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── Calendar-grouped View ── */
        <div>
          {Object.entries(groupedByDate).map(([date, evs]) => (
            <div key={date} style={S.dayGroup}>
              <div style={S.dayLabel}>{date}</div>
              {evs.map(ev => (
                <div key={ev.id} style={{ ...S.calCard, backgroundColor: TYPE_COLORS[ev.type] || '#858796' }}
                  onClick={() => canCreate && openEdit(ev)}>
                  <div style={S.calTitle}>{ev.title}</div>
                  {ev.location && <div style={S.calMeta}>📍 {ev.location}</div>}
                  <div style={S.calMeta}>🕐 {new Date(ev.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <h3 style={{ margin: 0 }}>{editEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setShowModal(false)} style={S.close}>×</button>
            </div>
            <div style={S.modalBody}>
              {error && <div style={S.errBox}>{error}</div>}
              <div style={S.fg}>
                <label style={S.label}>Title *</label>
                <input style={S.inp} value={form.title} onChange={set('title')} placeholder="Event title" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={S.fg}>
                  <label style={S.label}>Type</label>
                  <select style={S.sel} value={form.type} onChange={set('type')}>
                    {EVENT_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div style={S.fg}>
                  <label style={S.label}>Location</label>
                  <input style={S.inp} value={form.location} onChange={set('location')} placeholder="e.g. Room 201" />
                </div>
                <div style={S.fg}>
                  <label style={S.label}>Start *</label>
                  <input style={S.inp} type="datetime-local" value={form.start_at} onChange={set('start_at')} />
                </div>
                <div style={S.fg}>
                  <label style={S.label}>End</label>
                  <input style={S.inp} type="datetime-local" value={form.end_at} onChange={set('end_at')} />
                </div>
              </div>
              <div style={S.fg}>
                <label style={S.label}>Description</label>
                <textarea style={{ ...S.inp, resize: 'vertical', minHeight: 80 }} value={form.description} onChange={set('description')} placeholder="Optional description…" />
              </div>
            </div>
            <div style={S.modalFoot}>
              {editEvent && <button onClick={handleDelete} style={S.delBtn}>🗑 Delete</button>}
              <button onClick={() => setShowModal(false)} style={S.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={S.saveBtn} disabled={saving}>
                {saving ? 'Saving…' : editEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 600, color: '#1f2f70', margin: 0 },
  viewBtn: { padding: '7px 14px', border: '1px solid #d1d3e2', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'white', color: '#5a5c69' },
  viewBtnActive: { backgroundColor: '#1f2f70', color: 'white', border: '1px solid #1f2f70' },
  addBtn: { padding: '9px 18px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  legend: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, backgroundColor: 'white', padding: '12px 16px', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: '50%' },
  empty: { padding: 60, textAlign: 'center', color: '#858796' },
  eventList: { display: 'flex', flexDirection: 'column', gap: 12 },
  eventCard: { backgroundColor: 'white', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: '4px solid #858796' },
  typeDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5 },
  eventTitle: { fontWeight: 600, color: '#1f2f70', fontSize: 15, marginBottom: 4 },
  eventMeta: { fontSize: 13, color: '#858796', marginBottom: 6 },
  eventDesc: { fontSize: 13, color: '#5a5c69', marginBottom: 8 },
  eventFooter: { display: 'flex', alignItems: 'center', gap: 12 },
  typeBadge: { padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },
  editBtn: { padding: '6px 14px', backgroundColor: '#1f2f70', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', flexShrink: 0 },
  dayGroup: { marginBottom: 24 },
  dayLabel: { fontSize: 14, fontWeight: 700, color: '#1f2f70', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid #e3e6f0' },
  calCard: { borderRadius: 8, padding: '10px 14px', marginBottom: 8, cursor: 'pointer', color: 'white' },
  calTitle: { fontWeight: 600, fontSize: 14, marginBottom: 3 },
  calMeta: { fontSize: 12, opacity: 0.9 },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: 14, width: '90%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e3e6f0' },
  close: { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#858796', lineHeight: 1 },
  modalBody: { padding: '18px 24px' },
  modalFoot: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #e3e6f0' },
  fg: { marginBottom: 14 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#5a5c69' },
  inp: { width: '100%', padding: '9px 12px', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' },
  sel: { width: '100%', padding: '9px 12px', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14 },
  errBox: { backgroundColor: '#fdecea', border: '1px solid #f5c6cb', color: '#842029', padding: '9px 12px', borderRadius: 7, marginBottom: 12, fontSize: 13 },
  saveBtn: { padding: '9px 20px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { padding: '9px 18px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: '1px solid #d1d3e2', borderRadius: 7, fontSize: 14, cursor: 'pointer' },
  delBtn: { padding: '9px 16px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: 7, fontSize: 14, cursor: 'pointer', marginRight: 'auto' },
};

export default Events;