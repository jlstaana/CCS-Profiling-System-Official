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

    // Faculty encoding view
    const [isEncoding, setIsEncoding] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [semester, setSemester] = useState('First Semester');
    const [academicYear, setAcademicYear] = useState('2023-2024');
    const [batchGrades, setBatchGrades] = useState({});
    const [saving, setSaving] = useState(false);

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

    // Helper to calculate grade based on parts
    const calculateFinal = (p, m, f) => {
        const parts = [p, m, f].filter(val => val !== '' && val !== null && !isNaN(val));
        if (parts.length === 0) return '';
        const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
        return (sum / parts.length).toFixed(2);
    };

    const getRemarks = (avg) => {
        if (!avg) return '';
        const grade = parseFloat(avg);
        // Assuming 1.0 to 5.0 scale where lower is better
        if (grade <= 3.0 && grade >= 1.0) return 'Passed';
        if (grade > 3.0 && grade <= 5.0) return 'Failed';
        // Zero-based grading scale typically uses 50% as passing
        if (grade >= 50) return 'Passed';
        return 'Failed';
    };

    const handleGradeChange = (studentId, field, value) => {
        setBatchGrades(prev => {
            const current = prev[studentId] || { prelim: '', midterm: '', finals: '' };
            const updated = { ...current, [field]: value };
            return { ...prev, [studentId]: updated };
        });
    };

    const prepareBatchData = () => {
        const payload = [];
        students.forEach(student => {
            const data = batchGrades[student.id];
            if (data && (data.prelim || data.midterm || data.finals)) {
                payload.push({
                    student_id: student.id,
                    prelim: data.prelim || null,
                    midterm: data.midterm || null,
                    finals: data.finals || null
                });
            }
        });
        return payload;
    };

    const handleBatchSave = async () => {
        if (!selectedCourse) {
            alert('Please select a subject first.');
            return;
        }
        
        const payloadGrades = prepareBatchData();
        if (payloadGrades.length === 0) {
            alert('No grades entered to save.');
            return;
        }

        setSaving(true);
        try {
            await axios.post('/grades/batch', {
                course_id: selectedCourse,
                semester,
                academic_year: academicYear,
                grades: payloadGrades
            });
            alert('Grades saved successfully!');
            setIsEncoding(false);
            fetchData();
        } catch (e) {
            alert('Failed to save batch grades');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    // Load existing grades into batchGrades when encoding setup changes
    useEffect(() => {
        if (isEncoding && selectedCourse) {
            const loadedGrades = {};
            students.forEach(student => {
                const existing = grades.find(g => 
                    g.student_id === student.id && 
                    g.course_id == selectedCourse && 
                    g.semester === semester && 
                    g.academic_year === academicYear
                );
                
                loadedGrades[student.id] = {
                    prelim: existing?.prelim || '',
                    midterm: existing?.midterm || '',
                    finals: existing?.finals || '',
                };
            });
            setBatchGrades(loadedGrades);
        }
    }, [isEncoding, selectedCourse, semester, academicYear]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>📝 Grades Management</h2>
                {canEncode && !isEncoding && (
                    <button className={styles.actionButton} onClick={() => setIsEncoding(true)}>
                        + Encode Grades (Batch)
                    </button>
                )}
                {canEncode && isEncoding && (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className={styles.actionButton} onClick={handleBatchSave} disabled={saving} style={{ backgroundColor: '#1cc88a' }}>
                            {saving ? 'Saving...' : 'Save All Grades'}
                        </button>
                        <button className={styles.actionButton} onClick={() => setIsEncoding(false)} style={{ backgroundColor: '#858796' }}>
                            View Records
                        </button>
                    </div>
                )}
            </div>

            {loading ? <p>Loading...</p> : (
                isEncoding && canEncode ? (
                    <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                        <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
                            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d3e2' }}>
                                <option value="">-- Select Subject --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                            </select>
                            <input value={semester} onChange={e => setSemester(e.target.value)} placeholder="Semester" style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d3e2' }} />
                            <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="Academic Year" style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d3e2' }} />
                        </div>

                        {selectedCourse ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                                    <thead style={{ backgroundColor: '#f8f9fc' }}>
                                        <tr>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Student Name</th>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Program</th>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Prelim</th>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Midterm</th>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Finals</th>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Computed Rating</th>
                                            <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => {
                                            const sGrades = batchGrades[student.id] || { prelim: '', midterm: '', finals: '' };
                                            const computed = calculateFinal(sGrades.prelim, sGrades.midterm, sGrades.finals);
                                            const rem = getRemarks(computed);
                                            return (
                                                <tr key={student.id} style={{ borderBottom: '1px solid #e3e6f0' }}>
                                                    <td style={{ padding: 12 }}><strong>{student.name}</strong></td>
                                                    <td style={{ padding: 12 }}>{student.course || 'N/A'}</td>
                                                    <td style={{ padding: 12 }}>
                                                        <input type="number" step="0.01" value={sGrades.prelim} onChange={e => handleGradeChange(student.id, 'prelim', e.target.value)} style={{ width: 70, padding: 6, borderRadius: 4, border: '1px solid #d1d3e2' }} />
                                                    </td>
                                                    <td style={{ padding: 12 }}>
                                                        <input type="number" step="0.01" value={sGrades.midterm} onChange={e => handleGradeChange(student.id, 'midterm', e.target.value)} style={{ width: 70, padding: 6, borderRadius: 4, border: '1px solid #d1d3e2' }} />
                                                    </td>
                                                    <td style={{ padding: 12 }}>
                                                        <input type="number" step="0.01" value={sGrades.finals} onChange={e => handleGradeChange(student.id, 'finals', e.target.value)} style={{ width: 70, padding: 6, borderRadius: 4, border: '1px solid #d1d3e2' }} />
                                                    </td>
                                                    <td style={{ padding: 12, fontWeight: 'bold' }}>{computed}</td>
                                                    <td style={{ padding: 12, color: rem === 'Passed' ? 'green' : (rem === 'Failed' ? 'red' : 'inherit') }}>{rem}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#858796', fontStyle: 'italic' }}>
                                Please select a subject to load the student list.
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                            <thead style={{ backgroundColor: '#f8f9fc' }}>
                                <tr>
                                    {user?.role !== 'student' && <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Student Name</th>}
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Subject</th>
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Prelim</th>
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Midterm</th>
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Finals</th>
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Rating</th>
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Remarks</th>
                                    <th style={{ padding: 12, borderBottom: '2px solid #e3e6f0' }}>Sem & Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map(g => (
                                    <tr key={g.id} style={{ borderBottom: '1px solid #e3e6f0' }}>
                                        {user?.role !== 'student' && <td style={{ padding: 12 }}>{g.student?.name}</td>}
                                        <td style={{ padding: 12 }}>{g.course?.code}</td>
                                        <td style={{ padding: 12 }}>{g.prelim || '-'}</td>
                                        <td style={{ padding: 12 }}>{g.midterm || '-'}</td>
                                        <td style={{ padding: 12 }}>{g.finals || '-'}</td>
                                        <td style={{ padding: 12 }}><strong>{g.grade || '-'}</strong></td>
                                        <td style={{ padding: 12, color: g.remarks === 'Passed' ? 'green' : (g.remarks === 'Failed' ? 'red' : 'inherit') }}>{g.remarks || '-'}</td>
                                        <td style={{ padding: 12, fontSize: '0.9em', color: '#858796' }}>{g.semester} ({g.academic_year})</td>
                                    </tr>
                                ))}
                                {grades.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: 20 }}>No grades recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default Grades;
