import { useState } from 'react';
import { motion } from 'framer-motion';

import BorderGlow from '../../borderGlow/borderGlow';
import TextType from '../../textType/textType';
import CustomSelect from '../../CustomSelect/CustomSelect';
import AxiosInstance from '../../Axios';

import HappyDentLogo from '../../logos/HappyDent_logo.png';
import HappyDentWordLogo from '../../logos/HappyDent_word_logo.png'
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../auth';

import UseToast from '../../Toast/Toast';

const Login = ({ setToast }) => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate()

  const inputStyle = {
    width: '100%',
    padding: '10px 16px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    color: '#120F17',
    outline: 'none',
    fontSize: '15px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    marginBottom: '6px',
    color: '#120F17',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '500',
  };

  const fieldContainerStyle = { marginBottom: '15px' };

  const primaryButtonStyle = {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #1564f7, #9ED14E)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '15px',
  };

  // Login and Sign Up constants
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    date_of_birth: "",
    gender: "male",

  });


  const handleLogin = async () => {
    try {
      const { data } = await AxiosInstance.post("/login/", loginData);

      console.log("LOGIN RESPONSE:", data);

      login(data.access, data.refresh, data.user, data.staff_role);

      console.log("AFTER LOGIN CALL TOKEN:", localStorage.getItem("token"));

      setToast({show: true, message: 'Login Successful', type: 'success'});

      // Role-based navigation
      if (data.staff_role === "doctor") {
        navigate("/homedoctor");
      } 
      else if (data.staff_role === "management") {
        navigate("/homemanagement");
      } 
      else {
        navigate("/");
      }

    } catch (error) {
      setToast({show: true, message: error.response?.data?.error || "Login failed", type: 'danger'});
    }
  };


  const handleSignup = async () => {
  try {
    const { data } = await AxiosInstance.post("/signup/", signupData);

    setToast({show: true, message: data.message, type: 'success'});

    setSignupData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      date_of_birth: "",
      gender: "male",
    });

    setActiveTab("login");

  } catch (error) {
    setToast({show: true, message: error.response?.data?.error || "SignUp failed", type: 'danger'});
  }
};


  return (
    <>
    <div className="login-page-layout">

      {/* ── LEFT: Branding panel ── */}
      <div className="login-left-panel">
        <div className="login-left-content">
          <div className="login-brand-logo">
            <img 
                  src={HappyDentLogo} 
                  alt="HappyDent Logo"
                  style = {{height: '20px'}}
                />
            <img 
                  src={HappyDentWordLogo} 
                  alt="HappyDentWord Logo"
                  style = {{height: '20px'}}
                />
          </div>
          
          <div className="text-type-wrapper">
            <TextType
              text={['Welcome To HappyDent', 'Login to Our Website', 'Or Sign Up']}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor
              cursorCharacter="_"
            />
          </div>
          <p className="login-left-tagline">
            Your smile is our priority.<br />
            Manage appointments, records,<br />
            and more — all in one place.
          </p>
        </div>
      </div>

      {/* ── RIGHT: Auth card ── */}
      <div className="login-right-panel">
        <div className="auth-slider-container">
          <BorderGlow borderRadius={40} backgroundColor="#ffffff" colors={['#0a570f', '#5c24a5', '#3b38f8']}>

            {/* Tab bar */}
            <div className="auth-tab-bar">
              <motion.div
                className="auth-tab-pill"
                animate={{ x: activeTab === 'login' ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              />
              <button
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button
                className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Sliding panels */}
            <div className="auth-viewport">
              <motion.div
                className="auth-track"
                animate={{ x: activeTab === 'login' ? '0%' : '-50%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 38 }}
              >
                {/* LOGIN PANEL */}
                <div className="auth-panel">
                  <h2 style={{ textAlign: 'center', color: '#120F17', marginBottom: '30px' }}>
                    Login
                  </h2>

                  <div style={fieldContainerStyle}>
                    <h4 style={labelStyle}>Email</h4>
                    <input type="email" placeholder="Enter email" style={inputStyle} value={loginData.email} 
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}/>
                  </div>

                  <div style={fieldContainerStyle}>
                    <h4 style={labelStyle}>Password</h4>
                    <input type="password" placeholder="Enter password" style={inputStyle} value={loginData.password} 
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}/>
                  </div>

                  <button style={primaryButtonStyle} onClick={handleLogin}>Log In</button>

                  <p className="auth-switch-text">
                    Don't have an account?{' '}
                    <button className="auth-switch-btn" onClick={() => setActiveTab('signup')}>
                      Sign Up
                    </button>
                  </p>
                </div>

                {/* SIGNUP PANEL */}
                <div className="auth-panel">
                  <h2 style={{ textAlign: 'center', color: '#120F17', marginBottom: '20px' }}>
                    Create Account
                  </h2>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ ...fieldContainerStyle, flex: 1 }}>
                      <h4 style={labelStyle}>First Name</h4>
                      <input type="text" placeholder="First Name" style={inputStyle} value={signupData.first_name} 
                      onChange={(e) => setSignupData({...signupData, first_name: e.target.value})}/>
                    </div>
                    <div style={{ ...fieldContainerStyle, flex: 1 }}>
                      <h4 style={labelStyle}>Last Name</h4>
                      <input type="text" placeholder="Last Name" style={inputStyle} value={signupData.last_name} 
                    onChange={(e) => setSignupData({...signupData, last_name: e.target.value})}/>
                    </div>
                  </div>

                  <div style={fieldContainerStyle}>
                    <h4 style={labelStyle}>Email</h4>
                    <input type="email" placeholder="Email" style={inputStyle} value={signupData.email} 
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}/>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ ...fieldContainerStyle, flex: 1 }}>
                      <h4 style={labelStyle}>Password</h4>
                      <input type="password" placeholder="Password" style={inputStyle} value={signupData.password} 
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}/>
                    </div>

                    <div style={{ ...fieldContainerStyle, flex: 1 }}>
                      <h4 style={labelStyle}>Confirm Password</h4>
                      <input type="password" placeholder="Confirm" style={inputStyle} value={signupData.confirm_password} 
                    onChange={(e) => setSignupData({...signupData, confirm_password: e.target.value})}/>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>

                    <div style={fieldContainerStyle}>
                      <h4 style={labelStyle}>Date of Birth</h4>
                      <input type="date" style={inputStyle} value={signupData.date_of_birth} 
                    onChange={(e) => setSignupData({...signupData, date_of_birth: e.target.value})}/>
                    </div>

                    <div style={{ ...fieldContainerStyle, flex: 1 }}>
                      <h4 style={labelStyle}>Gender</h4>
                      <CustomSelect
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                        ]}
                        value={signupData.gender}
                        onChange={(value) => 
                          setSignupData({
                            ...signupData,
                            gender: value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <button style={primaryButtonStyle} onClick={handleSignup}>Sign Up</button>
                  <p className="auth-switch-text">
                    Already have an account?{' '}
                    <button className="auth-switch-btn" onClick={() => setActiveTab('login')}>
                      Login
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>

          </BorderGlow>
        </div>
      </div>

    </div>
  </>
  );
};

export default Login;