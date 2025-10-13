import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { CheckCircle, Clock, DollarSign, User, Settings, Plus, Trash2, List } from 'lucide-react';
import './App.css';

export default function ChoreTrackerApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('activeTab') || 'chores'
  );
  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };
  const [chores, setChores] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);  // Payment Modal
  const [allProfiles, setAllProfiles] = useState([]);

  // Check if user is logged in
  useEffect(() => {
    // Set a timeout in case auth hangs
    const timeout = setTimeout(() => {
      console.log('Auth timeout, proceeding anyway');
      setLoading(false);
    }, 5000); // 5 second timeout

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) console.error('Auth error:', error);
        setCurrentUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(timeout);
      })
      .catch((err) => {
        console.error('Auth failed:', err);
        setLoading(false);
        clearTimeout(timeout);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Load user profile, chores, and completions
  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
      loadChores();
      loadCompletions();
      loadAllProfiles();  // ADD THIS LINE
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (data) setUserProfile(data);
  };
  // ADD THIS FUNCTION
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
      .select('*, chores(name), profiles(name, avatar_emoji, avatar_color)')
      .order('completed_at', { ascending: false });

    if (data) setCompletions(data);
  };

  // ADD THIS NEW FUNCTION after loadUserProfile
  const loadAllProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (data) setAllProfiles(data);
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
  const deleteCompletion = async (completionId) => {
    const { error } = await supabase
      .from('completions')
      .delete()
      .eq('id', completionId);

    if (!error) {
      loadCompletions(); // Reload to show updated list
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
            completions={completions}
            currentUser={currentUser}
            userProfile={userProfile}
            onDeleteCompletion={deleteCompletion}
            onOpenPayoutModal={() => setShowPayoutModal(true)}  // ADD THIS
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
          onClick={() => changeTab('chores')}
        />
        <TabButton
          icon="⏰"
          label="History"
          active={activeTab === 'history'}
          onClick={() => changeTab('history')}
        />
        <TabButton
          icon="👤"
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => changeTab('profile')}
        />
        {userProfile?.role === 'admin' && (
          <TabButton
            icon="⚙️"
            label="Manage"
            active={activeTab === 'admin'}
            onClick={() => changeTab('admin')}
          />
        )}
      </div>

      {showPayoutModal && (
        <PayoutModal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          currentUser={currentUser}
          userProfile={userProfile}
          completions={completions}
          allProfiles={allProfiles}
          onPaymentComplete={loadCompletions}  // ADD THIS
        />
      )}
    </div>  // ← This closes app-container
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
          <div className="login-icon">📋</div>
          <h1>Mac Stack Chores</h1>
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
  const [completingId, setCompletingId] = useState(null);

  const getChoreStatus = (chore) => {
    const recentCompletions = completions.filter(c => c.chore_id === chore.id);
    if (!chore.can_repeat && recentCompletions.length > 0) {
      return 'completed';
    }
    return 'available';
  };

  const handleComplete = (chore) => {
    setCompletingId(chore.id);

    setTimeout(() => {
      onComplete(chore);
      setCompletingId(null);
    }, 400);
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
              onClick={() => handleComplete(chore)}
              disabled={isCompleted || completingId === chore.id}
              className={`complete-button ${isCompleted
                ? 'disabled'
                : completingId === chore.id
                  ? 'completing'
                  : ''
                }`}
            >
              {completingId === chore.id ? (
                <span style={{ fontSize: '16px' }}>✓</span>
              ) : isCompleted ? 'Done' : 'Complete'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HistoryPage({ completions, currentUser, userProfile, onDeleteCompletion, onOpenPayoutModal }) {
  const [timeFilter, setTimeFilter] = useState('week');
  const [allProfiles, setAllProfiles] = useState([]);
  const [overviewIndex, setOverviewIndex] = useState(0);
  const [userIndex, setUserIndex] = useState(0);

  const overviewRef = useRef(null);
  const userRef = useRef(null);

  const handleOverviewScroll = () => {
    if (!overviewRef.current) return;
    const scrollLeft = overviewRef.current.scrollLeft;
    const cardWidth = overviewRef.current.scrollWidth / 2; // 2 cards total
    const index = Math.round(scrollLeft / cardWidth);
    setOverviewIndex(index);
  };

  const handleUserScroll = () => {
    if (!userRef.current) return;
    const scrollLeft = userRef.current.scrollLeft;
    const cardWidth = userRef.current.scrollWidth / allProfiles.length;
    const index = Math.round(scrollLeft / cardWidth);
    setUserIndex(index);
  };

  // ... rest of your existing code continues here
  useEffect(() => {
    loadAllProfiles();
  }, []);

  const loadAllProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('name');

    if (data) setAllProfiles(data);
  };

  // Filter completions by time period
  const getFilteredCompletions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return completions.filter(c => {
      const completedDate = new Date(c.completed_at);
      if (timeFilter === 'today') return completedDate >= today;
      if (timeFilter === 'week') return completedDate >= weekAgo;
      if (timeFilter === 'month') return completedDate >= monthAgo;
      return true; // 'all'
    });
  };

  const filteredCompletions = getFilteredCompletions();

  // Calculate user earnings
  const getUserEarnings = (userId) => {
    return filteredCompletions
      .filter(c => c.user_id === userId)
      .reduce((sum, c) => sum + c.amount_earned, 0);
  };

  const myEarnings = getUserEarnings(currentUser.id);
  const totalPaidOut = filteredCompletions.reduce((sum, c) => sum + c.amount_earned, 0);

  if (userProfile?.role === 'admin') {
    return (
      <div className="history-page">
        {/* Time Filter */}
        <div className="time-filter">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="time-filter-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Top Carousel - Summary Cards */}
        <h2 className="section-title">Overview</h2>
        <div
          className="overview-carousel"
          ref={overviewRef}
          onScroll={handleOverviewScroll}
        >
          <div className="summary-card">
            <div className="summary-icon">🏠</div>
            <h3>Family Summary</h3>
            <div className="summary-stats">
              <p>{allProfiles.length} active members</p>
              <p>{filteredCompletions.length} chores completed</p>
              <p className="summary-amount">${filteredCompletions.filter(c => !c.paid_at).reduce((sum, c) => sum + c.amount_earned, 0).toFixed(2)} earned</p>
            </div>
          </div>

          <div className="summary-card payout-card">
            <div className="summary-icon">💵</div>
            <h3>Payouts</h3>
            <div className="summary-stats">
              <div style={{ marginBottom: '16px' }}>
                <p className="summary-label">Pending</p>
                <p className="summary-amount" style={{ color: '#ef4444' }}>
                  ${filteredCompletions
                    .filter(c => !c.paid_at)
                    .reduce((sum, c) => sum + c.amount_earned, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="summary-label">Paid ({timeFilter === 'all' ? 'All Time' : timeFilter})</p>
                <p className="summary-amount" style={{ color: '#10b981' }}>
                  ${filteredCompletions
                    .filter(c => c.paid_at)
                    .reduce((sum, c) => sum + c.amount_earned, 0)
                    .toFixed(2)}
                </p>
              </div>
              <button
                className="mark-paid-button"
                onClick={onOpenPayoutModal}
              >
                View/Send Payouts
              </button>
            </div>
          </div>
        </div>

        {/* Dots for overview carousel */}
        <div className="carousel-dots">
          {[0, 1].map(i => (
            <div
              key={i}
              className={`dot ${overviewIndex === i ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Bottom Carousel - User Cards */}
        <h2 className="section-title">Individual Earnings</h2>
        <div
          className="user-carousel"
          ref={userRef}
          onScroll={handleUserScroll}
        >
          {allProfiles.map(user => {
            const earnings = getUserEarnings(user.id);
            const choresCount = filteredCompletions.filter(c => c.user_id === user.id).length;

            return (
              <div key={user.id} className="user-earnings-card">
                <div
                  className="user-card-avatar"
                  style={{ background: user.avatar_color || '#3b82f6' }}
                >
                  {user.avatar_emoji || '😊'}
                </div>
                <h3>{user.name}</h3>
                <p className="user-earnings">${earnings.toFixed(2)}</p>
                <p className="user-chores">{choresCount} completed</p>
              </div>
            );
          })}
        </div>

        {/* Dots for user carousel */}
        <div className="carousel-dots">
          {allProfiles.map((_, i) => (
            <div
              key={i}
              className={`dot ${userIndex === i ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="section-title">Recent Activity</h2>
        {filteredCompletions.length === 0 ? (
          <div className="empty-state">
            <p>No chores completed in this time period</p>
          </div>
        ) : (
          filteredCompletions.map(completion => (
            <div key={completion.id} className="history-card">
              <div
                className="history-avatar"
                style={{ background: completion.profiles?.avatar_color || '#3b82f6' }}
              >
                {completion.profiles?.avatar_emoji || '😊'}
              </div>
              <div className="history-info">
                <h3>{completion.chores?.name}</h3>
                <p className="history-completed-by">
                  {completion.profiles?.name || 'Unknown'}
                </p>
                <p className="history-date">
                  {new Date(completion.completed_at).toLocaleString()}
                </p>
              </div>
              <div className="history-amount">+${completion.amount_earned.toFixed(2)}</div>

              <button
                onClick={() => {
                  if (window.confirm('Delete this completion? This cannot be undone.')) {
                    onDeleteCompletion(completion.id);
                  }
                }}
                className="delete-completion-button"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  // Regular user view (existing code)
  return (
    <div className="history-page">
      <div className="earnings-card">
        <p className="earnings-label">My Total Earnings</p>
        <p className="earnings-amount">${myEarnings.toFixed(2)}</p>
        <p className="earnings-count">
          {filteredCompletions.filter(c => c.user_id === currentUser.id).length} chores completed
        </p>
      </div>

      <h2 className="section-title">Recent Activity</h2>

      {filteredCompletions.filter(c => c.user_id === currentUser.id).length === 0 ? (
        <div className="empty-state">
          <p>No chores completed yet</p>
          <p className="empty-subtitle">Complete a chore to start earning!</p>
        </div>
      ) : (
        filteredCompletions
          .filter(c => c.user_id === currentUser.id)
          .map(completion => (
            <div key={completion.id} className="history-card">
              <div
                className="history-avatar"
                style={{ background: completion.profiles?.avatar_color || '#3b82f6' }}
              >
                {completion.profiles?.avatar_emoji || '😊'}
              </div>
              <div className="history-info">
                <h3>{completion.chores?.name}</h3>
                <p className="history-completed-by">
                  {completion.profiles?.name || 'Unknown'}
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
function PayoutModal({ isOpen, onClose, currentUser, userProfile, completions, allProfiles, onPaymentComplete }) {
  const [historyFilter, setHistoryFilter] = useState('all');

  if (!isOpen) return null;

  // Calculate pending payouts per user
  const getPendingPayouts = () => {
    const userPayouts = {};

    completions
      .filter(c => !c.paid_at) // Only unpaid completions
      .forEach(c => {
        if (!userPayouts[c.user_id]) {
          userPayouts[c.user_id] = {
            userId: c.user_id,
            user: c.profiles,
            total: 0,
            count: 0
          };
        }
        userPayouts[c.user_id].total += c.amount_earned;
        userPayouts[c.user_id].count += 1;
      });

    return Object.values(userPayouts);
  };

  // Get payment history
  const getPaymentHistory = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let paidCompletions = completions.filter(c => c.paid_at);

    // Filter by time if not 'all'
    if (historyFilter !== 'all') {
      paidCompletions = paidCompletions.filter(c => {
        const paidDate = new Date(c.paid_at);
        if (historyFilter === 'week') return paidDate >= weekAgo;
        if (historyFilter === 'month') return paidDate >= monthAgo;
        return true;
      });
    }

    // Group by user and paid_at date
    const grouped = {};
    paidCompletions.forEach(c => {
      const dateKey = new Date(c.paid_at).toLocaleDateString();
      const key = `${c.user_id}-${dateKey}`;

      if (!grouped[key]) {
        grouped[key] = {
          user: c.profiles,
          date: c.paid_at,
          total: 0
        };
      }
      grouped[key].total += c.amount_earned;
    });

    return Object.values(grouped).sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
  };

  // Mark user's completions as paid
  const handlePayUser = async (userId) => {
    console.log('Paying user:', userId);

    const unpaidCompletions = completions
      .filter(c => c.user_id === userId && !c.paid_at)
      .map(c => c.id);

    console.log('Unpaid completion IDs:', unpaidCompletions);

    const { data, error } = await supabase
      .from('completions')
      .update({ paid_at: new Date().toISOString() })
      .in('id', unpaidCompletions);

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Payment error:', error);
      alert('Error processing payment: ' + error.message);
    } else {
      console.log('Payment successful, reloading data...');
      await onPaymentComplete();  // Reload completions
      // Modal stays open!
    }
  };

  const pendingPayouts = getPendingPayouts();
  const paymentHistory = getPaymentHistory();
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Payouts</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          {/* Pending Payouts (Admin Only) */}
          {isAdmin && (
            <div className="pending-section">
              <div className="section-header">Pending Payouts</div>

              {pendingPayouts.length === 0 ? (
                <div className="empty-state">
                  <p>No pending payouts</p>
                </div>
              ) : (
                pendingPayouts.map(payout => (
                  <div key={payout.user.id} className="user-payout-card">
                    <div
                      className="payout-avatar"
                      style={{ background: payout.user.avatar_color }}
                    >
                      {payout.user.avatar_emoji}
                    </div>
                    <div className="payout-info">
                      <div className="payout-name">{payout.user.name}</div>
                      <div className="payout-amount">${payout.total.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => {
                        console.log('Pay button clicked for user:', payout.user.name);
                        if (window.confirm(`Pay ${payout.user.name} $${payout.total.toFixed(2)}?`)) {
                          console.log('Confirmed, calling handlePayUser');
                          handlePayUser(payout.userId);
                        } else {
                          console.log('Payment cancelled');
                        }
                      }}
                      className="pay-button"
                    >
                      Pay
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Payment History */}
          <div className="history-section">
            <div className="section-header">Payment History</div>

            <div className="time-filter">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="time-filter-select"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="empty-state">
                <p>No payment history</p>
              </div>
            ) : (
              paymentHistory
                .filter(payment => isAdmin || payment.user.id === currentUser.id)
                .map((payment, idx) => (
                  <div key={idx} className="history-card">
                    <div
                      className="history-avatar"
                      style={{ background: payment.user.avatar_color }}
                    >
                      {payment.user.avatar_emoji}
                    </div>
                    <div className="history-info">
                      <div className="history-name">{payment.user.name}</div>
                      <div className="history-date">
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="history-amount">${payment.total.toFixed(2)}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showCustomEmoji, setShowCustomEmoji] = useState(false);

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
      setEditedProfile(data);
    }
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: editedProfile.name,
        avatar_emoji: editedProfile.avatar_emoji,
        avatar_color: editedProfile.avatar_color
      })
      .eq('id', user.id);

    if (!error) {
      setProfile(editedProfile);
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
        <div
          className="profile-avatar"
          style={{ background: profile.avatar_color }}
        >
          {profile.avatar_emoji}
        </div>

        <div className="profile-info">
          <h2>{profile.name}</h2>
          <p className="profile-email">{user.email}</p>
          <button onClick={() => setIsEditing(true)} className="edit-profile-button">
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="avatar-picker-modal">
          <div className="avatar-picker">
            <h3>Edit Profile</h3>
            <p className="picker-subtitle">Customize your name and avatar</p>

            <div className="avatar-preview" style={{ background: editedProfile.avatar_color }}>
              {editedProfile.avatar_emoji}
            </div>

            <div className="avatar-controls">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="name-input"
                />
              </label>

              <label>
                <span>Emoji</span>
                <div className="emoji-quick-picks">
                  {['😎', '🤓', '🥳', '👸', '👽', '🤖', '💩', '🦸', '🧑‍🚀', '🐶', '🐱'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setEditedProfile({ ...editedProfile, avatar_emoji: emoji });
                        setShowCustomEmoji(false);
                      }}
                      className="quick-emoji-btn"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomEmoji(!showCustomEmoji)}
                    className="quick-emoji-btn custom-emoji-btn"
                  >
                    ➕
                  </button>
                </div>
                {showCustomEmoji && (
                  <div className="custom-emoji-section">
                    <p className="custom-emoji-label">Choose your own emoji:</p>
                    <input
                      type="text"
                      value={editedProfile.avatar_emoji}
                      onChange={(e) => setEditedProfile({ ...editedProfile, avatar_emoji: e.target.value.slice(0, 2) })}
                      placeholder="Tap to type"
                      className="emoji-input"
                      maxLength="2"
                    />
                  </div>
                )}
              </label>

              <label>
                <span>Background Color</span>
                <input
                  type="color"
                  value={editedProfile.avatar_color}
                  onChange={(e) => setEditedProfile({ ...editedProfile, avatar_color: e.target.value })}
                  className="color-input"
                />
              </label>
            </div>

            <div className="picker-buttons">
              <button
                onClick={handleSaveProfile}
                className="save-button"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

function AdminPanel({ chores, onAddChore, onDeleteChore }) {
  const [showForm, setShowForm] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [choreForm, setChoreForm] = useState({
    name: '',
    description: '',
    value: '',
    is_recurring: true,
    can_repeat: false,
    reset_frequency: 'weekly',
    reset_day: 1  // Default to Monday
  });

  const resetForm = () => {
    setChoreForm({
      name: '',
      description: '',
      value: '',
      is_recurring: true,
      can_repeat: false,
      reset_frequency: 'weekly',
      reset_day: 1
    });
    setShowForm(false);
    setEditingChore(null);
  };

  const handleSubmit = async () => {
    if (choreForm.name && choreForm.value) {
      if (editingChore) {
        // Update existing chore
        const { error } = await supabase
          .from('chores')
          .update({
            name: choreForm.name,
            description: choreForm.description,
            value: parseFloat(choreForm.value),
            is_recurring: choreForm.is_recurring,
            can_repeat: choreForm.can_repeat,
            reset_frequency: choreForm.reset_frequency,
            reset_day: choreForm.reset_day,
          })
          .eq('id', editingChore.id);

        if (!error) {
          // Reload chores (you'll need to pass a reload function or refetch)
          window.location.reload(); // Quick fix - we'll improve this
        }
      } else {
        // Add new chore
        onAddChore({
          ...choreForm,
          value: parseFloat(choreForm.value)
        });
      }
      resetForm();
    }
  };

  const startEdit = (chore) => {
    setEditingChore(chore);
    setChoreForm({
      name: chore.name,
      description: chore.description || '',
      value: chore.value.toString(),
      is_recurring: chore.is_recurring,
      can_repeat: chore.can_repeat,
      reset_frequency: chore.reset_frequency || 'weekly',
      reset_day: chore.reset_day || 1
    });
    setShowForm(true);
  };

  return (
    <div className="admin-panel">
      <button
        onClick={() => setShowForm(true)}
        className="primary-button"
      >
        ➕ Add New Chore
      </button>

      {showForm && (
        <div className="chore-form">
          <h3>{editingChore ? 'Edit Chore' : 'New Chore'}</h3>
          <input
            type="text"
            placeholder="Chore name"
            value={choreForm.name}
            onChange={(e) => setChoreForm({ ...choreForm, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={choreForm.description}
            onChange={(e) => setChoreForm({ ...choreForm, description: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Value ($)"
            value={choreForm.value}
            onChange={(e) => setChoreForm({ ...choreForm, value: e.target.value })}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={choreForm.is_recurring}
              onChange={(e) => setChoreForm({ ...choreForm, is_recurring: e.target.checked })}
            />
            <span>Recurring</span>
          </label>

          {choreForm.is_recurring && (
            <>
              <label className="form-label">
                <span>Frequency:</span>
                <select
                  value={choreForm.reset_frequency}
                  onChange={(e) => setChoreForm({ ...choreForm, reset_frequency: e.target.value })}
                  className="reset-day-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>

              {choreForm.reset_frequency === 'weekly' && (
                <label className="form-label">
                  <span>Resets every:</span>
                  <select
                    value={choreForm.reset_day || 1}
                    onChange={(e) => setChoreForm({ ...choreForm, reset_day: parseInt(e.target.value) })}
                    className="reset-day-select"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </label>
              )}

              {choreForm.reset_frequency === 'monthly' && (
                <label className="form-label">
                  <span>Day of month:</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={choreForm.reset_day || 1}
                    onChange={(e) => setChoreForm({ ...choreForm, reset_day: parseInt(e.target.value) })}
                    className="reset-day-select"
                  />
                </label>
              )}
            </>
          )}

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={choreForm.can_repeat}
              onChange={(e) => setChoreForm({ ...choreForm, can_repeat: e.target.checked })}
            />

            <span>Can be done multiple times</span>
          </label>

          <div className="form-buttons">
            <button onClick={handleSubmit} className="primary-button">
              {editingChore ? 'Save Changes' : 'Add'}
            </button>
            <button onClick={resetForm} className="secondary-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      <h2 className="section-title">All Chores</h2>

      <div className="space-y-2">
        {chores.map(chore => (
          <div key={chore.id} className="chore-card">
            <div className="chore-info">
              <h3>{chore.name}</h3>
              {chore.description && (
                <p className="chore-description">{chore.description}</p>
              )}
              <div className="chore-meta">
                <span className="chore-value">${chore.value.toFixed(2)}</span>
                {chore.can_repeat && (
                  <span className="badge">Repeatable</span>
                )}
                {chore.is_recurring && (
                  <span className="badge badge-purple">Weekly</span>
                )}
              </div>
            </div>
            <div className="chore-actions">
              <button
                onClick={() => startEdit(chore)}
                className="edit-button"
              >
                ✏️
              </button>
              <button
                onClick={() => onDeleteChore(chore.id)}
                className="delete-button"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}