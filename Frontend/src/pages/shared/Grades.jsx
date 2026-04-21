import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Dashboard.module.css';

const Grades = () => {
    const { user } = useAuth();
    const canEncode = user?.role === 'faculty';
    const [grades, setGrades] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [form, setForm] = useState({
        student_id: '',
        course_id: '',
        grade: '',
        remarks: '',
        semester: 'First Semester',
        academic_year: '2023-2024'
    });

    const fetchData = async () => {
        try {
            const [gradesRes, coursesRes, usersRes] = await Promise.all([
                axios.get('/grades'),
                canEncode ? axios.get('/courses') : Promise.resolve({ data: [] }),
                canEncode ? axios.get('/admin/users') : Promise.resolve({ data: [] })
            ]);
            setGrades(gradesRes.data);
            if (canEncode) {
                setCourses(coursesRes.data);
                setStudents(usersRes.data.filter(u => u.role === 'student'));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/grades', form);
            setShowModal(false);
            setForm({ ...form, student_id: '', course_id: '', grade: '', remarks: '' });
            fetchData();
        } catch (e) {
            alert('Failed to encode grade');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this grade?')) return;
        try {
            await axios.delete(`/grades/${id}`);
            fetchData();
        } catch (e) {
            alert('Delete failed');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>📝 Grades Management</h2>
                {canEncode && (
                    <button className={styles.actionButton} onClick={() => setShowModal(true)}>
                        + Encode Grade
                    </button>
                )}
            </div>

            {loading ? <p>Loading...</p> : (
                <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                {user?.role !== 'student' && <th>Student</th>}
                                <th>Subject</th>
                                <th>Grade</th>
                                <th>Remarks</th>
                                <th>Sem & Year</th>
                                <th>Faculty</th>
                                {canEncode && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map(g => (
                                <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                                    {user?.role !== 'student' && <td style={{ padding: '10px 0' }}>{g.student?.name}</td>}
                                    <td>{g.course?.code} - {g.course?.title}</td>
                                    <td><strong>{g.grade}</strong></td>
                                    <td>{g.remarks}</td>
                                    <td>{g.semester} ({g.academic_year})</td>
                                    <td>{g.faculty?.name}</td>
                                    {canEncode && (
                                        <td>
                                            <button onClick={() => handleDelete(g.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {grades.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>No grades recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 400 }}>
                        <h3>Encode Grade</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required style={{ padding: 8 }}>
                                <option value="">Select Student</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course || 'No Course'})</option>)}
                            </select>
                            
                            <select value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} required style={{ padding: 8 }}>
                                <option value="">Select Subject</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                            </select>

                            <input placeholder="Grade (e.g. 1.0, 1.25)" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} required style={{ padding: 8 }} />
                            <input placeholder="Remarks (Passed, Failed)" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} style={{ padding: 8 }} />
                            <input placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required style={{ padding: 8 }} />
                            <input placeholder="Academic Year" value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} required style={{ padding: 8 }} />
                            
                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <button type="submit" className={styles.actionButton}>Save Grade</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: 8 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grades;
