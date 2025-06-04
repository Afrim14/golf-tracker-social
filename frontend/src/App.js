import React, { useState, createContext, useContext, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Home, User, LogOut, Mail, Lock, UserPlus, MapPin } from 'lucide-react';
import styles from './App.module.css';
import buttonStyles from './components/common/Button.module.css';
import cardStyles from './components/common/Card.module.css';
import headerStyles from './components/layout/Header.module.css';
import navigationStyles from './components/layout/Navigation.module.css';
import loginStyles from './components/auth/LoginForm.module.css';
import statsStyles from './components/stats/StatsCard.module.css';
import scorecardStyles from './components/scorecard/ScorecardCard.module.css';
import friendStyles from './components/friends/FriendCard.module.css';

// Constants
const API_BASE_URL = 'http://localhost:8000';

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Toast Context
const ToastContext = createContext();

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// API Service
const apiService = {
  async request(config) {
    const { endpoint, options = {} } = config;
    const token = localStorage.getItem('token');
    
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
      }
      const error = await response.json();
      throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
  },

  async login(credentials) {
    const response = await this.request({
      endpoint: '/auth/login',
      options: {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    });
    localStorage.setItem('token', response.access_token);
    return response;
  },

  async register(userData) {
    return this.request({
      endpoint: '/auth/register',
      options: {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    });
  },

  async getCurrentUser() {
    return this.request({ endpoint: '/auth/me' });
  },

  async getScorecards() {
    return this.request({ endpoint: '/scorecards/' });
  },

  async getStats() {
    return this.request({ endpoint: '/scorecards/stats' });
  },

  async getFriends() {
    return this.request({ endpoint: '/friends' });
  },

  async addFriend(friendCode) {
    return this.request({
      endpoint: '/friends/add',
      options: {
        method: 'POST',
        body: JSON.stringify({ friend_code: friendCode }),
      }
    });
  }
};

// Common Components
const Loading = () => (
  <div className={styles.loading}>
    <div className={styles.spinner}></div>
  </div>
);

const Button = (props) => {
  const { 
    children, 
    variant = 'primary', 
    size = 'medium', 
    disabled = false, 
    onClick,
    className = '',
    type = 'button',
    ...restProps 
  } = props;

  const classes = [
    buttonStyles.button,
    buttonStyles[variant],
    buttonStyles[size],
    className
  ].join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {children}
    </button>
  );
};

const Card = (props) => {
  const { children, hover = false, padding = true, className = '' } = props;
  
  const classes = [
    cardStyles.card,
    hover && cardStyles.hover,
    padding && cardStyles.padding,
    className
  ].join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Toast Provider
const ToastProvider = (props) => {
  const { children } = props;
  const [toasts, setToasts] = useState([]);

  const showToast = (config) => {
    const { message, type = 'success', duration = 3000 } = config;
    const id = Date.now();
    
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Auth Provider
const AuthProvider = (props) => {
  const { children } = props;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    await apiService.login(credentials);
    const userData = await apiService.getCurrentUser();
    setUser(userData);
  };

  const register = async (userData) => {
    await apiService.register(userData);
    await login({ email: userData.email, password: userData.password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Components
const LoginForm = (props) => {
  const { onToggle } = props;
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      showToast({ message: 'Welcome back!', type: 'success' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className={loginStyles.container}>
      <div className={loginStyles.card}>
        <div className={loginStyles.header}>
          <div className={loginStyles.iconContainer}>
            <Users className={loginStyles.icon} />
          </div>
          <h1 className={loginStyles.title}>Welcome Back</h1>
          <p className={loginStyles.subtitle}>Sign in to your golf tracker</p>
        </div>

        <form onSubmit={handleSubmit} className={loginStyles.form}>
          <div className={loginStyles.inputGroup}>
            <label htmlFor="email" className={loginStyles.label}>
              <Mail className={loginStyles.labelIcon} />
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={loginStyles.input}
              required
            />
          </div>

          <div className={loginStyles.inputGroup}>
            <label htmlFor="password" className={loginStyles.label}>
              <Lock className={loginStyles.labelIcon} />
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={loginStyles.input}
              required
            />
          </div>

          {error && (
            <div className={loginStyles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className={loginStyles.button}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={loginStyles.toggle}>
          <button
            onClick={onToggle}
            className={loginStyles.toggleButton}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = (props) => {
  const { onToggle } = props;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData);
      showToast({ message: 'Account created successfully!', type: 'success' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className={loginStyles.container}>
      <div className={loginStyles.card}>
        <div className={loginStyles.header}>
          <div className={loginStyles.iconContainer}>
            <UserPlus className={loginStyles.icon} />
          </div>
          <h1 className={loginStyles.title}>Create Account</h1>
          <p className={loginStyles.subtitle}>Join the golf community</p>
        </div>

        <form onSubmit={handleSubmit} className={loginStyles.form}>
          <div className={loginStyles.inputGroup}>
            <label htmlFor="username" className={loginStyles.label}>
              <User className={loginStyles.labelIcon} />
              Username
            </label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={loginStyles.input}
              required
            />
          </div>

          <div className={loginStyles.inputGroup}>
            <label htmlFor="full_name" className={loginStyles.label}>
              Full Name (Optional)
            </label>
            <input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={loginStyles.input}
            />
          </div>

          <div className={loginStyles.inputGroup}>
            <label htmlFor="email" className={loginStyles.label}>
              <Mail className={loginStyles.labelIcon} />
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={loginStyles.input}
              required
            />
          </div>

          <div className={loginStyles.inputGroup}>
            <label htmlFor="password" className={loginStyles.label}>
              <Lock className={loginStyles.labelIcon} />
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={loginStyles.input}
              required
            />
          </div>

          {error && (
            <div className={loginStyles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.username || !formData.email || !formData.password}
            className={loginStyles.button}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={loginStyles.toggle}>
          <button
            onClick={onToggle}
            className={loginStyles.toggleButton}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// Layout Components
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <nav className={headerStyles.header}>
      <div className={headerStyles.container}>
        <div className={headerStyles.content}>
          <div className={headerStyles.logo}>
            <h1 className={headerStyles.logoText}>🏌️ GolfTracker</h1>
          </div>
          <div className={headerStyles.userSection}>
            <span className={headerStyles.userName}>Welcome, {user?.username}!</span>
            <Button
              onClick={logout}
              variant="secondary"
              size="small"
              className={headerStyles.logoutButton}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Navigation = (props) => {
  const { activeTab, onTabChange } = props;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
  ];

  return (
    <div className={navigationStyles.navigation}>
      <div className={navigationStyles.container}>
        <div className={navigationStyles.content}>
          <nav className={navigationStyles.nav}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`${navigationStyles.navItem} ${
                    activeTab === item.id ? navigationStyles.active : ''
                  }`}
                >
                  <Icon className={navigationStyles.navIcon} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Stats Components
const StatsCard = (props) => {
  const { title, value, icon: Icon, color = 'green' } = props;

  return (
    <div className={statsStyles.card}>
      <div className={statsStyles.content}>
        <Icon className={`${statsStyles.icon} ${statsStyles[color]}`} />
        <div className={statsStyles.info}>
          <p className={statsStyles.title}>{title}</p>
          <p className={statsStyles.value}>{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatsGrid = (props) => {
  const { stats } = props;

  const formatRelativeToPar = (relativeToPar) => {
    if (!relativeToPar) return '0';
    if (relativeToPar === 0) return 'E';
    return relativeToPar > 0 ? `+${relativeToPar}` : `${relativeToPar}`;
  };

  return (
    <div className={styles.statsGrid}>
      <StatsCard
        title="Total Rounds"
        value={stats?.total_rounds || 0}
        icon={Calendar}
        color="green"
      />
      <StatsCard
        title="Avg. ± Par"
        value={stats?.avg_relative_to_par ? formatRelativeToPar(Math.round(stats.avg_relative_to_par * 10) / 10) : '0'}
        icon={TrendingUp}
        color="blue"
      />
      <StatsCard
        title="Best Round"
        value={stats?.best_round ? formatRelativeToPar(stats.best_round.relative_to_par) : 'N/A'}
        icon={TrendingUp}
        color="green"
      />
      <StatsCard
        title="Courses Played"
        value={stats?.courses_played ? Object.keys(stats.courses_played).length : 0}
        icon={Home}
        color="purple"
      />
    </div>
  );
};

// Scorecard Components
const ScorecardCard = (props) => {
  const { scorecard } = props;

  const totalPar = scorecard.holes.reduce((sum, hole) => sum + hole.par, 0);
  const totalScore = scorecard.holes.reduce((sum, hole) => sum + hole.score, 0);
  const relativeToPar = totalScore - totalPar;

  const formatRelativeToPar = (value) => {
    if (value === 0) return 'E';
    return value > 0 ? `+${value}` : `${value}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreClass = (relToPar) => {
    if (relToPar < 0) return scorecardStyles.scoreUnderPar;
    if (relToPar === 0) return scorecardStyles.scoreEvenPar;
    if (relToPar <= 5) return scorecardStyles.scoreOverPar;
    return scorecardStyles.scoreOverParHigh;
  };

  return (
    <div className={scorecardStyles.card}>
      <div className={scorecardStyles.content}>
        <div className={scorecardStyles.header}>
          <div>
            <h3 className={scorecardStyles.title}>{scorecard.course_name}</h3>
            <div className={scorecardStyles.date}>
              <Calendar className={scorecardStyles.dateIcon} />
              {formatDate(scorecard.date_played)}
            </div>
          </div>
          <div className={`${scorecardStyles.score} ${getScoreClass(relativeToPar)}`}>
            {formatRelativeToPar(relativeToPar)}
          </div>
        </div>

        <div className={scorecardStyles.details}>
          <div className={scorecardStyles.detailItem}>
            <div className={scorecardStyles.detailValue}>{totalScore}</div>
            <div className={scorecardStyles.detailLabel}>Total Score</div>
          </div>
          <div className={scorecardStyles.detailItem}>
            <div className={scorecardStyles.detailValue}>{totalPar}</div>
            <div className={scorecardStyles.detailLabel}>Course Par</div>
          </div>
        </div>

        {scorecard.weather && (
          <div className={scorecardStyles.weather}>
            <MapPin className={scorecardStyles.weatherIcon} />
            {scorecard.weather}
          </div>
        )}

        {scorecard.notes && (
          <div className={scorecardStyles.notes}>
            "{scorecard.notes}"
          </div>
        )}
      </div>
    </div>
  );
};

const ScorecardsList = (props) => {
  const { scorecards } = props;

  if (scorecards.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Calendar className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No rounds yet</h3>
        <p className={styles.emptyText}>Get started by adding your first round.</p>
      </div>
    );
  }

  return (
    <div className={styles.scorecardGrid}>
      {scorecards.slice(0, 6).map((scorecard) => (
        <ScorecardCard key={scorecard.id} scorecard={scorecard} />
      ))}
    </div>
  );
};

// Friends Components
const FriendCodeDisplay = (props) => {
  const { friendCode } = props;

  return (
    <div className={styles.friendCodeCard}>
      <h2 className={styles.friendCodeTitle}>Your Friend Code</h2>
      <div className={styles.friendCodeContent}>
        <div className={styles.friendCode}>{friendCode}</div>
        <p className={styles.friendCodeText}>Share this code with friends to connect</p>
      </div>
    </div>
  );
};

const AddFriendForm = (props) => {
  const { onAddFriend } = props;
  const [friendCode, setFriendCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiService.addFriend(friendCode);
      setFriendCode('');
      onAddFriend();
      showToast({ message: 'Friend added successfully!', type: 'success' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    setFriendCode(event.target.value.toUpperCase());
  };

  return (
    <Card>
      <h2 className={styles.sectionTitle}>Add Friend</h2>
      <form onSubmit={handleSubmit} className={styles.addFriendForm}>
        <input
          value={friendCode}
          onChange={handleChange}
          placeholder="Enter friend code (e.g., ABC123)"
          className={styles.addFriendInput}
          maxLength={6}
        />
        <Button
          type="submit"
          disabled={isLoading || !friendCode.trim()}
        >
          {isLoading ? 'Adding...' : 'Add Friend'}
        </Button>
      </form>
      {error && (
        <div className={loginStyles.error}>
          {error}
        </div>
      )}
    </Card>
  );
};

const FriendCard = (props) => {
  const { friend, onRemove } = props;

  return (
    <div className={friendStyles.card}>
      <div className={friendStyles.content}>
        <div className={friendStyles.info}>
          <h3 className={friendStyles.name}>{friend.username}</h3>
          <p className={friendStyles.fullName}>{friend.full_name}</p>
          <p className={friendStyles.code}>Code: {friend.friend_code}</p>
        </div>
        <div className={friendStyles.actions}>
          <Button
            onClick={() => onRemove(friend.id)}
            variant="danger"
            size="small"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

const FriendsList = (props) => {
  const { friends, onRemoveFriend } = props;

  if (friends.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Users className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No friends yet</h3>
        <p className={styles.emptyText}>Add friends to see their golf progress.</p>
      </div>
    );
  }

  return (
    <div className={styles.friendsGrid}>
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          friend={friend}
          onRemove={onRemoveFriend}
        />
      ))}
    </div>
  );
};

// Page Components
const DashboardPage = () => {
  const [scorecards, setScorecards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scorecardsData, statsData] = await Promise.all([
          apiService.getScorecards(),
          apiService.getStats(),
        ]);
        setScorecards(scorecardsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.main}>
      <div>
        <StatsGrid stats={stats} />
        
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Rounds</h2>
          </div>
          <div className={styles.sectionContent}>
            <ScorecardsList scorecards={scorecards} />
          </div>
        </div>
      </div>
    </div>
  );
};

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsData = await apiService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await apiService.request({
        endpoint: `/friends/${friendId}`,
        options: { method: 'DELETE' }
      });
      await loadFriends();
      showToast({ message: 'Friend removed successfully', type: 'success' });
    } catch (error) {
      console.error('Error removing friend:', error);
      showToast({ message: 'Failed to remove friend', type: 'error' });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.main}>
      <div>
        <FriendCodeDisplay friendCode={user?.friend_code} />
        <AddFriendForm onAddFriend={loadFriends} />
        
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Friends ({friends.length})</h2>
          </div>
          <div className={styles.sectionContent}>
            <FriendsList friends={friends} onRemoveFriend={handleRemoveFriend} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return isLogin ? (
      <LoginForm onToggle={() => setIsLogin(false)} />
    ) : (
      <RegisterForm onToggle={() => setIsLogin(true)} />
    );
  }

  return (
    <div className={styles.app}>
      <Header />
      
      <main>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'friends' && <FriendsPage />}
        {activeTab === 'stats' && <DashboardPage />}
      </main>
    </div>
  );
};

// Root component with providers
const GolfTracker = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  );
};

export default GolfTracker;