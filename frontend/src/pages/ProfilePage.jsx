import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Trash2, Calendar, Phone, Edit2, Check, X, Key, Image as ImageIcon, MessageSquare, Users } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
      toast.error("Image size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      if (type === "profile") {
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
      } else {
        setSelectedBanner(base64Image);
        await updateProfile({ bannerPic: base64Image });
      }
    };
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

  return (
    <div className="h-full bg-bg overflow-y-auto custom-scrollbar pb-20 relative">
      
      {/* Banner Section */}
      <div className="w-full h-48 md:h-64 lg:h-72 relative bg-surface group">
        {(selectedBanner || authUser?.bannerPic) ? (
          <img 
            src={selectedBanner || authUser?.bannerPic} 
            className="w-full h-full object-cover" 
            alt="Profile Banner" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#18181b] to-indigo-900/20" />
        )}
        
        {/* Banner Overlay & Edit Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-4">
          <label className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full cursor-pointer text-white transition-all shadow-lg border border-white/10">
            <ImageIcon size={20} />
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-16 sm:-mt-20">
        
        {/* Profile Header (Avatar & Top Actions) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="relative inline-block group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-bg bg-surface shadow-2xl relative">
              {(selectedImg || authUser?.profilePic) ? (
                <img
                  src={selectedImg || authUser.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-zinc-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              {isUpdatingProfile && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <label
              className={`
                absolute bottom-2 right-2 bg-indigo-500 hover:bg-indigo-400
                p-2.5 rounded-full cursor-pointer shadow-lg
                transition-transform z-10 border-[3px] border-bg
                ${isUpdatingProfile ? "pointer-events-none opacity-50" : "hover:scale-110"}
              `}
            >
              <Camera className="w-5 h-5 text-white" />
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
                className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full font-semibold transition-colors border border-white/5"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Identity & Stats */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-xl">
              {!isEditing ? (
                <h1 className="text-2xl font-bold text-white mb-1">
                  {authUser?.username}
                </h1>
              ) : (
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="text-2xl font-bold bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 w-full mb-3"
                />
              )}
              
              {!isEditing && (
                <p className="text-zinc-400 text-sm mb-4">
                  {formData.bio || "No bio yet."}
                </p>
              )}
              {isEditing && (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Add a bio..."
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none h-24 mb-4"
                />
              )}

              <div className="flex items-center gap-2 mb-6">
                <Calendar size={16} className="text-zinc-500" />
                <span className="text-sm text-zinc-500">Joined {new Date(authUser?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{authUser?.friends?.length || 0}</div>
                  <div className="text-xs text-zinc-500 uppercase font-semibold">Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">Online</div>
                  <div className="text-xs text-zinc-500 uppercase font-semibold">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={Mail} label="Email" value={formData.email} name="email" isEditing={isEditing} onChange={handleChange} />
                <InfoRow icon={Phone} label="Phone" value={formData.phone} name="phone" isEditing={isEditing} onChange={handleChange} />
                
                {!isEditing ? (
                  <InfoRow icon={User} label="Gender" value={formData.gender || "Not specified"} name="gender" isEditing={false} capitalize={true} />
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Gender</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-white outline-none appearance-none"
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
                  className="bg-surface p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl overflow-hidden"
                >
                  <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase ml-1">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-red-500/10 shadow-xl mt-4">
              <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-zinc-500 mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full font-semibold transition-colors border border-red-500/20 flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete Account
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
    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">{label}</label>
    {!isEditing || !onChange ? (
      <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
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
          className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      </div>
    )}
  </div>
);

export default ProfilePage;
