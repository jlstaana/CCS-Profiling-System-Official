import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Dashboard.module.css';

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
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 400 }}>
                        <h3>Add Subject</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input placeholder="Program (e.g. BSIT)" value={form.program} onChange={e => setForm({...form, program: e.target.value})} required />
                            <input placeholder="Year Level" value={form.year_level} onChange={e => setForm({...form, year_level: e.target.value})} required />
                            <input placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
                            <input placeholder="Course Code" value={form.course_code} onChange={e => setForm({...form, course_code: e.target.value})} required />
                            <input placeholder="Course Title" value={form.course_title} onChange={e => setForm({...form, course_title: e.target.value})} required />
                            <input type="number" placeholder="Units" value={form.units} onChange={e => setForm({...form, units: e.target.value})} required />
                            <input placeholder="Prerequisites (Optional)" value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} />
                            
                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <button type="submit" className={styles.actionButton}>Save</button>
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Curriculum;
