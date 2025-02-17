// src/pages/MentorDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Import the modular components for various sections:
import BriefingPanel from '../components/BriefingPanne';      // Briefing form component
import QuestionForm from '../components/QuestionForm';          // Question creation form
import MessageForm from '../components/MessageFrom';            // Message creation form
import StudentListSection from '../components/StudentListSection';// Component to display student list
import AdminPanel from '../components/AdminPannel';             // Admin-specific user management
import MessageListSection from '../components/MessageListSection';// Component to display all messages
import MentorProfile from '../components/MentorProfile';        // Mentor profile summary component
import AdminProfile from '../components/AdminProfile';          // Admin profile summary component
import ContactMessageCard from '../components/ContactMessageCard';// Component to display contact messages
import AssignmentCard from '../components/AssignmentCard';      // Component to display assignment cards

function MentorDashboard() {
  const { auth } = useContext(AuthContext);

  // Determine role flags
  const isMentor = auth.user.role === 'mentor';
  const isAdmin = auth.user.role === 'admin';

  // We'll use one state variable for the active section (toggling which form/section is visible)
  const [activeSection, setActiveSection] = useState('');

  // Data fetched from backend
  const [students, setStudents] = useState([]);
  const [publicAssignments, setPublicAssignments] = useState([]);
  const [personalAssignments, setPersonalAssignments] = useState([]); // For student personal assignments
  const [personalAssigned, setPersonalAssigned] = useState([]); // For mentor's view of assignments assigned personally to students
  const [personalMessages, setPersonalMessages] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [contactMessages, setContactMessages] = useState([]); // New state for contact messages

  // --- Data Fetching ---

  // Fetch students (for student list and message recipients)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/users/students');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  // // Fetch public assignments
  // useEffect(() => {
  //   if (!auth) return;
  //   const fetchPublicAssignments = async () => {
  //     try {
  //       const res = await api.get('/assignments', { params: { category: 'public' } });
  //       setPublicAssignments(res.data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchPublicAssignments();
  // }, [auth]);

  // // Fetch personal assignments for the logged-in student
  // useEffect(() => {
  //   if (!auth) return;
  //   const fetchPersonalAssignments = async () => {
  //     try {
  //       const res = await api.get('/assignments/personal');
  //       setPersonalAssignments(res.data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchPersonalAssignments();
  // }, [auth]);

  // Fetch personal messages for the logged-in student
  useEffect(() => {
    if (!auth) return;
    const fetchPersonalMessages = async () => {
      try {
        const res = await api.get('/messages/personal');
        setPersonalMessages(res.data);
      } catch (err) {
        console.error(err);
      } 
    };
    fetchPersonalMessages();
  }, [auth]); 

  // Fetch all users for Admin Panel (only if admin)
  useEffect(() => {
    if (!auth || !isAdmin) return;
    const fetchAllUsers = async () => {
      try {
        const res = await api.get('/users');
        setAdminUsers(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch users.');
      }
    };
    fetchAllUsers();
  }, [auth, isAdmin]);

  // Fetch messages for Message List when the "View All Messages" section is active
  useEffect(() => {
    if (!auth || activeSection !== 'msgList') return;
    const fetchMessages = async () => {
      try {
        let params = {};
        // If the user is a mentor, fetch only messages they sent
        if (auth.user.role === 'mentor') {
          params.sender = auth.user.id;
        }
        console.log("Fetching all messages")
        const res = await api.get('/messages/allForMentor', { params });
        console.log("Got message:", res.data)
        setAllMessages(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch messages.');
      }
    };
    fetchMessages();
  }, [auth, activeSection]);

  // New: Fetch contact messages when the "Contact Messages" section is active (admin only)
  useEffect(() => {
    if (!auth || activeSection !== 'contactMsg') return;
    const fetchContactMessages = async () => {
      try {
        const res = await api.get('/contact'); // Public endpoint for contact messages
        setContactMessages(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch contact messages.');
      }
    };
    fetchContactMessages();
  }, [auth, activeSection]);

  // NEW: Fetch personal assignments assigned by mentor (for mentors/admins) 
  // These are assignments with distributionTag "personal" created by the mentor.
  useEffect(() => {
    if (!auth || activeSection !== 'personalAssign') return;
    const fetchPersonalAssigned = async () => {
      try {
        console.log("Checking your personal assignments: ")
        const res = await api.get('/assignments/personalAssigned');
        console.log("Here it is :",res.data);
        setPersonalAssigned(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch personal assignments.');
      }
    };
    fetchPersonalAssigned();
  }, [auth, activeSection]);


  

  // --- Toggle Function (ensuring only one section is open at a time) ---
  const toggleSection = (sectionName) => {
    setActiveSection((prev) => (prev === sectionName ? '' : sectionName));
  };

  // Dummy update and delete functions for user management (placeholders)
  const handleUpdateUser = (user) => {
    toast.info(`Update user: ${user.name}`);
  };
  const handleDeleteUser = (userId) => {
    toast.info(`Delete user id: ${userId}`);
  };
  const handleDisableUser = (userId, hours) => {
    toast.info(`Disable user ${userId} for ${hours} hours`);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Header: Display a different title based on role */}
      <h1 className="text-3xl font-bold mb-6">
        {isAdmin ? 'Admin Dashboard' : 'Mentor Dashboard'}
      </h1>

      {/* Profile Section: Render AdminProfile if admin; otherwise, MentorProfile */}
      {isAdmin ? <AdminProfile /> : <MentorProfile />}

      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => toggleSection('briefing')}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
        >
          {activeSection === 'briefing' ? 'Close Briefing Form' : 'Create/Update Briefing'}
        </button>
        <button
          onClick={() => toggleSection('question')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          {activeSection === 'question' ? 'Close Question Form' : 'Create Question'}
        </button>
        <button
          onClick={() => toggleSection('message')}
          className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
        >
          {activeSection === 'message' ? 'Close Message Form' : 'Create Message'}
        </button>
        {(auth.user.role === 'mentor' || auth.user.role === 'admin') && (
          <button
            onClick={() => toggleSection('students')}
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
          >
            {activeSection === 'students' ? 'Hide Student List' : 'View All Students'}
          </button>
        )}
        {(auth.user.role === 'mentor' || auth.user.role === 'admin') && (
          <button
            onClick={() => toggleSection('msgList')}
            className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition-colors"
          >
            {activeSection === 'msgList' ? 'Hide All Messages' : 'View All Messages'}
          </button>
        )}
        {(auth.user.role === 'mentor' || auth.user.role === 'admin') && (
          <button
            onClick={() => toggleSection('personalAssign')}
            className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition-colors"
          >
            {activeSection === 'personalAssign'
              ? 'Hide Personal Assignments'
              : 'View Personal Assignments'}
          </button>
        )}
        {auth.user.role === 'admin' && (
          <>
            <button
              onClick={() => toggleSection('admin')}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              {activeSection === 'admin' ? 'Hide Admin Panel' : 'Admin Panel'}
            </button>
            <button
              onClick={() => toggleSection('contactMsg')}
              className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition-colors"
            >
              {activeSection === 'contactMsg'
                ? 'Hide Contact Messages'
                : 'Contact Messages'}
            </button>
          </>
        )}
      </div>

      {/* Render Sections Based on Active Toggle */}
      {activeSection === 'briefing' && <BriefingPanel />}
      {activeSection === 'question' && <QuestionForm />}
      {activeSection === 'message' && <MessageForm />}
      {activeSection === 'students' && (
        <StudentListSection 
          students={students}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
        />
      )}
      {activeSection === 'msgList' && (
        <MessageListSection 
          messages={allMessages}
          onUpdate={(msg) => toast.info(`Update message: ${msg.subject}`)}
        />
      )}
      {activeSection === 'personalAssign' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Personal Assignments You Assigned</h2>
          {personalAssigned.length === 0 ? (
            <p>No personal assignments assigned.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalAssigned.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))}
            </div>
          )}
        </div>
      )}
      {activeSection === 'admin' && isAdmin && (
        <AdminPanel 
          adminUsers={adminUsers}
          onDisable={handleDisableUser}
          onDelete={handleDeleteUser}
        />
      )}
      {activeSection === 'contactMsg' && isAdmin && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
          {contactMessages.length === 0 ? (
            <p className="text-gray-500">No contact messages available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactMessages.map((msg) => (
                <ContactMessageCard key={msg._id} message={msg} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MentorDashboard;
