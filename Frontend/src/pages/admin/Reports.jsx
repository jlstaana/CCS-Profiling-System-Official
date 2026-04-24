import React, { useState, useEffect } from 'react';
import axios from 'axios';

/* ── tiny helpers ─────────────────────────────────────── */
const fmt = (n) => (n ?? 0).toLocaleString();

const gradeOrder = ['1.00','1.25','1.50','1.75','2.00','2.25','2.50','2.75','3.00','5.00'];

function downloadCSV(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
}

/* ── stat card ────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    background: `linear-gradient(135deg, ${color}18, ${color}08)`,
    border: `1.5px solid ${color}30`,
    borderRadius: 16, padding: '20px 22px',
    display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 180px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 24, flexShrink: 0, boxShadow: `0 4px 12px ${color}40`,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1f2f70', lineHeight: 1 }}>{fmt(value)}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#5a5c69', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#858796', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

/* ── mini bar ─────────────────────────────────────────── */
const Bar = ({ label, val, max, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#5a5c69', marginBottom: 4 }}>
      <span>{label}</span><span style={{ color }}>{val}</span>
    </div>
    <div style={{ height: 8, borderRadius: 99, background: '#e9ecef', overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 99, width: `${Math.round((val / (max||1)) * 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, transition: 'width .6s ease' }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════ */
const Reports = () => {
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [grades,      setGrades]      = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [generating,  setGenerating]  = useState('');
  const [toast,       setToast]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, uRes, gRes, cRes] = await Promise.all([
          axios.get('/admin/dashboard-stats'),
          axios.get('/admin/users'),
          axios.get('/grades'),
          axios.get('/courses'),
        ]);
        setStats(sRes.data);
        setUsers(uRes.data);
        setGrades(gRes.data);
        setCourses(cRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ── derived numbers ── */
  const students    = users.filter(u => u.role === 'student');
  const faculty     = users.filter(u => u.role === 'faculty');
  const regular     = students.filter(u => u.studentProfile?.student_status === 'Regular').length;
  const irregular   = students.filter(u => u.studentProfile?.student_status === 'Irregular').length;

  // Grade distribution
  const gradeDist = {};
  gradeOrder.forEach(g => { gradeDist[g] = 0; });
  grades.forEach(g => { if (g.grade && gradeDist[g.grade] !== undefined) gradeDist[g.grade]++; });
  const maxGradeCt = Math.max(...Object.values(gradeDist), 1);

  // Passed / Failed
  const passed = grades.filter(g => g.remarks === 'PASSED').length;
  const failed = grades.filter(g => g.remarks === 'FAILED').length;

  // Enrollments per course
  const enrollByCourse = {};
  courses.forEach(c => { enrollByCourse[c.code] = 0; });
  grades.forEach(g => { if (g.course?.code) enrollByCourse[g.course.code] = (enrollByCourse[g.course.code] || 0) + 1; });
  const maxEnroll = Math.max(...Object.values(enrollByCourse), 1);

  // Program split
  const bsit = students.filter(u => u.course === 'BSIT').length;
  const bscs = students.filter(u => u.course === 'BSCS').length;

  /* ── CSV generators ── */
  const dlUsers = async () => {
    setGenerating('users');
    downloadCSV(
      `Users_Report_${new Date().toISOString().split('T')[0]}.csv`,
      ['ID','Name','Email','Role','Department','Course','Year','Status','Joined'],
      users.map(u => [
        u.user_id || u.id, `"${u.name}"`, `"${u.email}"`,
        u.role, u.department || '', u.course || '', u.year || '',
        u.studentProfile?.student_status || '',
        new Date(u.created_at).toLocaleDateString()
      ])
    );
    showToast('✅ Users report downloaded!');
    setGenerating('');
  };

  const dlGrades = async () => {
    setGenerating('grades');
    downloadCSV(
      `Grades_Report_${new Date().toISOString().split('T')[0]}.csv`,
      ['Student','Course','Prelim','Midterm','Finals','Grade','Remarks','Semester','AY'],
      grades.map(g => [
        `"${g.student?.name || ''}"`, g.course?.code || '',
        g.prelim ?? '', g.midterm ?? '', g.finals ?? '',
        g.grade || '', g.remarks || '', g.semester || '', g.academic_year || ''
      ])
    );
    showToast('✅ Grades report downloaded!');
    setGenerating('');
  };

  const dlEnrollments = async () => {
    setGenerating('enrollments');
    downloadCSV(
      `Enrollment_Report_${new Date().toISOString().split('T')[0]}.csv`,
      ['Student ID','Student Name','Course Code','Semester','Academic Year'],
      grades.map(g => [
        g.student?.user_id || g.student_id || '',
        `"${g.student?.name || ''}"`, g.course?.code || '',
        g.semester || '', g.academic_year || ''
      ])
    );
    showToast('✅ Enrollment report downloaded!');
    setGenerating('');
  };

  const dlFaculty = async () => {
    setGenerating('faculty');
    downloadCSV(
      `Faculty_Report_${new Date().toISOString().split('T')[0]}.csv`,
      ['Faculty ID','Name','Email','Department','Specialization','Joined'],
      faculty.map(f => [
        f.user_id || f.id, `"${f.name}"`, `"${f.email}"`,
        f.department || '', f.specialization || '',
        new Date(f.created_at).toLocaleDateString()
      ])
    );
    showToast('✅ Faculty report downloaded!');
    setGenerating('');
  };

  /* ── report card defs ── */
  const reportCards = [
    {
      id: 'users', icon: '👥', label: 'User Activity Report',
      desc: 'All users: students, faculty, and admins with profile details.',
      color: '#4e73df', action: dlUsers, badge: fmt(users.length) + ' users',
    },
    {
      id: 'grades', icon: '📊', label: 'Grades Report',
      desc: 'Complete grade records with prelim, midterm, finals, and transmuted ratings.',
      color: '#1cc88a', action: dlGrades, badge: fmt(grades.length) + ' records',
    },
    {
      id: 'enrollments', icon: '📋', label: 'Enrollment Report',
      desc: 'Student course enrollment data by semester and academic year.',
      color: '#36b9cc', action: dlEnrollments, badge: fmt(grades.length) + ' entries',
    },
    {
      id: 'faculty', icon: '🎓', label: 'Faculty Report',
      desc: 'Faculty roster with department, specialization, and contact info.',
      color: '#f6c23e', action: dlFaculty, badge: fmt(faculty.length) + ' faculty',
    },
  ];

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, flexDirection:'column', gap:12 }}>
      <div style={{ width:40, height:40, border:'4px solid #e3e6f0', borderTopColor:'#4e73df', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <span style={{ color:'#858796', fontSize:14 }}>Loading analytics…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: '4px 0' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .rpt-card { animation: fadeUp .35s ease both; }
        .rpt-btn:hover { opacity: .88; transform: translateY(-1px); }
        .rpt-btn { transition: all .2s; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:20, right:24, zIndex:9999,
          background:'#1f2f70', color:'white', padding:'12px 20px',
          borderRadius:10, fontWeight:600, fontSize:14,
          boxShadow:'0 8px 24px rgba(0,0,0,0.18)', animation:'fadeUp .25s ease',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#1f2f70', margin:'0 0 4px' }}>📈 System Reports</h1>
        <p style={{ color:'#858796', fontSize:13.5, margin:0 }}>
          Restricted to Administrators · Last refreshed {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:14, marginBottom:28 }}>
        <StatCard icon="👤" label="Total Users"     value={stats?.total_users} color="#4e73df" />
        <StatCard icon="🎒" label="Students"        value={stats?.students}    color="#1cc88a" sub={`${regular} Regular · ${irregular} Irregular`} />
        <StatCard icon="🏫" label="Faculty"         value={stats?.faculty}     color="#36b9cc" />
        <StatCard icon="📚" label="Courses"         value={courses.length}     color="#f6c23e" />
        <StatCard icon="✅" label="Grades Passed"   value={passed}             color="#1cc88a" />
        <StatCard icon="❌" label="Grades Failed"   value={failed}             color="#e74a3b" />
      </div>

      {/* ── ANALYTICS ROW ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18, marginBottom:28 }}>

        {/* Grade Distribution */}
        <div style={S.panel}>
          <div style={S.panelHead}>📊 Grade Distribution</div>
          <div style={{ padding:'16px 20px' }}>
            {gradeOrder.map(g => (
              <Bar key={g} label={g === '5.00' ? '5.00 (FAILED)' : g}
                val={gradeDist[g]} max={maxGradeCt}
                color={g === '5.00' ? '#e74a3b' : g <= '2.00' ? '#1cc88a' : g <= '3.00' ? '#f6c23e' : '#858796'} />
            ))}
          </div>
        </div>

        {/* Course Enrollment */}
        <div style={S.panel}>
          <div style={S.panelHead}>📋 Grades Recorded by Course</div>
          <div style={{ padding:'16px 20px' }}>
            {Object.entries(enrollByCourse).map(([code, ct]) => (
              <Bar key={code} label={code} val={ct} max={maxEnroll} color="#4e73df" />
            ))}
          </div>
        </div>

        {/* Program & Status Breakdown */}
        <div style={S.panel}>
          <div style={S.panelHead}>🎓 Student Breakdown</div>
          <div style={{ padding:'16px 20px' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#858796', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>By Program</div>
              <Bar label="BSIT" val={bsit} max={students.length} color="#4e73df" />
              <Bar label="BSCS" val={bscs} max={students.length} color="#36b9cc" />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#858796', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>By Status</div>
              <Bar label="Regular"   val={regular}   max={students.length} color="#1cc88a" />
              <Bar label="Irregular" val={irregular}  max={students.length} color="#f6c23e" />
              <Bar label="Unset"     val={students.length - regular - irregular} max={students.length} color="#858796" />
            </div>
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD REPORT CARDS ── */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#858796', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>⬇ Download Reports</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
          {reportCards.map((rc, idx) => (
            <div key={rc.id} className="rpt-card" style={{ ...S.reportCard, animationDelay: `${idx * 0.07}s` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{
                  width:46, height:46, borderRadius:12, fontSize:22,
                  background:`linear-gradient(135deg, ${rc.color}, ${rc.color}bb)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 4px 10px ${rc.color}40`,
                }}>{rc.icon}</div>
                <span style={{
                  fontSize:11, fontWeight:700, padding:'3px 10px',
                  borderRadius:20, background:`${rc.color}18`, color:rc.color,
                }}>{rc.badge}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:'#1f2f70', marginBottom:6 }}>{rc.label}</div>
              <div style={{ fontSize:12, color:'#858796', marginBottom:16, lineHeight:1.5 }}>{rc.desc}</div>
              <button
                className="rpt-btn"
                style={{
                  width:'100%', padding:'9px 0', borderRadius:8, border:'none', cursor:'pointer',
                  background:`linear-gradient(135deg, ${rc.color}, ${rc.color}cc)`,
                  color:'white', fontWeight:700, fontSize:13,
                  boxShadow:`0 3px 10px ${rc.color}40`,
                  opacity: generating === rc.id ? .65 : 1,
                }}
                onClick={rc.action}
                disabled={!!generating}
              >
                {generating === rc.id ? '⏳ Generating…' : '⬇ Download CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const S = {
  panel: {
    background:'white', borderRadius:14, boxShadow:'0 4px 16px rgba(0,0,0,0.06)',
    overflow:'hidden', border:'1px solid #e3e6f0',
  },
  panelHead: {
    padding:'14px 20px', borderBottom:'1px solid #e3e6f0',
    fontWeight:700, fontSize:14, color:'#1f2f70', background:'#f8f9fc',
  },
  reportCard: {
    background:'white', borderRadius:14, padding:'20px',
    boxShadow:'0 4px 16px rgba(0,0,0,0.06)', border:'1px solid #e3e6f0',
  },
};

export default Reports;
