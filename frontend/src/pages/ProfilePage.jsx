import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Trash2, Calendar, Phone, Activity, Edit2, Check, X, Key } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, deleteAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleImageUpload = async (e) => {
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
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
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
    <div className="min-h-screen bg-bg-main py-8 px-4 sm:px-8 text-white flex justify-center overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col gap-8 animate-in fade-in">
        
        {/* Header Title */}
        <div className="text-center mt-4 relative flex justify-center items-center">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-text-secondary mt-2">Manage your account information</p>
          </div>
          <div className="absolute right-0">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-colors font-semibold"
              >
                <Edit2 size={18} />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl transition-colors font-semibold disabled:opacity-50"
                >
                  <Check size={18} />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: authUser?.username || "",
                      email: authUser?.email || "",
                      phone: authUser?.phone || authUser?.phoneNumber || "",
                      gender: authUser?.gender || "",
                      bio: authUser?.bio || "",
                      currentPassword: "",
                      newPassword: "",
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-semibold"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card Center */}
        <div className="glass-morphism rounded-3xl p-8 shadow-xl flex flex-col items-center">
          
          {/* Avatar */}
          <div className="relative group mb-6">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-indigo-500/30 bg-black/40 flex items-center justify-center">
              {selectedImg || authUser?.profilePic ? (
                <img
                  src={selectedImg || authUser.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
              ) : (
                <User className="w-16 h-16 sm:w-20 sm:h-20 text-zinc-500" />
              )}
              {isUpdatingProfile && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-2 right-2 
                bg-indigo-500 hover:bg-indigo-400
                p-3 sm:p-4 rounded-full cursor-pointer shadow-lg
                transition-all duration-300 z-10 
                ${isUpdatingProfile ? "pointer-events-none opacity-50" : "hover:scale-110 hover:-translate-y-1"}
              `}
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>

          {!isEditing ? (
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">@{authUser?.username}</h2>
          ) : (
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="text-2xl sm:text-3xl font-bold mb-1 bg-black/30 border border-indigo-500/50 rounded-lg px-4 py-2 text-center text-white outline-none focus:border-indigo-500 w-full max-w-sm"
            />
          )}
          
          <div className="flex flex-wrap gap-3 mt-3 justify-center items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          
          {/* Personal Info */}
          <div className="glass-morphism rounded-3xl p-6 shadow-lg hover:border-indigo-500/30 transition-all duration-300">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-300">
              <User size={20} />
              Personal Details
            </h3>
            <div className="space-y-4">
              <InfoRow 
                icon={Mail} label="Email" 
                value={formData.email} name="email" 
                isEditing={isEditing} onChange={handleChange} 
              />
              <InfoRow 
                icon={Phone} label="Phone" 
                value={formData.phone} name="phone" 
                isEditing={isEditing} onChange={handleChange} 
              />
              {!isEditing ? (
                <InfoRow 
                  icon={User} label="Gender" 
                  value={formData.gender || "Not provided"} name="gender" 
                  isEditing={false} capitalize={true} 
                />
              ) : (
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 w-1/3">
                    <User className="text-zinc-400" size={18} />
                    <span className="text-sm font-medium text-zinc-400">Gender</span>
                  </div>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange}
                    className="w-2/3 bg-black/30 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              )}

              {/* Bio Field */}
              <div className="flex flex-col gap-2 p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="text-zinc-400" size={18} />
                  <span className="text-sm font-medium text-zinc-400">Bio</span>
                </div>
                {!isEditing ? (
                  <p className="text-sm font-semibold text-white mt-1 whitespace-pre-wrap">
                    {formData.bio || "No bio provided yet."}
                  </p>
                ) : (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-black/30 border border-indigo-500/50 rounded-lg px-3 py-2 text-sm font-semibold text-white outline-none focus:border-indigo-500 resize-none h-24 mt-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Account Info & Security */}
          <div className="glass-morphism rounded-3xl p-6 shadow-lg hover:border-indigo-500/30 transition-all duration-300 flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-300">
              <Shield size={20} />
              Security & Status
            </h3>
            <div className="space-y-4 flex-1">
              <InfoRow icon={Calendar} label="Member Since" value={authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'} />
              <InfoRow icon={Activity} label="Status" value="Active & Verified" valueColor="text-green-400" />
              
              {isEditing && (
                <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
                  <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Key size={16} />
                    Change Password
                  </h4>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Current Password"
                    className="w-full bg-black/30 border border-white/10 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="New Password (min 6 characters)"
                    className="w-full bg-black/30 border border-white/10 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                  <p className="text-xs text-zinc-500">Leave blank if you don't want to change it.</p>
                </div>
              )}

              <div className="pt-6 mt-auto">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 rounded-xl transition-all duration-300 font-bold group"
                >
                  <Trash2 size={18} className="transition-transform group-hover:scale-110" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, name, isEditing, onChange, valueColor = "text-white", capitalize = false }) => (
  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center gap-3 w-1/3">
      <Icon className="text-zinc-400" size={18} />
      <span className="text-sm font-medium text-zinc-400">{label}</span>
    </div>
    
    {!isEditing || !onChange ? (
      <span className={`w-2/3 text-right text-sm font-semibold truncate ${valueColor} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    ) : (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-2/3 bg-black/30 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm font-semibold text-right text-white outline-none focus:border-indigo-500"
      />
    )}
  </div>
);

export default ProfilePage;
