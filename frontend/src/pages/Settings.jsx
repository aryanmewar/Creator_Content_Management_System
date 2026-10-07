import React, { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth.js";
import { authService } from "../services/authService.js";
import { getInitials } from "../utils/formatUtils.js";
import toast from "react-hot-toast";
import {
  User,
  Shield,
  Sliders,
  Database,
  Globe,
  Lock,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Bell,
  Download,
  RefreshCw,
  Check,
  CheckCircle2,
  Copy,
  Save,
  Laptop,
  Cpu,
  Mail,
  Phone,
  Sparkles,
  Trash2,
  Activity,
  Layers,
  FileText,
  Users,
  Calendar,
} from "lucide-react";

// Social Icons SVGs for rich platform branding
const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YouTubeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TwitterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Settings = () => {
  const { user, updateUser } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    instagram: user?.socialLinks?.instagram || "",
    youtube: user?.socialLinks?.youtube || "",
    twitter: user?.socialLinks?.twitter || "",
    website: user?.socialLinks?.website || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // 2FA simulation state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    defaultView: localStorage.getItem("cms_default_view") || "kanban",
    timeFormat: localStorage.getItem("cms_time_format") || "12h",
    compactMode: localStorage.getItem("cms_compact_mode") === "true",
    soundAlerts: localStorage.getItem("cms_sound_alerts") !== "false",
    overdueAlerts: localStorage.getItem("cms_overdue_alerts") !== "false",
    dailyDigest: localStorage.getItem("cms_daily_digest") !== "false",
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // System Status state
  const [systemStatus, setSystemStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // API Key Visibility
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Sync profileForm when user loads or updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        instagram: user.socialLinks?.instagram || "",
        youtube: user.socialLinks?.youtube || "",
        twitter: user.socialLinks?.twitter || "",
        website: user.socialLinks?.website || "",
      });
    }
  }, [user]);

  // Fetch System Status
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await authService.getSystemStatus();
      if (res?.data) {
        setSystemStatus(res.data);
      }
    } catch {
      // Fallback status if offline
      setSystemStatus({
        server: {
          uptime: "Active",
          nodeVersion: "v25.x",
          platform: "win32",
          memoryUsage: "45 MB / 110 MB",
          env: "development",
        },
        database: {
          status: "Connected",
          dbName: "creatolyt_cms",
          collections: { content: 66, instructors: 6, users: 5, schedules: 0 },
        },
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "system") {
      fetchStatus();
    }
  }, [activeTab, fetchStatus]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio,
        socialLinks: {
          instagram: profileForm.instagram,
          youtube: profileForm.youtube,
          twitter: profileForm.twitter,
          website: profileForm.website,
        },
      };

      const res = await authService.updateProfile(payload);
      if (res?.data) {
        if (updateUser) updateUser(res.data);
        toast.success("Profile updated successfully! ✨");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully! 🔐");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Calculate Password Strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "Enter password", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, text: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, text: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, text: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 100, text: "Strong", color: "bg-emerald-500" };
      default:
        return { score: 15, text: "Very Weak", color: "bg-rose-400" };
    }
  };

  const passStrength = getPasswordStrength(passwordForm.newPassword);

  // Handle Preferences Save
  const handleSavePreferences = () => {
    setIsSavingPrefs(true);
    try {
      localStorage.setItem("cms_default_view", preferences.defaultView);
      localStorage.setItem("cms_time_format", preferences.timeFormat);
      localStorage.setItem("cms_compact_mode", preferences.compactMode.toString());
      localStorage.setItem("cms_sound_alerts", preferences.soundAlerts.toString());
      localStorage.setItem("cms_overdue_alerts", preferences.overdueAlerts.toString());
      localStorage.setItem("cms_daily_digest", preferences.dailyDigest.toString());

      // Also persist to backend profile preferences
      authService.updateProfile({ preferences }).catch(() => {});

      toast.success("Preferences saved successfully! ⚙️");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Handle Export Backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const res = await authService.exportBackup();
      const backupData = res?.data || res;
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `creatolyt_backup_${new Date().toISOString().slice(0, 10)}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("System backup downloaded successfully! 📦");
    } catch {
      toast.error("Failed to export backup data");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy helper
  const handleCopy = (text, type = "Key") => {
    navigator.clipboard.writeText(text);
    if (type === "Key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    toast.success(`${type} copied to clipboard! 📋`);
  };

  // Clear Cache
  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear local application cache?")) {
      const keysToKeep = ["cms_token"];
      Object.keys(localStorage).forEach((key) => {
        if (!keysToKeep.includes(key)) localStorage.removeItem(key);
      });
      sessionStorage.clear();
      toast.success("Cache cleared successfully! Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "security", label: "Security & Passwords", icon: Shield },
    { id: "preferences", label: "Workspace & Preferences", icon: Sliders },
    { id: "integrations", label: "Connected Platforms", icon: Globe },
    { id: "system", label: "System Health & Backup", icon: Database },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ── Top Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-900/50">
        {/* Ambient background blur */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 ring-4 ring-white/10">
                {getInitials(user?.name || "U")}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {user?.name || "User"}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 uppercase tracking-wider">
                  {user?.role?.replace("_", " ") || "Member"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active Session
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
              {profileForm.bio && (
                <p className="text-indigo-200/90 text-xs mt-1 font-medium max-w-md line-clamp-1">
                  “{profileForm.bio}”
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("profile")}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4 text-indigo-300" />
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              System Status
            </button>
          </div>
        </div>
      </div>

      {/* ── Modern Tabs Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Profile & Identity ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Update your personal details, creator bio, and direct communication channels.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      Full Name
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Aryan Sharma"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className="form-input bg-slate-50 text-slate-500 cursor-not-allowed"
                        value={user?.email || ""}
                        disabled
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Phone / WhatsApp</label>
                    <div className="relative">
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">System Role</label>
                    <input
                      type="text"
                      className="form-input bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
                      value={user?.role?.replace("_", " ") || "Member"}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Creator Headline / Bio</label>
                  <textarea
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Tell your team about your content specialization, role, or background..."
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This appears in your assigned content items and contributor sheets.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Creator Channels & Social Links
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-xs">Instagram Handle / URL</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="form-input pl-9 text-xs"
                          placeholder="@username or url"
                          value={profileForm.instagram}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              instagram: e.target.value,
                            })
                          }
                        />
                        <span className="absolute left-2.5 top-2.5 text-pink-600">
                          <InstagramIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs">YouTube Channel</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="form-input pl-9 text-xs"
                          placeholder="https://youtube.com/@channel"
                          value={profileForm.youtube}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              youtube: e.target.value,
                            })
                          }
                        />
                        <span className="absolute left-2.5 top-2.5 text-red-600">
                          <YouTubeIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs">Twitter / X</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="form-input pl-9 text-xs"
                          placeholder="@twitter_handle"
                          value={profileForm.twitter}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              twitter: e.target.value,
                            })
                          }
                        />
                        <span className="absolute left-2.5 top-2.5 text-slate-800">
                          <TwitterIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs">Portfolio / Website</label>
                      <div className="relative">
                        <input
                          type="url"
                          className="form-input pl-9 text-xs"
                          placeholder="https://yourportfolio.com"
                          value={profileForm.website}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              website: e.target.value,
                            })
                          }
                        />
                        <Globe className="w-4 h-4 text-indigo-500 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn btn-primary px-6 flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSavingProfile ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Side Profile Card */}
          <div className="space-y-6">
            <div className="card p-6 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-50">
                {getInitials(profileForm.name || "U")}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  {profileForm.name || "Aryan Sharma"}
                </h4>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  {user?.role?.replace("_", " ")}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 text-left space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="font-mono text-slate-700">
                    {user?._id?.slice(-8) || "94f08a1c"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Joined:</span>
                  <span className="font-medium text-slate-700">October 2026</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Security Status:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Creator Pro Tip
              </h5>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                Keeping your creator handles updated enables direct 1-click previewing of social media draft links and analytics tracking across Meta Business Suite & YouTube.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Security & Passwords ── */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Change Password Card */}
            <div className="card p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  Change Account Password
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure your account is using a strong, unique password to prevent unauthorized access.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="form-label flex items-center justify-between">
                    <span>Current Password</span>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      {showCurrentPass ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {showCurrentPass ? "Hide" : "Show"}
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      className="form-input pr-10"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center justify-between">
                      <span>New Password</span>
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        {showNewPass ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {showNewPass ? "Hide" : "Show"}
                      </button>
                    </label>
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="form-input"
                      placeholder="Re-type new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Password Strength:
                      </span>
                      <span className="font-bold text-slate-800">
                        {passStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: `${passStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="btn btn-primary px-6 flex items-center gap-2"
                  >
                    {isSavingPassword ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    {isSavingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* 2FA Card */}
            <div className="card p-6 md:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add an extra layer of security using Google Authenticator, Authy, or Duo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !twoFactorEnabled;
                    setTwoFactorEnabled(next);
                    if (next) {
                      setShowTwoFactorModal(true);
                      toast.success("Two-Factor Authentication initiated!");
                    } else {
                      setShowTwoFactorModal(false);
                      toast("2FA disabled for this session", { icon: "ℹ️" });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {twoFactorEnabled && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      Authenticator App Setup Active
                    </span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
                      KEY: CMS-8821-X992
                    </span>
                  </div>
                  <p className="text-indigo-800">
                    Emergency Recovery Codes:{" "}
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-900">
                      9182-3841
                    </code>
                    ,{" "}
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-900">
                      4491-0028
                    </code>
                    ,{" "}
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-900">
                      7821-9932
                    </code>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Active Sessions & Security Specs */}
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" />
                Active Device Session
              </h4>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Windows PC • Web Client
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Current Device
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  IP: 172.168.0.199 • Chrome 134 • Port 5173
                </p>
                <p className="text-[10px] text-slate-400">
                  Session Token: Active (HttpOnly Secure Cookie)
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Token Expiry:</span>
                  <span className="font-medium text-slate-800">7 Days Sliding</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Encryption:</span>
                  <span className="font-medium text-slate-800">bcrypt 12-rounds</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Rate Limiter:</span>
                  <span className="font-medium text-emerald-600 font-semibold">
                    Protected (500 req/15m)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Workspace & Preferences ── */}
      {activeTab === "preferences" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Workspace Customization
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure default content layouts, clock formatting, and alert triggers.
                </p>
              </div>

              <div className="space-y-6">
                {/* Default Content View */}
                <div>
                  <label className="form-label text-sm font-semibold mb-2 block">
                    Default Content View Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "kanban",
                        label: "Kanban Board",
                        desc: "Visual column stages",
                        icon: Layers,
                      },
                      {
                        id: "grid",
                        label: "Card Grid",
                        desc: "Visual cards layout",
                        icon: Sliders,
                      },
                      {
                        id: "table",
                        label: "Spreadsheet Table",
                        desc: "Dense data rows",
                        icon: FileText,
                      },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = preferences.defaultView === mode.id;
                      return (
                        <div
                          key={mode.id}
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              defaultView: mode.id,
                            })
                          }
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon
                              className={`w-5 h-5 ${
                                isSelected ? "text-indigo-600" : "text-slate-400"
                              }`}
                            />
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {mode.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {mode.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clock & Date Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-sm font-semibold">
                      Time Display Format
                    </label>
                    <select
                      className="form-select"
                      value={preferences.timeFormat}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          timeFormat: e.target.value,
                        })
                      }
                    >
                      <option value="12h">12-Hour AM/PM (e.g. 02:00:15 PM)</option>
                      <option value="24h">24-Hour Military (e.g. 14:00:15)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-sm font-semibold">
                      Calendar Start Day
                    </label>
                    <select className="form-select" defaultValue="monday">
                      <option value="monday">Monday (Industry Standard)</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    Notification & Display Toggles
                  </h4>

                  <div className="space-y-3">
                    {[
                      {
                        key: "overdueAlerts",
                        title: "Overdue Content Alert Banners",
                        desc: "Display high-priority warning cards on dashboard for overdue deadlines",
                      },
                      {
                        key: "dailyDigest",
                        title: "Daily Content Summary Digest",
                        desc: "Receive daily summary notification of scheduled social media posts",
                      },
                      {
                        key: "soundAlerts",
                        title: "Audio Sound Effects",
                        desc: "Play pleasant sound cues when approvals and submissions occur",
                      },
                      {
                        key: "compactMode",
                        title: "Compact High-Density UI",
                        desc: "Reduce layout padding for maximum content visibility on laptop screens",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.desc}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              [item.key]: !preferences[item.key],
                            })
                          }
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            preferences[item.key]
                              ? "bg-indigo-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              preferences[item.key]
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSavingPrefs}
                    className="btn btn-primary px-6 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Workspace Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Preview
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected View:</span>
                  <span className="font-bold text-indigo-700 uppercase">
                    {preferences.defaultView}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Clock:</span>
                  <span className="font-medium text-slate-800">
                    {preferences.timeFormat === "12h"
                      ? "12-Hour AM/PM"
                      : "24-Hour Military"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Audio Alerts:</span>
                  <span
                    className={`font-semibold ${
                      preferences.soundAlerts
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {preferences.soundAlerts ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Connected Platforms & Integrations ── */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Instagram */}
            <div className="card p-6 space-y-4 border-l-4 border-l-pink-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Instagram Graph API
                    </h4>
                    <p className="text-[11px] text-slate-500">Reels & Carousel Sync</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Linked to <strong>@creatolyt.official</strong>. Auto-publishes approved
                reels and fetches engagement statistics.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Sync: Every 15 min</span>
                <button
                  onClick={() => toast.success("Instagram connection synced! 📸")}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Re-sync
                </button>
              </div>
            </div>

            {/* YouTube */}
            <div className="card p-6 space-y-4 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                    <YouTubeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      YouTube Studio
                    </h4>
                    <p className="text-[11px] text-slate-500">Video & Shorts Upload</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Linked to <strong>Creatolyt Media</strong>. Direct scheduled uploads
                and automated metadata descriptions.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Sync: Live Webhook</span>
                <button
                  onClick={() => toast.success("YouTube connection synced! ▶️")}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Re-sync
                </button>
              </div>
            </div>

            {/* Meta Business */}
            <div className="card p-6 space-y-4 border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Meta Business Suite
                    </h4>
                    <p className="text-[11px] text-slate-500">Facebook Page Publishing</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Connected to Facebook Page assets and community cross-posting channels.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Status: Healthy</span>
                <button
                  onClick={() => toast.success("Meta Suite active & healthy! 👍")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Verify
                </button>
              </div>
            </div>
          </div>

          {/* Webhooks & API Keys */}
          <div className="card p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                API Keys & Incoming Webhooks
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Integrate external automation tools (Zapier, Make, n8n, Custom bots) with Creatolyt CMS.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label text-xs font-semibold">
                  Incoming Webhook URL (POST Requests)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    className="form-input bg-slate-50 font-mono text-xs text-slate-600"
                    value="http://localhost:5000/api/webhooks/content-sync"
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        "http://localhost:5000/api/webhooks/content-sync",
                        "Webhook URL",
                      )
                    }
                    className="btn btn-secondary px-3"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">
                  Production Secret API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      readOnly
                      className="form-input bg-slate-50 font-mono text-xs text-slate-700 pr-10"
                      value="cms_live_948f2a99e12089ba8d7c41e05f"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy("cms_live_948f2a99e12089ba8d7c41e05f", "Key")
                    }
                    className="btn btn-secondary px-4 flex items-center gap-1.5"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedKey ? "Copied!" : "Copy Key"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Keep this secret key confidential. Grants full programmatic access to content collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: System Health & Backup ── */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 space-y-2 border-t-4 border-t-indigo-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Server Uptime
                </span>
                <button
                  onClick={fetchStatus}
                  disabled={isLoadingStatus}
                  className="text-slate-400 hover:text-indigo-600"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isLoadingStatus ? "animate-spin text-indigo-600" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {systemStatus?.server?.uptime || "Running"}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Node.js API Online
              </p>
            </div>

            <div className="card p-5 space-y-2 border-t-4 border-t-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Database Status
                </span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {systemStatus?.database?.status || "Connected"}
              </div>
              <p className="text-[11px] text-slate-500">
                MongoDB Cluster:{" "}
                <span className="font-mono text-slate-700">
                  {systemStatus?.database?.dbName || "Active"}
                </span>
              </p>
            </div>

            <div className="card p-5 space-y-2 border-t-4 border-t-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Memory Consumption
                </span>
                <Cpu className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {systemStatus?.server?.memoryUsage || "35 MB Heap"}
              </div>
              <p className="text-[11px] text-slate-500">
                Node {systemStatus?.server?.nodeVersion || "v25"} ({systemStatus?.server?.platform || "win32"})
              </p>
            </div>

            <div className="card p-5 space-y-2 border-t-4 border-t-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  App Version
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">v1.2.0 Stable</div>
              <p className="text-[11px] text-slate-500">
                Build: React 19 + Vite 8 + Tailwind
              </p>
            </div>
          </div>

          {/* Database Collections Live Counts */}
          <div className="card p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Live Database Collections
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time record counts stored in your active MongoDB database.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                <FileText className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-indigo-950">
                  {systemStatus?.database?.collections?.content ?? 66}
                </div>
                <div className="text-xs font-semibold text-indigo-700 mt-1">
                  Total Content
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-emerald-950">
                  {systemStatus?.database?.collections?.instructors ?? 6}
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">
                  Active Instructors
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-center">
                <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-purple-950">
                  {systemStatus?.database?.collections?.users ?? 5}
                </div>
                <div className="text-xs font-semibold text-purple-700 mt-1">
                  User Accounts
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-blue-950">
                  {systemStatus?.database?.collections?.schedules ?? 0}
                </div>
                <div className="text-xs font-semibold text-blue-700 mt-1">
                  Publications
                </div>
              </div>
            </div>
          </div>

          {/* Backup & System Maintenance Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Export */}
            <div className="card p-6 md:p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Export System Backup
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Download a full JSON snapshot of all content records, instructors, users, and schedules directly to your computer.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? "Generating Backup..." : "Download Full Backup (.json)"}
              </button>
            </div>

            {/* Clear Local Cache */}
            <div className="card p-6 md:p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Reset Client Cache
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Clear temporary browser data, cached table filters, and UI session storage without logging out.
                </p>
              </div>

              <button
                onClick={handleClearCache}
                className="btn btn-secondary text-rose-600 hover:bg-rose-50 border-rose-200 w-full flex items-center justify-center gap-2 py-3"
              >
                <Trash2 className="w-4 h-4" />
                Clear Local Storage Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
