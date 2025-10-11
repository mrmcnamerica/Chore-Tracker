import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CheckCircle, Clock, DollarSign, User, Settings, Plus, Trash2, List } from 'lucide-react';
import './App.css';

export default function ChoreTrackerApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chores');
  const [chores, setChores] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile, chores, and completions
  
  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
      loadChores();
      loadCompletions();
    }
  }, [currentUser]);
  const loadUserProfile = async () => {  // ADD THIS WHOLE FUNCTION
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  
  if (data) setUserProfile(data);
};

  const loadChores = async () => {
    const { data, error } = await supabase
      .from('chores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setChores(data);
  };

const loadCompletions = async () => {
  const { data, error } = await supabase
    .from('completions')
    .select('*, chores(name), profiles(name)')
    .order('completed_at', { ascending: false });
  
  if (data) setCompletions(data);
};

  const completeChore = async (chore) => {
    const { data, error } = await supabase
      .from('completions')
      .insert([
        {
          chore_id: chore.id,
          user_id: currentUser.id,
          amount_earned: chore.value
        }
      ]);

    if (!error) {
      loadCompletions();
    }
  };

  const addChore = async (chore) => {
    const { data, error } = await supabase
      .from('chores')
      .insert([{ ...chore, created_by: currentUser.id }]);

    if (!error) {
      loadChores();
    }
  };

  const deleteChore = async (choreId) => {
    const { error } = await supabase
      .from('chores')
      .delete()
      .eq('id', choreId);

    if (!error) {
      loadChores();
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
  <div className="app-container">
    <div className="status-bar"></div>
    
    <div className="nav-bar">
      {activeTab === 'chores' ? (
        <h1>Hi, {userProfile?.name || 'there'}!</h1>
      ) : (
        <h1>
          {activeTab === 'history' && 'History'}
          {activeTab === 'profile' && 'Profile'}
          {activeTab === 'admin' && 'Manage'}
        </h1>
      )}
    </div>
      <div className="content-area">
        {activeTab === 'chores' && (
          <ChoresList 
            chores={chores} 
            completions={completions}
            onComplete={completeChore}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'history' && (
          <HistoryPage 
            completions={completions.filter(c => c.user_id === currentUser.id)}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'profile' && (
          <ProfilePage user={currentUser} />
        )}
        {activeTab === 'admin' && (
          <AdminPanel 
            chores={chores}
            onAddChore={addChore}
            onDeleteChore={deleteChore}
          />
        )}
      </div>
      <div className="tab-bar">
       <TabButton 
  icon="📋"
  label="Chores"
  active={activeTab === 'chores'}
  onClick={() => setActiveTab('chores')}
/>
<TabButton 
  icon="⏰"
  label="History"
  active={activeTab === 'history'}
  onClick={() => setActiveTab('history')}
/>
<TabButton 
  icon="👤"
  label="Profile"
  active={activeTab === 'profile'}
  onClick={() => setActiveTab('profile')}
/>
{userProfile?.role === 'admin' && (
  <TabButton 
    icon="⚙️"
    label="Manage"
    active={activeTab === 'admin'}
    onClick={() => setActiveTab('admin')}
  />
)}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`tab-button ${active ? 'active' : ''}`}>
      <div className="tab-icon">{icon}</div>
      <span className="tab-label">{label}</span>
    </button>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendLink = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setLinkSent(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">✅</div>
          <h1>Chore Tracker</h1>
          <p>Sign in to get started</p>
        </div>

        {!linkSent ? (
          <div className="login-form">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyPress={(e) => e.key === 'Enter' && handleSendLink()}
            />
            
            <button onClick={handleSendLink} className="primary-button">
              Send Login Link
            </button>

            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Check your email!</h2>
            <p>We've sent a login link to<br /><strong>{email}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoresList({ chores, completions, onComplete, currentUser }) {
  const getChoreStatus = (chore) => {
    const recentCompletions = completions.filter(c => c.chore_id === chore.id);
    if (!chore.can_repeat && recentCompletions.length > 0) {
      return 'completed';
    }
    return 'available';
  };

  return (
    <div className="chores-list">
      <h2 className="section-title">Available Chores</h2>

      {chores.map(chore => {
        const status = getChoreStatus(chore);
        const isCompleted = status === 'completed';
        
        return (
          <div key={chore.id} className={`chore-card ${isCompleted ? 'completed' : ''}`}>
            <div className="chore-info">
              <h3>{chore.name}</h3>
              {chore.description && <p className="chore-description">{chore.description}</p>}
              <div className="chore-meta">
                <span className="chore-value">${chore.value.toFixed(2)}</span>
                {chore.can_repeat && <span className="badge">Repeatable</span>}
              </div>
            </div>
            
            <button
              onClick={() => onComplete(chore)}
              disabled={isCompleted}
              className={`complete-button ${isCompleted ? 'disabled' : ''}`}
            >
              {isCompleted ? 'Done' : 'Complete'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HistoryPage({ completions, currentUser }) {
  const totalEarnings = completions.reduce((sum, c) => sum + c.amount_earned, 0);

  return (
    <div className="history-page">
      <div className="earnings-card">
        <p className="earnings-label">Total Earnings</p>
        <p className="earnings-amount">${totalEarnings.toFixed(2)}</p>
        <p className="earnings-count">{completions.length} chores completed</p>
      </div>

      <h2 className="section-title">Recent Activity</h2>

      {completions.length === 0 ? (
        <div className="empty-state">
          <p>No chores completed yet</p>
          <p className="empty-subtitle">Complete a chore to start earning!</p>
        </div>
      ) : (
        completions.map(completion => (
          <div key={completion.id} className="history-card">
            <div className="history-info">
              <h3>{completion.chores?.name}</h3>
              <p className="history-completed-by">
                Completed by {completion.profiles?.name || 'Unknown'}
              </p>
              <p className="history-date">
                {new Date(completion.completed_at).toLocaleString()}
              </p>
            </div>
            <div className="history-amount">+${completion.amount_earned.toFixed(2)}</div>
          </div>
        ))
      )}
    </div>
  );
}

function ProfilePage({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
      setNewName(data.name);
    }
  };

  const handleSaveName = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, name: newName });
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{profile.name[0].toUpperCase()}</div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-name-form">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="name-input"
              />
              <div className="edit-buttons">
                <button onClick={handleSaveName} className="save-button">Save</button>
                <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2>{profile.name}</h2>
              <button onClick={() => setIsEditing(true)} className="edit-name-button">
                ✏️ Edit Name
              </button>
            </>
          )}
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

function AdminPanel({ chores, onAddChore, onDeleteChore }) {
  const [showForm, setShowForm] = useState(false);
  const [newChore, setNewChore] = useState({
    name: '',
    description: '',
    value: '',
    is_recurring: true,
    can_repeat: false
  });

  const handleSubmit = () => {
    if (newChore.name && newChore.value) {
      onAddChore({
        ...newChore,
        value: parseFloat(newChore.value)
      });
      setNewChore({ name: '', description: '', value: '', is_recurring: true, can_repeat: false });
      setShowForm(false);
    }
  };

  return (
    <div className="admin-panel">
      <button onClick={() => setShowForm(!showForm)} className="primary-button">
        ➕ Add New Chore
      </button>

      {showForm && (
        <div className="chore-form">
          <input
            type="text"
            placeholder="Chore name"
            value={newChore.name}
            onChange={(e) => setNewChore({...newChore, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newChore.description}
            onChange={(e) => setNewChore({...newChore, description: e.target.value})}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Value ($)"
            value={newChore.value}
            onChange={(e) => setNewChore({...newChore, value: e.target.value})}
          />
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newChore.is_recurring}
              onChange={(e) => setNewChore({...newChore, is_recurring: e.target.checked})}
            />
            <span>Recurring (resets weekly)</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newChore.can_repeat}
              onChange={(e) => setNewChore({...newChore, can_repeat: e.target.checked})}
            />
            <span>Can be done multiple times</span>
          </label>

          <div className="form-buttons">
            <button onClick={handleSubmit} className="primary-button">Add</button>
            <button onClick={() => setShowForm(false)} className="secondary-button">Cancel</button>
          </div>
        </div>
      )}

      <h2 className="section-title">All Chores</h2>

      {chores.map(chore => (
        <div key={chore.id} className="chore-card">
          <div className="chore-info">
            <h3>{chore.name}</h3>
            {chore.description && <p className="chore-description">{chore.description}</p>}
            <div className="chore-meta">
              <span className="chore-value">${chore.value.toFixed(2)}</span>
              {chore.can_repeat && <span className="badge">Repeatable</span>}
              {chore.is_recurring && <span className="badge badge-purple">Weekly</span>}
            </div>
          </div>
          <button onClick={() => onDeleteChore(chore.id)} className="delete-button">
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}