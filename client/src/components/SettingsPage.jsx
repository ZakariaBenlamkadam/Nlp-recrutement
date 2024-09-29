import React from 'react';
import './SettingsPage.css'; 
import { User, Globe, Bell, Shield, LogOut, UserMinus, FileText } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      {/* Profile Settings */}
      <div className="card2">
        <div className="card2-header">
          <h2 className="card2-title">
            <User className="icon10" />
            Profile Settings
          </h2>
        </div>
        <div className="card2-content">
          <div className="profile-info">
            <div className="avatar">
              <img src="profile.png"  alt='' className="avatar-image" />
              
            </div>
            <button className="button outline">Change Picture</button>
          </div>
          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <input id="username" placeholder='zakaria69' className="input" />
          </div>
          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <input id="username" placeholder='zakaria69' className="input" />
          </div>
          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <input id="username" placeholder='zakaria69' className="input" />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="input-label">New Password</label>
            <input id="password" type="password" placeholder='********' className="input" />
          </div>
          <button className="button">Update Profile</button>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="card2">
        <div className="card2-header">
          <h2 className="card2-title">
            <Globe className="icon10" />
            Language Preferences
          </h2>
        </div>
        <div className="card2-content">
          <select className="input1 select"> 
            <option value="" disabled>Select a language</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="arabic">Arabic</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card2">
        <div className="card2-header">
          <h2 className="card2-title">
            <Bell className="icon10" />
            Notification Settings
          </h2>
        </div>
        <div className="card2-content">
          <div className="switch-group">
            <label className="switch-label">Email Notifications</label>
            <input type="checkbox" className="switch" />
          </div>
          <div className="switch-group">
            <label className="switch-label">SMS Notifications</label>
            <input type="checkbox" className="switch" />
          </div>
          <div className="switch-group">
            <label className="switch-label">Push Notifications</label>
            <input type="checkbox" className="switch" />
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="card2">
        <div className="card2-header">
          <h2 className="card2-title">
            <Shield className="icon10" />
            Account Management
          </h2>
        </div>
        <div className="card2-content2">
          <button className="button danger">
            <UserMinus className="icon10" /> Deactivate Account
          </button>
          <button className="button outline">
            <LogOut className="icon10" /> Log Out
          </button>
        </div>
      </div>

      {/* Document Management */}
      <div className="card2">
        <div className="card2-header">
          <h2 className="card2-title">
            <FileText className="icon10" />
            Document Management
          </h2>
        </div>
        <div className="card2-content">
          <button className="button">Upload Documents</button>
        </div>
      </div>
    </div>
  );
}
