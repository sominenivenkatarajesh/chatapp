import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Trash2, Calendar, Phone, Edit2, Check, X, Key, Image as ImageIcon, MessageSquare, Users, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, deleteAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const bannerInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    username: authUser?.username || "",
    email: authUser?.email || "",
    phone: authUser?.phone || authUser?.phoneNumber || "",
    gender: authUser?.gender || "",
    bio: authUser?.bio || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent and will delete all your messages.")) {
      await deleteAccount();
    }
  };

  const handleImageUpload = async (e, type = "profile") => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      if (type === "banner") {
        setSelectedBanner(base64Image);
        await updateProfile({ bannerPic: base64Image });
      } else {
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
      }
    };
  };

  const handleRemoveBanner = async () => {
    setSelectedBanner("");
    await updateProfile({ bannerPic: "" });
  };

  const handleSave = async () => {
    const dataToUpdate = {};
    if (formData.username !== authUser.username) dataToUpdate.username = formData.username;
    if (formData.email !== authUser.email) dataToUpdate.email = formData.email;
    if (formData.phone !== authUser.phone && formData.phone !== authUser.phoneNumber) dataToUpdate.phoneNumber = formData.phone;
    if (formData.gender !== authUser.gender) dataToUpdate.gender = formData.gender;
    if (formData.bio !== authUser.bio) dataToUpdate.bio = formData.bio;
    
    if (formData.currentPassword && formData.newPassword) {
      dataToUpdate.currentPassword = formData.currentPassword;
      dataToUpdate.newPassword = formData.newPassword;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await updateProfile(dataToUpdate);
    }
    setIsEditing(false);
    setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hasCustomBanner = Boolean(selectedBanner || authUser?.bannerPic);

  return (
    <div className="h-full bg-bg overflow-y-auto custom-scrollbar pb-20 relative">
      
      {/* Decorative Header Banner (Reduced from 40% height to sleek proportional header) */}
      <div className="w-full h-36 sm:h-44 md:h-48 relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border-b border-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] group">
        {hasCustomBanner ? (
          <img 
            src={selectedBanner || authUser?.bannerPic} 
            className="w-full h-full object-cover" 
            alt="Profile Banner" 
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-between px-8">
            {/* Subtle background ambient mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
            <div className="absolute -top-24 -right-24 size-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 hidden sm:flex items-center gap-2 text-amber-500/40 text-xs font-mono uppercase tracking-widest">
              <Sparkles size={14} /> Personal Profile
            </div>
          </div>
        )}
        
        {/* Banner Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {hasCustomBanner && (
            <button
              onClick={handleRemoveBanner}
              disabled={isUpdatingProfile}
              className="px-3 py-1.5 bg-black/60 hover:bg-red-500/80 backdrop-blur-md rounded-xl text-xs font-semibold text-white/80 hover:text-white transition-all shadow-lg border border-white/10 flex items-center gap-1.5"
              title="Remove Banner"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}

          <label className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl cursor-pointer text-xs font-semibold text-white transition-all shadow-lg border border-white/15 flex items-center gap-1.5 hover:border-amber-500/50">
            <ImageIcon size={14} className="text-amber-400" />
            <span>{hasCustomBanner ? "Change Cover" : "Add Cover Photo"}</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, "banner")}
              disabled={isUpdatingProfile}
            />
          </label>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-14 sm:-mt-16">
        
        {/* Profile Header (Avatar & Top Actions) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="relative inline-block group">
            <div className="relative rounded-2xl overflow-hidden border-4 border-[#09090b] shadow-2xl bg-surface">
              <Avatar 
                user={{
                  ...authUser,
                  profilePic: selectedImg || authUser?.profilePic,
                  username: authUser?.username,
                }} 
                size="2xl" 
                className="!size-28 sm:!size-32"
              />
              {isUpdatingProfile && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-20">
                  <div className="size-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <label
              className={`
                absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400
                p-2 rounded-xl cursor-pointer shadow-lg
                transition-transform z-30 border-2 border-[#09090b] text-black
                ${isUpdatingProfile ? "pointer-events-none opacity-50" : "hover:scale-105 active:scale-95"}
              `}
              title="Change Profile Photo"
            >
              <Camera className="size-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "profile")}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-secondary px-5 py-2 text-sm font-semibold flex items-center gap-2"
              >
                <Edit2 size={15} /> Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors border border-white/10 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  className="btn-primary px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check size={16} /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Identity & Stats */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.3)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block mb-1">Account</span>
                {!isEditing ? (
                  <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                    {authUser?.username}
                  </h1>
                ) : (
                  <input 
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 w-full mb-3"
                  />
                )}
              </div>
              
              {!isEditing && (
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  {formData.bio || "No bio added yet."}
                </p>
              )}
              {isEditing && (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none h-24 mb-4"
                />
              )}

              <div className="flex items-center gap-2 mb-6 text-xs text-zinc-500">
                <Calendar size={14} className="text-amber-500/80" />
                <span>Joined {new Date(authUser?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-2xl font-extrabold text-white font-mono">{authUser?.friends?.length || 0}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-0.5">Friends</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-base font-bold font-mono">Live</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-0.5">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User size={18} className="text-amber-400" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={Mail} label="Email" value={formData.email} name="email" isEditing={isEditing} onChange={handleChange} />
                <InfoRow icon={Phone} label="Phone" value={formData.phone} name="phone" isEditing={isEditing} onChange={handleChange} />
                
                {!isEditing ? (
                  <InfoRow icon={User} label="Gender" value={formData.gender || "Not specified"} name="gender" isEditing={false} capitalize={true} />
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Gender</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-white outline-none appearance-none"
                      >
                        <option value="" className="bg-zinc-900">Select Gender</option>
                        <option value="male" className="bg-zinc-900">Male</option>
                        <option value="female" className="bg-zinc-900">Female</option>
                        <option value="other" className="bg-zinc-900">Other</option>
                        <option value="prefer_not_to_say" className="bg-zinc-900">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-surface p-6 sm:p-8 rounded-2xl border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Key size={18} className="text-amber-400" /> Change Password
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-red-500/20 border-b-red-500/30 shadow-[inset_0_-1px_0_rgba(239,68,68,0.1),0_10px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-zinc-500 mb-6">
                Permanently delete your account and all associated message history.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl font-semibold transition-colors border border-red-500/20 flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, name, isEditing, onChange, capitalize = false }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-zinc-400 uppercase ml-1">{label}</label>
    {!isEditing || !onChange ? (
      <div className="w-full bg-white/[0.03] border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] rounded-xl px-4 py-3 flex items-center gap-3">
        <Icon className="text-zinc-500 shrink-0" size={18} />
        <span className={`text-sm font-semibold text-white/90 truncate flex-1 ${capitalize ? 'capitalize' : ''}`}>
          {value || "Not provided"}
        </span>
      </div>
    ) : (
      <div className="relative flex items-center">
        <Icon className="absolute left-4 text-zinc-500 pointer-events-none" size={18} />
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all font-medium"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      </div>
    )}
  </div>
);

export default ProfilePage;
