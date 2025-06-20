import React, { useEffect, useState } from 'react';
import {
  checkin, checkout, getHistory,
  getLeaveHistory, submitLeaveRequest,
  getEmployeeSummary, getProfile,
  updateEmployeeProfile
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EmployeeDashboard.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaHome, FaUser, FaClock, FaRegCalendarAlt, FaCalendarAlt, FaHistory, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import logo from '../assets/logooo.jpg';
import checkinImg from '../assets/checkin_cartoon.png';
import checkoutImg from '../assets/checkout_cartoon.png';


ChartJS.register(ArcElement, Tooltip, Legend);

const bloodGroups = [
  "", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
];


function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => (
  <aside className="sidebar">
    <div className="sidebar-logo">Employee</div>
    <ul>
      <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}><FaClock /> Attendance</li>
      <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><FaHome /> Dashboard</li>
      <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}><FaUser /> Profile</li>
      <li className={activeTab === 'leave' ? 'active' : ''} onClick={() => setActiveTab('leave')}><FaRegCalendarAlt /> Leave Request</li>
      <li className={activeTab === 'holiday' ? 'active' : ''} onClick={() => setActiveTab('holiday')}><FaCalendarAlt /> Holiday Calendar</li>
      <li className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}><FaHistory /> Attendance History</li>
      <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
    </ul>
  </aside>
);

const TopNavbar = () => (
  <header className="dashboard-navbar">
    <div className="navbar-title">Employee Dashboard</div>
    <img src={logo} alt="Logo" className="navbar-logo-top-right" />
  </header>
);



const SummaryCards = ({ summary, leavesLeft, nextHoliday, employee }) => (
  <div className="summary-cards">
    <div className="card">
      <h4>Upcoming Holiday</h4>
      <p>
        <small>
          {nextHoliday ? `${nextHoliday.date} - ${nextHoliday.name}` : 'No upcoming holiday'}
        </small>
      </p>
    </div>
    <div className="card">
      <h4>Leaves Taken</h4>
      <p>{summary.leavesTaken}</p>
    </div>
    <div className="card">
      <h4>Leaves Left</h4>
      <p>{leavesLeft}</p>
    </div>
    <div className="card">
      <h4>Pending Requests</h4>
      <p>{summary.pendingRequests}</p>
    </div>
    <div className="card profile-summary-card">
      <div className="profile-avatar-small">👤</div>
      <div style={{ marginLeft: 8 }}>
        <div><strong>{employee.name}</strong></div>
        <div style={{ fontSize: 13 }}>{employee.email}</div>
        <div style={{ fontSize: 13 }}>{employee.department} | {employee.position}</div>
      </div>
    </div>
  </div>
);

const DashboardTab = ({ employee }) => {
  const data = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        label: 'Attendance',
        data: [85, 15],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="dashboard-profile-chart">
      <div className="card profile-summary">
        <div className="profile-avatar-large">👤</div>
        <h4>{employee.name}</h4>
        <p>{employee.email}</p>
        <div style={{ fontSize: 14, margin: "0.5rem 0" }}>{employee.department} | {employee.position}</div>
      </div>
      <div className="card small-chart">
        <h3>Attendance Overview</h3>
        <Pie data={data} />
      </div>
    </div>
  );
};



const AttendanceTab = ({ join_date }) => {
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [attendanceDateTime, setAttendanceDateTime] = useState('');
  const todayStr = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

  const fetchHistory = async () => {
    try {
      await getHistory();
      // Optionally reload UI state here
    } catch (err) {
      toast.error("Failed to fetch attendance history");
    }
  };

  const minDateTime = join_date ? `${join_date}T00:00` : '';
  const maxDateTime = todayStr;

  return (
    <>
      <div className="attendance-modern">
        <div className="action-card" onClick={() => setShowCheckinModal(true)}>
          <img src={checkinImg} alt="Check In" className="action-img" />
          <button className="modern-btn">Check In</button>
        </div>
        <div className="action-card" onClick={() => setShowCheckoutModal(true)}>
          <img src={checkoutImg} alt="Check Out" className="action-img" />
          <button className="modern-btn">Check Out</button>
        </div>
      </div>



      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select Date and Time for Check-In</h3>
            <input
              type="datetime-local"
              value={attendanceDateTime}
              onChange={(e) => setAttendanceDateTime(e.target.value)}
              min={minDateTime}
              max={maxDateTime}
            />
            <div className="modal-buttons">
              <button onClick={async () => {
                try {
                  await checkin({ datetime: attendanceDateTime });
                  toast.success("Checked in successfully!");
                  fetchHistory();
                  setShowCheckinModal(false);
                  setAttendanceDateTime('');
                } catch (err) {
                  toast.error(err?.response?.data?.msg || "Check-in failed");
                }
              }}>Submit</button>
              <button className="modal-close" onClick={() => setShowCheckinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select Date and Time for Check-Out</h3>
            <input
              type="datetime-local"
              value={attendanceDateTime}
              onChange={(e) => setAttendanceDateTime(e.target.value)}
              min={minDateTime}
              max={maxDateTime}
            />
            <div className="modal-buttons">
              <button onClick={async () => {
                try {
                  await checkout({ datetime: attendanceDateTime });
                  toast.success("Checked out successfully!");
                  fetchHistory();
                  setShowCheckoutModal(false);
                  setAttendanceDateTime('');
                } catch (err) {
                  toast.error(err?.response?.data?.msg || "Check-out failed");
                }
              }}>Submit</button>
              <button className="modal-close" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


const LeaveTab = () => {
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    getLeaveHistory()
      .then(res => setLeaveHistory(res.data || []))
      .catch(() => setLeaveHistory([]));
  }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLeaveRequest({ date: leaveDate, reason });
      toast.success('Leave request submitted');
      setLeaveDate('');
      setReason('');
      getLeaveHistory().then(res => setLeaveHistory(res.data || []));
    } catch {
      toast.error('Failed to submit leave request');
    }
  };

  const startIdx = (page - 1) * perPage;
  const pageData = leaveHistory.slice(startIdx, startIdx + perPage);
  const totalPages = Math.ceil(leaveHistory.length / perPage);

  return (
    <div className="leave-tab-grid">
      <div className="leave-form-card">
        <h3>Leave Request Form</h3>
        <form className="leave-form" onSubmit={handleLeaveSubmit}>
          <label>
            Leave Date
            <input
              type="date"
              value={leaveDate}
              onChange={e => setLeaveDate(e.target.value)}
              placeholder="dd / mm / yyyy"
              required
              className="calendar-input"
            />
          </label>
          <label>
            Reason
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter the reason for leave"
              required
            />
          </label>
          <button type="submit" className="apply-btn">Apply Leave</button>
        </form>
      </div>
      <div className="leave-history-card">
        <h4>Leave History</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>No leave history</td>
              </tr>
            ) : (
              pageData.map((leave, idx) => (
                <tr key={idx}>
                  <td>{leave.date}</td>
                  <td>{leave.reason}</td>
                  <td>{leave.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="leave-pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="leave-btn"
            >
              Previous
            </button>
            <span className="leave-page">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="leave-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const holidays = [
  { date: '2025-01-26', name: 'Republic Day' },
  { date: '2025-03-08', name: 'Maha Shivratri' },
  { date: '2025-04-14', name: 'Ambedkar Jayanti' },
  { date: '2025-05-01', name: 'May Day' },
  { date: '2025-06-06', name: 'Eid al-Fitr' },
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-08-27', name: 'Ganesh Chaturthi' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-20', name: 'Diwali' },
  { date: '2025-11-01', name: 'Kannada Rajyotsava' },
  { date: '2025-11-14', name: "Children's Day" },
  { date: '2025-12-25', name: 'Christmas' }
];

const getNextHoliday = () => {
  const today = new Date();
  return holidays.find(h => new Date(h.date) >= today) || null;
};

const HolidayTab = () => {
  const [page, setPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.ceil(holidays.length / perPage);
  const pageData = holidays.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="card holiday-card">
      <h3>Holiday Calendar</h3>
      <table className="holiday-table">
        <thead>
          <tr><th>Date</th><th>Holiday</th></tr>
        </thead>
        <tbody>
          {pageData.map((h, idx) => (
            <tr key={idx}>
              <td>{h.date}</td>
              <td>{h.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="pagination capsule">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="capsule-btn"
          >
            Previous
          </button>
          <span className="capsule-page">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="capsule-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load attendance history');
      }
    };
    fetchHistory();
  }, []);

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const totalPages = Math.ceil(history.length / perPage);
  const startIdx = (page - 1) * perPage;
  const pageData = history.slice(startIdx, startIdx + perPage);
  return (
    <div className="card">
      <h3>Attendance History</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Check-in</th><th>Check-out</th></tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr><td colSpan="3">No records found</td></tr>
          ) : (
            pageData.map((record, i) => (
              <tr key={i}>
                <td>{formatDateDMY(record.date)}</td>
                <td>{record.checkin ? record.checkin.split(" ")[1] + " " + record.checkin.split(" ")[2] : "—"}</td>
                <td>{record.checkout ? record.checkout.split(" ")[1] + " " + record.checkout.split(" ")[2] : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination capsule" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="capsule-btn"
          >
            Previous
          </button>
          <span className="capsule-page">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="capsule-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};


const ProfileTab = ({ employee, setEditMode, editMode, onSave }) => (
  <div className="card profile-view">
    <div className="profile-avatar-large">👤</div>
    {!editMode ? (
      <>
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Position:</strong> {employee.position}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Blood Group:</strong> {employee.bloodGroup || "-"}</p>
        <p><strong>Date of Joining:</strong> {formatDateDMY(employee.join_date)}</p>
        <div className="edit-button-container">
          <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      </>
    ) : (
      <form onSubmit={onSave} className="profile-form">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="close-btn"
            onClick={() => setEditMode(false)}
            title="Cancel"
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              color: "#888",
              cursor: "pointer",
              position: "absolute",
              right: 16,
              top: 12,
            }}
          >
            <FaTimes />
          </button>
        </div>
        <label>Name
          <input type="text" name="name" defaultValue={employee.name} placeholder="Enter your full name" required />
        </label>
        <label>Email
          <input type="email" name="email" defaultValue={employee.email} placeholder="Enter your email address" required />
        </label>
        <label>Blood Group
          <select
            name="bloodGroup"
            defaultValue={employee.bloodGroup}
            required
            style={{
              width: "95%",
              minWidth: 0,
              fontSize: "1.08rem",
              padding: "9px 12px",
              border: "1px solid #ccc",
              borderRadius: "7px",
              background: "#fcfcfc",
              boxSizing: "border-box",
              marginBottom: "0.3rem",
              outline: "none",
              transition: "border-color 0.2s",
              height: "38px",
              alignItems: "center",
            }}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.filter(bg => bg !== "").map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </label>
        <div className="modal-buttons">
          <button type="submit">Update</button>
        </div>
      </form>
    )}
  </div>
);

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [summary, setSummary] = useState({ leavesTaken: 0, pendingRequests: 0 });
  const [employee, setEmployee] = useState({ name: '', email: '', position: '', department: '', join_date: '', bloodGroup: '' });
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();
  const leavesLeft = 20 - summary.leavesTaken;

  const nextHoliday = getNextHoliday();

  useEffect(() => {
    getProfile().then(res => setEmployee(res.data)).catch(() => toast.error('Failed to load profile'));
    getEmployeeSummary().then(res => setSummary(res.data)).catch(() => toast.error('Failed to load dashboard data'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updated = {
      name: form.name.value,
      email: form.email.value,
      bloodGroup: form.bloodGroup.value,
    };
    try {
      await updateEmployeeProfile(updated);
      setEmployee({
        ...employee,
        ...updated,
      });
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />
      <div className="main-area">
        <TopNavbar />
        <main className="main-content">
          <SummaryCards summary={summary} leavesLeft={leavesLeft} nextHoliday={nextHoliday} employee={employee} />
          {activeTab === 'attendance' && <AttendanceTab join_date={employee.join_date} />}
          {activeTab === 'dashboard' && <DashboardTab employee={employee} />}
          {activeTab === 'profile' && <ProfileTab employee={employee} setEditMode={setEditMode} editMode={editMode} onSave={handleProfileSave} />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'leave' && <LeaveTab />}
          {activeTab === 'holiday' && <HolidayTab />}
          <ToastContainer />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
