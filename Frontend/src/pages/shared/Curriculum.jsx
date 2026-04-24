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
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 20 }}>
                <h2>📚 Curriculum Management</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select 
                        value={filterYear} 
                        onChange={e => setFilterYear(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                        {availableYears.map(yr => <option key={yr} value={yr}>{yr} Curriculum</option>)}
                    </select>
                    {canManage && (
                        <button className={styles.actionButton} onClick={() => setShowTemplateModal(true)} style={{ backgroundColor: '#10b981' }}>
                            📥 Load Premade Curriculum
                        </button>
                    )}
                    {canManage && (
                        <button className={styles.actionButton} onClick={openAddModal}>
                            + Add Subject to Curriculum
                        </button>
                    )}
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th>Program</th>
                                <th>Year & Sem</th>
                                <th>Code</th>
                                <th>Title</th>
                                <th>Units</th>
                                <th>Prerequisites</th>
                                {canManage && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCurriculums.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px 0' }}>{c.program}</td>
                                    <td>{c.year_level} - {c.semester}</td>
                                    <td><strong>{c.course_code}</strong></td>
                                    <td>{c.course_title}</td>
                                    <td>{c.units}</td>
                                    <td>{c.prerequisites || 'None'}</td>
                                    {canManage && (
                                        <td>
                                            <button onClick={() => openEditModal(c)} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                                            <button onClick={() => handleDelete(c.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredCurriculums.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>No subjects found for this curriculum year.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' }}>{editMode ? '✏️ Edit Subject' : '✨ Add Curriculum Subject'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <input style={inputStyle} placeholder="Curriculum Year (e.g. 2024-2025)" value={form.curriculum_year} onChange={e => setForm({...form, curriculum_year: e.target.value})} required title="Curriculum Year" />
                                <input style={inputStyle} placeholder="Program (e.g. BSIT)" value={form.program} onChange={e => setForm({...form, program: e.target.value})} required />
                            </div>
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <input style={{...inputStyle, flex: 1}} placeholder="Year Level" value={form.year_level} onChange={e => setForm({...form, year_level: e.target.value})} required />
                                <input style={{...inputStyle, flex: 1}} placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
                            </div>
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <input style={inputStyle} placeholder="Code (ITEW6)" value={form.course_code} onChange={e => setForm({...form, course_code: e.target.value})} required />
                                <input style={inputStyle} type="number" placeholder="Units" value={form.units} onChange={e => setForm({...form, units: e.target.value})} required />
                            </div>
                            <input style={inputStyle} placeholder="Descriptive Title" value={form.course_title} onChange={e => setForm({...form, course_title: e.target.value})} required />
                            <input style={inputStyle} placeholder="Prerequisites (Optional)" value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} />
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseOver={e => e.target.style.backgroundColor = '#e2e8f0'} onMouseOut={e => e.target.style.backgroundColor = '#f1f5f9'}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }} onMouseOver={e => e.target.style.backgroundColor = '#2563eb'} onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}>Save Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showTemplateModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' }}>📚 Load Premade Curriculum</h3>
                        <p style={{ marginBottom: '20px', color: '#475569', fontSize: '0.95rem' }}>Select a 4-year curriculum template to bulk-add to the database. These can be edited anytime later.</p>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#475569' }}>Curriculum Year:</label>
                            <input style={inputStyle} value={templateYear} onChange={e => setTemplateYear(e.target.value)} placeholder="e.g. 2024-2025" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => handleLoadTemplate('BSIT')} style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Load 4-Year BSIT Curriculum</button>
                            <button onClick={() => handleLoadTemplate('BSCS')} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Load 4-Year BSCS Curriculum</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button onClick={() => setShowTemplateModal(false)} style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Curriculum;
