import React from 'react';
import './SettingsPage.css'; // Import the CSS file for styles
import { User, Globe, Bell, Shield, LogOut, UserMinus, FileText } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      {/* Profile Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <User className="icon" />
            Profile Settings
          </h2>
        </div>
        <div className="card-content">
          <div className="profile-info">
            <div className="avatar">
              <img src="/placeholder.svg" alt="Profile" className="avatar-image" />
              <div className="avatar-fallback">JD</div>
            </div>
            <button className="button outline">Change Picture</button>
          </div>
          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <input id="username" defaultValue="johndoe" className="input" />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="input-label">New Password</label>
            <input id="password" type="password" className="input" />
          </div>
          <button className="button">Update Profile</button>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Globe className="icon" />
            Language Preferences
          </h2>
        </div>
        <div className="card-content">
          <select className="input select"> {/* Using input styling for select */}
            <option value="" disabled>Select a language</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="arabic">Arabic</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Bell className="icon" />
            Notification Settings
          </h2>
        </div>
        <div className="card-content">
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
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Shield className="icon" />
            Account Management
          </h2>
        </div>
        <div className="card-content">
          <button className="button danger">
            <UserMinus className="icon" /> Deactivate Account
          </button>
          <button className="button outline">
            <LogOut className="icon" /> Log Out
          </button>
        </div>
      </div>

      {/* Document Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileText className="icon" />
            Document Management
          </h2>
        </div>
        <div className="card-content">
          <button className="button">Upload Documents</button>
        </div>
      </div>
    </div>
  );
}
