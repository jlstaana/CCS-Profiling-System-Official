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
    background: `linear-gradient(145deg, #ffffff, #f8f9fc)`,
    border: `1px solid rgba(255,255,255,0.8)`,
    borderRadius: '24px', padding: '24px',
    display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 240px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)',
    position: 'relative', overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  }} className="stat-card">
    <div style={{
      position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
      background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, borderRadius: '50%'
    }} />
    <div style={{
      width: '64px', height: '64px', borderRadius: '18px',
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '28px', flexShrink: 0, boxShadow: `0 8px 24px ${color}40`,
      color: 'white', position: 'relative', zIndex: 1
    }}>{icon}</div>
    <div style={{ zIndex: 1, flex: 1 }}>
      <div style={{ fontSize: '32px', fontWeight: 800, color: '#1f2f70', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '4px' }}>{fmt(value)}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#858796', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: '#aeb1be', marginTop: '6px', fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

/* ── mini bar ─────────────────────────────────────────── */
const Bar = ({ label, val, max, color }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#5a5c69' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 800, color, backgroundColor: `${color}15`, padding: '3px 10px', borderRadius: '12px' }}>{fmt(val)}</span>
    </div>
    <div style={{ height: '10px', borderRadius: '99px', background: '#f0f2f5', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ 
        height: '100%', borderRadius: '99px', width: `${Math.round((val / (max||1)) * 100)}%`, 
        background: `linear-gradient(90deg, ${color}, ${color}cc)`, 
        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          animation: 'shimmer 2s infinite linear'
        }} />
      </div>
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
    <div style={{ padding: '10px 0', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .rpt-card { animation: fadeUp .4s cubic-bezier(0.4, 0, 0.2, 1) both; transition: all 0.3s ease; }
        .rpt-card:hover { transform: translateY(-6px); boxShadow: 0 15px 35px rgba(0,0,0,0.08); border-color: transparent; }
        .rpt-btn { transition: all .3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .rpt-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: all 0.5s ease; }
        .rpt-btn:hover::before { left: 100%; }
        .rpt-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(0,0,0,0.06); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom: 30, right: 30, zIndex: 9999,
          background: 'linear-gradient(135deg, #1cc88a, #13855c)', color: 'white', padding: '16px 24px',
          borderRadius: '12px', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 10px 30px rgba(28, 200, 138, 0.3)', animation: 'fadeUp .3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <span style={{ fontSize: '20px' }}>✅</span> {toast.replace('✅ ', '')}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1f2f70', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Analytics & Reports</h1>
          <p style={{ color: '#858796', fontSize: '15px', margin: 0, fontWeight: 500 }}>
            Comprehensive system insights and downloadable records
          </p>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#aeb1be', backgroundColor: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          Last refreshed: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon="👤" label="Total Users"     value={stats?.total_users} color="#4e73df" />
        <StatCard icon="🎒" label="Students"        value={stats?.students}    color="#1cc88a" sub={`${regular} Regular · ${irregular} Irregular`} />
        <StatCard icon="🏫" label="Faculty"         value={stats?.faculty}     color="#36b9cc" />
        <StatCard icon="📚" label="Courses"         value={courses.length}     color="#f6c23e" />
        <StatCard icon="📈" label="Grades Passed"   value={passed}             color="#1cc88a" />
        <StatCard icon="📉" label="Grades Failed"   value={failed}             color="#e74a3b" />
      </div>

      {/* ── ANALYTICS ROW ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap: '24px', marginBottom: '40px' }}>

        {/* Grade Distribution */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>📊</span> Grade Distribution
          </div>
          <div style={{ padding:'24px' }}>
            {gradeOrder.map(g => (
              <Bar key={g} label={g === '5.00' ? '5.00 (FAILED)' : g}
                val={gradeDist[g]} max={maxGradeCt}
                color={g === '5.00' ? '#e74a3b' : g <= '2.00' ? '#1cc88a' : g <= '3.00' ? '#f6c23e' : '#858796'} />
            ))}
          </div>
        </div>

        {/* Course Enrollment */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>📋</span> Course Enrollments
          </div>
          <div style={{ padding:'24px' }}>
            {Object.entries(enrollByCourse).sort((a,b) => b[1] - a[1]).map(([code, ct]) => (
              <Bar key={code} label={code} val={ct} max={maxEnroll} color="#4e73df" />
            ))}
          </div>
        </div>

        {/* Program & Status Breakdown */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🎓</span> Demographics Overview
          </div>
          <div style={{ padding:'24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#858796', textTransform:'uppercase', letterSpacing:'.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ height: '1px', flex: 1, backgroundColor: '#e3e6f0' }} /> By Program <div style={{ height: '1px', flex: 1, backgroundColor: '#e3e6f0' }} />
              </div>
              <Bar label="BSIT" val={bsit} max={students.length} color="#4e73df" />
              <Bar label="BSCS" val={bscs} max={students.length} color="#36b9cc" />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#858796', textTransform:'uppercase', letterSpacing:'.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ height: '1px', flex: 1, backgroundColor: '#e3e6f0' }} /> By Status <div style={{ height: '1px', flex: 1, backgroundColor: '#e3e6f0' }} />
              </div>
              <Bar label="Regular"   val={regular}   max={students.length} color="#1cc88a" />
              <Bar label="Irregular" val={irregular}  max={students.length} color="#f6c23e" />
              <Bar label="Unset"     val={students.length - regular - irregular} max={students.length} color="#858796" />
            </div>
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD REPORT CARDS ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1f2f70', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⬇️</span> Download Raw Data Exports
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {reportCards.map((rc, idx) => (
            <div key={rc.id} className="rpt-card" style={{ ...S.reportCard, animationDelay: `${idx * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px', fontSize: '26px',
                  background: `linear-gradient(135deg, ${rc.color}, ${rc.color}dd)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 20px ${rc.color}40`, color: 'white', border: `1px solid ${rc.color}`
                }}>{rc.icon}</div>
                <span style={{
                  fontSize: '12px', fontWeight: 800, padding: '4px 12px',
                  borderRadius: '20px', background: `${rc.color}15`, color: rc.color, border: `1px solid ${rc.color}30`
                }}>{rc.badge}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#1f2f70', marginBottom: '8px', letterSpacing: '-0.01em' }}>{rc.label}</div>
              <div style={{ fontSize: '13px', color: '#858796', marginBottom: '24px', lineHeight: 1.6, minHeight: '40px' }}>{rc.desc}</div>
              <button
                className="rpt-btn"
                style={{
                  width: '100%', padding: '12px 0', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${rc.color}, ${rc.color}dd)`,
                  color: 'white', fontWeight: 700, fontSize: '14px', letterSpacing: '0.03em',
                  boxShadow: `0 4px 15px ${rc.color}40`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  opacity: generating === rc.id ? 0.7 : 1,
                }}
                onClick={rc.action}
                disabled={!!generating}
              >
                {generating === rc.id ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Generating...
                  </>
                ) : (
                  <>
                    <span>⬇</span> Export CSV
                  </>
                )}
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
    background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    overflow: 'hidden', border: '1px solid rgba(227, 230, 240, 0.8)',
    display: 'flex', flexDirection: 'column'
  },
  panelHead: {
    padding: '20px 24px', borderBottom: '1px solid rgba(227, 230, 240, 0.8)',
    fontWeight: 800, fontSize: '15px', color: '#1f2f70', background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
    display: 'flex', alignItems: 'center', letterSpacing: '0.02em'
  },
  reportCard: {
    background: 'white', borderRadius: '24px', padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(227, 230, 240, 0.8)',
  },
};

export default Reports;
