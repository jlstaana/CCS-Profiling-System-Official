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

const Curriculum = () => {
    const { user } = useAuth();
    const canManage = user?.role === 'admin';
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        program: 'BSIT',
        year_level: '1st Year',
        semester: 'First Semester',
        course_code: '',
        course_title: '',
        units: 3,
        prerequisites: ''
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/curriculums', form);
            setShowModal(false);
            setForm({
                ...form,
                course_code: '',
                course_title: '',
                prerequisites: ''
            });
            fetchCurriculums();
        } catch (e) {
            alert('Failed to add curriculum');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>📚 Curriculum Management</h2>
                {canManage && (
                    <button className={styles.actionButton} onClick={() => setShowModal(true)}>
                        + Add Subject to Curriculum
                    </button>
                )}
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
                            {curriculums.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px 0' }}>{c.program}</td>
                                    <td>{c.year_level} - {c.semester}</td>
                                    <td><strong>{c.course_code}</strong></td>
                                    <td>{c.course_title}</td>
                                    <td>{c.units}</td>
                                    <td>{c.prerequisites || 'None'}</td>
                                    {canManage && (
                                        <td>
                                            <button onClick={() => handleDelete(c.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {curriculums.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>No subjects found in curriculum.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' }}>✨ Add Curriculum Subject</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <input style={inputStyle} placeholder="Program (e.g. BSIT)" value={form.program} onChange={e => setForm({...form, program: e.target.value})} required />
                                <input style={inputStyle} placeholder="Year Level" value={form.year_level} onChange={e => setForm({...form, year_level: e.target.value})} required />
                            </div>
                            <input style={inputStyle} placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
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
        </div>
    );
};

export default Curriculum;
