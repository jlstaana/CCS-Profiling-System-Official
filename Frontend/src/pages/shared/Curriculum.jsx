import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Dashboard.module.css';

const inputStyle = {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

const bsitTemplate = [
    { program: 'BSIT', year_level: '1st Year', semester: 'First Semester', course_code: 'CC101', course_title: 'Introduction to Computing', units: 3, prerequisites: '' },
    { program: 'BSIT', year_level: '1st Year', semester: 'First Semester', course_code: 'CC102', course_title: 'Fundamentals of Programming', units: 3, prerequisites: '' },
    { program: 'BSIT', year_level: '1st Year', semester: 'Second Semester', course_code: 'CC103', course_title: 'Intermediate Programming', units: 3, prerequisites: 'CC102' },
    { program: 'BSIT', year_level: '1st Year', semester: 'Second Semester', course_code: 'IT101', course_title: 'IT Fundamentals', units: 3, prerequisites: '' },
    { program: 'BSIT', year_level: '2nd Year', semester: 'First Semester', course_code: 'CC104', course_title: 'Data Structures and Algorithms', units: 3, prerequisites: 'CC103' },
    { program: 'BSIT', year_level: '2nd Year', semester: 'First Semester', course_code: 'IT102', course_title: 'Object-Oriented Programming', units: 3, prerequisites: 'CC103' },
    { program: 'BSIT', year_level: '2nd Year', semester: 'Second Semester', course_code: 'CC105', course_title: 'Information Management', units: 3, prerequisites: '' },
    { program: 'BSIT', year_level: '2nd Year', semester: 'Second Semester', course_code: 'IT103', course_title: 'Networking 1', units: 3, prerequisites: 'IT101' },
    { program: 'BSIT', year_level: '3rd Year', semester: 'First Semester', course_code: 'IT104', course_title: 'Information Assurance and Security', units: 3, prerequisites: 'CC105' },
    { program: 'BSIT', year_level: '3rd Year', semester: 'First Semester', course_code: 'IT105', course_title: 'Database Systems', units: 3, prerequisites: 'CC105' },
    { program: 'BSIT', year_level: '3rd Year', semester: 'Second Semester', course_code: 'IT106', course_title: 'Systems Integration and Architecture', units: 3, prerequisites: 'IT104' },
    { program: 'BSIT', year_level: '3rd Year', semester: 'Second Semester', course_code: 'IT107', course_title: 'Web Systems and Technologies', units: 3, prerequisites: 'IT102' },
    { program: 'BSIT', year_level: '4th Year', semester: 'First Semester', course_code: 'IT108', course_title: 'Capstone Project 1', units: 3, prerequisites: '3rd Year Standing' },
    { program: 'BSIT', year_level: '4th Year', semester: 'Second Semester', course_code: 'IT109', course_title: 'Capstone Project 2', units: 3, prerequisites: 'IT108' },
    { program: 'BSIT', year_level: '4th Year', semester: 'Second Semester', course_code: 'IT110', course_title: 'Practicum (OJT)', units: 6, prerequisites: '4th Year Standing' },
];

const bscsTemplate = [
    { program: 'BSCS', year_level: '1st Year', semester: 'First Semester', course_code: 'CC101', course_title: 'Introduction to Computing', units: 3, prerequisites: '' },
    { program: 'BSCS', year_level: '1st Year', semester: 'First Semester', course_code: 'CC102', course_title: 'Fundamentals of Programming', units: 3, prerequisites: '' },
    { program: 'BSCS', year_level: '1st Year', semester: 'Second Semester', course_code: 'CC103', course_title: 'Intermediate Programming', units: 3, prerequisites: 'CC102' },
    { program: 'BSCS', year_level: '2nd Year', semester: 'First Semester', course_code: 'CC104', course_title: 'Data Structures and Algorithms', units: 3, prerequisites: 'CC103' },
    { program: 'BSCS', year_level: '2nd Year', semester: 'Second Semester', course_code: 'CS101', course_title: 'Discrete Structures 1', units: 3, prerequisites: '' },
    { program: 'BSCS', year_level: '3rd Year', semester: 'First Semester', course_code: 'CS102', course_title: 'Automata Theory and Formal Languages', units: 3, prerequisites: 'CS101' },
    { program: 'BSCS', year_level: '3rd Year', semester: 'Second Semester', course_code: 'CS103', course_title: 'Software Engineering 1', units: 3, prerequisites: 'CC104' },
    { program: 'BSCS', year_level: '4th Year', semester: 'First Semester', course_code: 'CS104', course_title: 'CS Thesis 1', units: 3, prerequisites: '3rd Year Standing' },
    { program: 'BSCS', year_level: '4th Year', semester: 'Second Semester', course_code: 'CS105', course_title: 'CS Thesis 2', units: 3, prerequisites: 'CS104' }
];


const Curriculum = () => {
    const { user } = useAuth();
    const canManage = user?.role === 'admin';
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        program: 'BSIT',
        year_level: '1st Year',
        semester: 'First Semester',
        course_code: '',
        course_title: '',
        units: 3,
        prerequisites: '',
        curriculum_year: '2024-2025'
    });
    const [filterYear, setFilterYear] = useState('2024-2025');
    const [templateYear, setTemplateYear] = useState('2024-2025');

    // Extract unique curriculum years from data for filter dropdown
    const availableYears = [...new Set(curriculums.map(c => c.curriculum_year).filter(Boolean))];
    if (!availableYears.includes('2024-2025')) availableYears.push('2024-2025');
    availableYears.sort().reverse();
    
    // Filter display data
    const filteredCurriculums = curriculums.filter(c => (c.curriculum_year || '2024-2025') === filterYear);

    const fetchCurriculums = async () => {
        try {
            const res = await axios.get('/curriculums');
            setCurriculums(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurriculums();
    }, []);

    const openAddModal = () => {
        setForm({
            program: 'BSIT',
            year_level: '1st Year',
            semester: 'First Semester',
            course_code: '',
            course_title: '',
            units: 3,
            prerequisites: '',
            curriculum_year: filterYear || '2024-2025'
        });
        setEditMode(false);
        setEditingId(null);
        setShowModal(true);
    };

    const openEditModal = (c) => {
        setForm({
            program: c.program,
            year_level: c.year_level,
            semester: c.semester,
            course_code: c.course_code,
            course_title: c.course_title,
            units: c.units,
            prerequisites: c.prerequisites || '',
            curriculum_year: c.curriculum_year || '2024-2025'
        });
        setEditingId(c.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode && editingId) {
                await axios.put(`/curriculums/${editingId}`, form);
            } else {
                await axios.post('/curriculums', form);
            }
            setShowModal(false);
            setEditMode(false);
            setEditingId(null);
            fetchCurriculums();
        } catch (e) {
            alert('Failed to save curriculum subject');
        }
    };

    const handleLoadTemplate = async (templateName) => {
        if (!window.confirm(`Are you sure you want to load the ${templateName} curriculum template? This will add standard subjects to the database.`)) return;
        setLoading(true);
        setShowTemplateModal(false);
        try {
            const template = templateName === 'BSIT' ? bsitTemplate : bscsTemplate;
            const subjectsPayload = template.map(subj => ({ ...subj, curriculum_year: templateYear }));
            await axios.post('/curriculums/bulk', { subjects: subjectsPayload });
            fetchCurriculums();
            alert(`${templateName} template loaded successfully!`);
        } catch (e) {
            alert('Failed to load template');
            console.error(e);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this from curriculum?')) return;
        try {
            await axios.delete(`/curriculums/${id}`);
            fetchCurriculums();
        } catch (e) {
            alert('Delete failed');
        }
    };

    return (
        <div style={{ padding: '24px 0', maxWidth: '1400px', margin: '0 auto' }}>
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
                .curr-row { transition: all 0.2s ease; border-bottom: 1px solid rgba(227, 230, 240, 0.8); }
                .curr-row:hover { background-color: #f8f9fc; transform: scale(1.002); }
                .curr-action-btn { transition: all 0.2s; position: relative; overflow: hidden; }
                .curr-action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
                .custom-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%235a5c69' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1f2f70', margin: '0 0 8px', letterSpacing: '-0.02em' }}>📚 Curriculum Management</h1>
                    <p style={{ color: '#858796', fontSize: '15px', margin: 0, fontWeight: 500 }}>
                        Design and manage academic programs, prerequisites, and course templates
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select 
                        value={filterYear} 
                        onChange={e => setFilterYear(e.target.value)}
                        className="custom-select"
                        style={{ padding: '12px 40px 12px 20px', borderRadius: '12px', border: '1px solid rgba(227, 230, 240, 0.8)', outline: 'none', fontSize: '14px', fontWeight: 700, color: '#1f2f70', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer' }}
                    >
                        {availableYears.map(yr => <option key={yr} value={yr}>{yr} Curriculum</option>)}
                    </select>
                    {canManage && (
                        <button className="curr-action-btn" onClick={() => setShowTemplateModal(true)} style={{ padding: '12px 20px', backgroundColor: 'linear-gradient(135deg, #10b981, #059669)', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                            <span style={{ fontSize: '18px' }}>📥</span> Load Template
                        </button>
                    )}
                    {canManage && (
                        <button className="curr-action-btn" onClick={openAddModal} style={{ padding: '12px 20px', backgroundColor: 'linear-gradient(135deg, #4e73df, #2e59d9)', background: '#4e73df', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(78, 115, 223, 0.3)' }}>
                            <span style={{ fontSize: '18px' }}>➕</span> Add Subject
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, flexDirection:'column', gap:12 }}>
                    <div style={{ width:40, height:40, border:'4px solid #e3e6f0', borderTopColor:'#4e73df', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                    <span style={{ color:'#858796', fontSize:14, fontWeight: 600 }}>Loading curriculum data...</span>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(227, 230, 240, 0.8)', overflow: 'hidden', animation: 'fadeUp 0.4s ease' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)', borderBottom: '1px solid rgba(227, 230, 240, 0.8)' }}>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year & Sem</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Details</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Units</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prerequisites</th>
                                    {canManage && <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCurriculums.map((c, i) => (
                                    <tr key={c.id} className="curr-row" style={{ animation: `fadeUp 0.3s ease both ${i * 0.03}s` }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', backgroundColor: c.program === 'BSIT' ? '#4e73df15' : '#36b9cc15', color: c.program === 'BSIT' ? '#4e73df' : '#36b9cc', border: `1px solid ${c.program === 'BSIT' ? '#4e73df30' : '#36b9cc30'}` }}>
                                                {c.program}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2f70' }}>{c.year_level}</div>
                                            <div style={{ fontSize: '12px', color: '#858796', fontWeight: 600 }}>{c.semester}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1f2f70', marginBottom: '2px' }}>{c.course_code}</div>
                                            <div style={{ fontSize: '13px', color: '#5a5c69', fontWeight: 500 }}>{c.course_title}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f8f9fc', color: '#1f2f70', fontWeight: 800, fontSize: '14px', border: '1px solid #e3e6f0' }}>
                                                {c.units}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {c.prerequisites ? (
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f6c23e', backgroundColor: '#f6c23e15', padding: '4px 10px', borderRadius: '8px', border: '1px solid #f6c23e40' }}>
                                                    {c.prerequisites}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#b7b9cc', fontStyle: 'italic' }}>None</span>
                                            )}
                                        </td>
                                        {canManage && (
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button onClick={() => openEditModal(c)} style={{ color: '#4e73df', border: 'none', background: '#4e73df15', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', marginRight: '8px', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = '#4e73df30'} onMouseOut={e => e.target.style.background = '#4e73df15'}>Edit</button>
                                                <button onClick={() => handleDelete(c.id)} style={{ color: '#e74a3b', border: 'none', background: '#e74a3b15', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = '#e74a3b30'} onMouseOut={e => e.target.style.background = '#e74a3b15'}>Delete</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {filteredCurriculums.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: '#858796' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1f2f70', marginBottom: '8px' }}>No Subjects Found</div>
                                            <div style={{ fontSize: '14px' }}>Try selecting a different curriculum year or adding new subjects.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(31, 47, 112, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'fadeUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: '#1f2f70', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                                {editMode ? '✏️ Edit Subject' : '✨ Add Subject'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#b7b9cc', cursor: 'pointer', padding: 0 }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Curriculum Year</label>
                                    <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. 2024-2025" value={form.curriculum_year} onChange={e => setForm({...form, curriculum_year: e.target.value})} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Program</label>
                                    <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. BSIT" value={form.program} onChange={e => setForm({...form, program: e.target.value})} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Year Level</label>
                                    <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. 1st Year" value={form.year_level} onChange={e => setForm({...form, year_level: e.target.value})} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Semester</label>
                                    <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. First Semester" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Course Code</label>
                                    <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. CC101" value={form.course_code} onChange={e => setForm({...form, course_code: e.target.value})} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Units</label>
                                    <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} type="number" value={form.units} onChange={e => setForm({...form, units: e.target.value})} required />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Descriptive Title</label>
                                <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. Introduction to Computing" value={form.course_title} onChange={e => setForm({...form, course_title: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#858796', marginBottom: '6px', textTransform: 'uppercase' }}>Prerequisites</label>
                                <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0'}} placeholder="e.g. CC102 (Optional)" value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.backgroundColor = '#eaecf4'} onMouseOut={e => e.target.style.backgroundColor = '#f8f9fc'}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#4e73df', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(78, 115, 223, 0.3)' }} onMouseOver={e => e.target.style.filter = 'brightness(1.1)'} onMouseOut={e => e.target.style.filter = 'none'}>Save Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {showTemplateModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(31, 47, 112, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'fadeUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#1f2f70', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em' }}>📚 Load Premade</h3>
                            <button onClick={() => setShowTemplateModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#b7b9cc', cursor: 'pointer', padding: 0 }}>&times;</button>
                        </div>
                        <p style={{ margin: '0 0 24px 0', color: '#858796', fontSize: '14px', lineHeight: 1.5, fontWeight: 500 }}>
                            Select a standard 4-year curriculum template to bulk-add to the database. You can customize the subjects later.
                        </p>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#858796', textTransform: 'uppercase' }}>Target Curriculum Year</label>
                            <input style={{...inputStyle, backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0', padding: '14px'}} value={templateYear} onChange={e => setTemplateYear(e.target.value)} placeholder="e.g. 2024-2025" />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="curr-action-btn" onClick={() => handleLoadTemplate('BSIT')} style={{ padding: '16px', backgroundColor: 'linear-gradient(135deg, #4e73df, #2e59d9)', background: '#4e73df', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 15px rgba(78, 115, 223, 0.3)' }}>
                                Load BSIT Curriculum
                            </button>
                            <button className="curr-action-btn" onClick={() => handleLoadTemplate('BSCS')} style={{ padding: '16px', backgroundColor: 'linear-gradient(135deg, #36b9cc, #258391)', background: '#36b9cc', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 15px rgba(54, 185, 204, 0.3)' }}>
                                Load BSCS Curriculum
                            </button>
                        </div>
                        
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button onClick={() => setShowTemplateModal(false)} style={{ background: 'none', border: 'none', color: '#858796', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} onMouseOver={e => e.target.style.color = '#5a5c69'} onMouseOut={e => e.target.style.color = '#858796'}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Curriculum;
