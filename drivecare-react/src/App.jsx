import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './legacyScript.js';
import './supabaseClient.js';
import Auth from './screens/Auth.jsx';
import Home from './screens/Home.jsx';
import Booking from './screens/Booking.jsx';
import Tracking from './screens/Tracking.jsx';
import Rating from './screens/Rating.jsx';
import UserProfile from './screens/UserProfile.jsx';
import UserHistory from './screens/UserHistory.jsx';

import UserPrivacy from './screens/UserPrivacy.jsx';
import UserHelp from './screens/UserHelp.jsx';
import MechHome from './screens/MechHome.jsx';
import MechSvcComplete from './screens/MechSvcComplete.jsx';
import MechHistory from './screens/MechHistory.jsx';
import MechEarningsScreen from './screens/MechEarningsScreen.jsx';
import MechProfile from './screens/MechProfile.jsx';
import MechPrivacy from './screens/MechPrivacy.jsx';
import MechHelp from './screens/MechHelp.jsx';
import AdminLogin from './screens/AdminLogin.jsx';
import AdminPortal from './screens/AdminPortal.jsx';
import { Sidebar, GlobalModals, IntegrityModals, BottomNav, MechBottomNav } from './components/Globals.jsx';

function RouteBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.reactNavigate = (id) => {
      const pathMap = {
        auth: '/',
        home: '/home',
        booking: '/booking',
        tracking: '/tracking',
        rating: '/rating',
        userProfile: '/userProfile',
        userHistory: '/userHistory',

        userPrivacy: '/userPrivacy',
        userHelp: '/userHelp',
        mechHome: '/mechHome',
        mechSvcComplete: '/mechSvcComplete',
        mechHistory: '/mechHistory',
        mechEarningsScreen: '/mechEarningsScreen',
        mechProfile: '/mechProfile',
        mechPrivacy: '/mechPrivacy',
        mechHelp: '/mechHelp',
        adminLogin: '/adminLogin',
        adminPortal: '/adminPortal'
      };
      const path = pathMap[id] || '/home';
      navigate(path);
    };
  }, [navigate]);

  return null;
}

function BottomNavWrapper() {
  const location = useLocation();
  const path = location.pathname;

  // Show user bottom nav on user screens
  const userPaths = ['/home', '/userHistory', '/userProfile', '/userPrivacy', '/userHelp'];
  if (userPaths.includes(path)) {
    let activeTab = 'home';
    if (path === '/userHistory') activeTab = 'history';
    if (path === '/userProfile' || path === '/userPrivacy' || path === '/userHelp') activeTab = 'profile';
    return <BottomNav activeTab={activeTab} />;
  }

  // Show mechanic bottom nav on mechanic screens
  const mechPaths = ['/mechHome', '/mechSvcComplete', '/mechHistory', '/mechEarningsScreen', '/mechProfile', '/mechPrivacy', '/mechHelp'];
  if (mechPaths.includes(path)) {
    let activeTab = 'home';
    if (path === '/mechSvcComplete') activeTab = 'service';
    if (path === '/mechHistory') activeTab = 'history';
    if (path === '/mechEarningsScreen') activeTab = 'earnings';
    if (path === '/mechProfile' || path === '/mechPrivacy' || path === '/mechHelp') activeTab = 'profile';
    return <MechBottomNav activeTab={activeTab} />;
  }

  return null;
}

export default function App() {
  useEffect(() => {
    if (window.initApp) {
      window.initApp();
    }
  }, []);

  return (
    <Router>
      <RouteBridge />
      <div id="app-shell" style={{display: "flex", width: "100%", height: "100vh", overflow: "hidden"}}>
        <Sidebar />
        <div id="main-area" style={{flex: 1, display: "flex", flexDirection: "column", position: "relative", minWidth: 0}}>
          <GlobalModals />
          <IntegrityModals />
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/rating" element={<Rating />} />
            <Route path="/userProfile" element={<UserProfile />} />
            <Route path="/userHistory" element={<UserHistory />} />
            <Route path="/userPrivacy" element={<UserPrivacy />} />
            <Route path="/userHelp" element={<UserHelp />} />
            <Route path="/mechHome" element={<MechHome />} />
            <Route path="/mechSvcComplete" element={<MechSvcComplete />} />
            <Route path="/mechHistory" element={<MechHistory />} />
            <Route path="/mechEarningsScreen" element={<MechEarningsScreen />} />
            <Route path="/mechProfile" element={<MechProfile />} />
            <Route path="/mechPrivacy" element={<MechPrivacy />} />
            <Route path="/mechHelp" element={<MechHelp />} />
            <Route path="/adminLogin" element={<AdminLogin />} />
            <Route path="/adminPortal" element={<AdminPortal />} />
          </Routes>
          <BottomNavWrapper />
        </div>
      </div>
    </Router>
  );
}
