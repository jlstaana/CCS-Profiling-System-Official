import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all',       label: 'All Results', icon: '🔍' },
  { id: 'academic',  label: 'Academic',    icon: '📚' },
  { id: 'social',    label: 'Social Hub',  icon: '💬' },
  { id: 'events',    label: 'Events',      icon: '🎉' },
  { id: 'people',    label: 'People',      icon: '👥' },
];

const Search = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Initialize query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setQuery(q);
  }, [location.search]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => runSearch(), 400);
    return () => clearTimeout(timer);
  }, [query, category]);

  const runSearch = async () => {
    setLoading(true);
    const combined = [];
    const q = query.toLowerCase();

    try {
      // 1. People Section
      if (category === 'all' || category === 'people') {
        const res = await axios.get('/admin/users');
        res.data.filter(u => 
          u.name.toLowerCase().includes(q) || 
          (u.email || '').toLowerCase().includes(q) ||
          (u.department || '').toLowerCase().includes(q) ||
          (u.specialization || '').toLowerCase().includes(q)
        ).forEach(u => combined.push({
          id: `user-${u.id}`,
          type: 'people',
          icon: u.role === 'faculty' ? '👨‍🏫' : u.role === 'admin' ? '👑' : '🎓',
          color: u.role === 'faculty' ? '#4e73df' : u.role === 'admin' ? '#e74a3b' : '#1cc88a',
          title: u.name,
          subtitle: `${u.role} · ${u.department || 'CCS'}`,
          description: u.specialization || u.bio || u.email,
          tags: [u.role, u.department, u.specialization].filter(Boolean),
          data: u
        }));
      }

      // 2. Academic Section (Courses & Materials)
      if (category === 'all' || category === 'academic') {
        const res = await axios.get('/courses');
        res.data.filter(c => 
          c.code.toLowerCase().includes(q) || 
          c.title.toLowerCase().includes(q) ||
          'academic'.includes(q)
        ).forEach(c => combined.push({
          id: `course-${c.id}`,
          type: 'academic',
          icon: '📚',
          color: '#f6c23e',
          title: `${c.code}: ${c.title}`,
          subtitle: `Course · ${c.materials?.length || 0} Materials`,
          description: `Manage academic progress for ${c.code}.`,
          tags: ['academic', c.code],
          data: c
        }));
      }

      // 3. Social Section (Posts & Groups)
      if (category === 'all' || category === 'social') {
        const [postsRes, groupsRes] = await Promise.all([
          axios.get('/social/posts'),
          axios.get('/social/study-groups')
        ]);

        // Filter Posts
        postsRes.data.filter(p => 
          (p.content || '').toLowerCase().includes(q) ||
          (p.user?.name || '').toLowerCase().includes(q) ||
          'social sports music community'.includes(q)
        ).forEach(p => combined.push({
          id: `post-${p.id}`,
          type: 'social',
          icon: '📢',
          color: '#4e73df',
          title: p.user?.name,
          subtitle: `Social Post · ${new Date(p.created_at).toLocaleDateString()}`,
          description: p.content?.substring(0, 100) + (p.content?.length > 100 ? '...' : ''),
          tags: ['social', 'post'],
          data: p
        }));

        // Filter Groups
        groupsRes.data.filter(g => 
          g.name.toLowerCase().includes(q) ||
          (g.agenda || '').toLowerCase().includes(q)
        ).forEach(g => combined.push({
          id: `group-${g.id}`,
          type: 'social',
          icon: '👥',
          color: '#36b9cc',
          title: g.name,
          subtitle: `Study Group · ${g.members?.length || 0} Members`,
          description: g.agenda,
          tags: ['social', 'study-group', g.course].filter(Boolean),
          data: g
        }));
      }

      // 4. Events Section
      if (category === 'all' || category === 'events') {
        const res = await axios.get('/events');
        res.data.filter(e => 
          e.title.toLowerCase().includes(q) || 
          (e.description || '').toLowerCase().includes(q) ||
          (e.type || '').toLowerCase().includes(q) ||
          'sports social academic conference'.includes(q)
        ).forEach(e => combined.push({
          id: `event-${e.id}`,
          type: 'events',
          icon: e.type === 'sports' ? '⚽' : '🎉',
          color: '#e74a3b',
          title: e.title,
          subtitle: `${e.type?.toUpperCase()} · ${new Date(e.start_at).toLocaleDateString()}`,
          description: e.description,
          tags: ['event', e.type, e.location].filter(Boolean),
          data: e
        }));
      }

    } catch (err) {
      console.error('Search failed', err);
    }

    setResults(combined);
    setLoading(false);
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.pageTitle}>Global Search</h1>
        <p style={{ color: '#858796', margin: '4px 0 0' }}>Find anything across the CSS community hive.</p>
      </div>

      <div style={S.searchBox}>
        <span style={S.searchIcon}>🔍</span>
        <input
          style={S.searchInput}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search sports, academic, people, or events..."
          autoFocus
        />
        {query && <button style={S.clearBtn} onClick={() => { setQuery(''); setResults([]); }}>×</button>}
      </div>

      <div style={S.tabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            style={{ ...S.tab, ...(category === cat.id ? S.tabActive : {}) }}
            onClick={() => setCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={S.empty}>
          <div className="spinner" style={{ marginBottom: 12 }}>⏳</div>
          Indexing resources...
        </div>
      ) : query.length < 2 ? (
        <div style={S.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
          Enter at least 2 characters to start exploring.
        </div>
      ) : results.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
          No matches found for "<strong>{query}</strong>".
        </div>
      ) : (
        <>
          <div style={S.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''} found</div>
          <div style={S.resultsGrid}>
            {results.map(r => (
              <div key={r.id} style={S.card} onClick={() => setSelectedResult(r)}>
                <div style={{ ...S.cardIcon, backgroundColor: r.color + '15', color: r.color }}>
                  {r.icon}
                </div>
                <div style={S.cardContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={S.cardTitle}>{r.title}</h3>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: '#f8f9fc', borderRadius: 4, color: '#858796', fontWeight: 800, textTransform: 'uppercase' }}>
                      {r.type}
                    </span>
                  </div>
                  <p style={S.cardSubtitle}>{r.subtitle}</p>
                  <p style={S.cardDesc}>{r.description}</p>
                  <div style={S.tags}>
                    {r.tags.map((tag, i) => <span key={i} style={S.tag}>{tag}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedResult && (
        <div style={S.modalOverlay} onClick={() => setSelectedResult(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={{ ...S.modalIcon, backgroundColor: selectedResult.color + '15', color: selectedResult.color }}>
                {selectedResult.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={S.modalTitle}>{selectedResult.title}</h2>
                <p style={S.modalSubtitle}>{selectedResult.subtitle}</p>
              </div>
              <button style={S.closeBtnModal} onClick={() => setSelectedResult(null)}>×</button>
            </div>
            
            <div style={S.modalBody}>
              <div style={S.detailSection}>
                <h4 style={S.detailLabel}>Result Type</h4>
                <p style={S.detailValue}>{selectedResult.type.toUpperCase()}</p>
              </div>
              
              <div style={S.detailSection}>
                <h4 style={S.detailLabel}>Context & Details</h4>
                <p style={{ ...S.detailValue, lineHeight: 1.6 }}>{selectedResult.data?.content || selectedResult.data?.description || selectedResult.description || 'No additional details available.'}</p>
              </div>

              {selectedResult.data?.image_path && (
                <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden' }}>
                  <img src={selectedResult.data.image_path} alt="Post" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                </div>
              )}

              <div style={S.detailSection}>
                <h4 style={S.detailLabel}>Associated Tags</h4>
                <div style={S.tags}>
                  {selectedResult.tags.map((tag, i) => <span key={i} style={S.tag}>{tag}</span>)}
                </div>
              </div>

              <div style={S.infoBox}>
                ✨ {selectedResult.type === 'people' ? 'Click to visit their profile or send a message.' : 
                    selectedResult.type === 'social' ? 'Join the discussion in the Social Hub!' :
                    selectedResult.type === 'academic' ? 'Access full materials in the Academic section.' :
                    'Check for updates in the Events calendar.'}
              </div>
            </div>
            
            <div style={S.modalFooter}>
              <button style={S.closeActionBtn} onClick={() => setSelectedResult(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
  header: { marginBottom: 32 },
  pageTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#1f2f70', margin: 0, letterSpacing: '-0.02em' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: '16px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: 24, gap: 14, border: '1px solid #f0f2f5' },
  searchIcon: { fontSize: 24, color: '#4e73df' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '1.1rem', color: '#1f2f70', fontWeight: 500 },
  clearBtn: { background: 'none', border: 'none', fontSize: 24, color: '#b7b9cc', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  tabs: { display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' },
  tab: { padding: '10px 20px', border: '1px solid #e3e6f0', borderRadius: 14, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', backgroundColor: 'white', color: '#858796', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px' },
  tabActive: { backgroundColor: '#1f2f70', color: 'white', borderColor: '#1f2f70', boxShadow: '0 4px 12px rgba(31, 47, 112, 0.2)' },
  empty: { textAlign: 'center', padding: '100px 20px', color: '#b7b9cc', fontSize: '1.1rem', fontWeight: 500 },
  resultCount: { fontSize: '0.85rem', color: '#858796', marginBottom: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', gap: 18, cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid #f8f9fc' },
  cardIcon: { width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 },
  cardContent: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2f70', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardSubtitle: { fontSize: '0.8rem', fontWeight: 700, color: '#4e73df', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardDesc: { fontSize: '0.95rem', color: '#5a5c69', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { padding: '4px 10px', backgroundColor: '#f8f9fc', color: '#1f2f70', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(31, 47, 112, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: 20 },
  modal: { backgroundColor: 'white', borderRadius: 24, width: '100%', maxWidth: 550, boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'modalSlideIn 0.3s ease-out' },
  modalHeader: { padding: '32px 32px 24px', display: 'flex', alignItems: 'center', gap: 20, borderBottom: '1px solid #f8f9fc' },
  modalIcon: { width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 },
  modalTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#1f2f70', margin: 0 },
  modalSubtitle: { fontSize: '0.95rem', color: '#858796', margin: '4px 0 0', fontWeight: 500 },
  closeBtnModal: { background: 'none', border: 'none', fontSize: 32, color: '#b7b9cc', cursor: 'pointer', padding: 0 },
  modalBody: { padding: 32 },
  detailSection: { marginBottom: 24 },
  detailLabel: { fontSize: '0.7rem', fontWeight: 800, color: '#b7b9cc', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px' },
  detailValue: { fontSize: '1.1rem', color: '#2e3b4e', margin: 0, fontWeight: 500 },
  infoBox: { padding: 18, backgroundColor: '#f8f9fc', borderRadius: 14, color: '#1f2f70', fontSize: '0.95rem', fontWeight: 600, borderLeft: '5px solid #4e73df' },
  modalFooter: { padding: '20px 32px', backgroundColor: '#f8f9fc', display: 'flex', justifyContent: 'flex-end' },
  closeActionBtn: { padding: '12px 28px', backgroundColor: '#1f2f70', color: 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' },
};

export default Search;