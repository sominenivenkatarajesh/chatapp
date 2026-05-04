import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-bg-main flex justify-center items-start">
      <div className="w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-morphism rounded-3xl overflow-hidden border border-glass-border shadow-2xl">
          
          {/* Cover Photo / Gradient Header */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-primary/80 via-purple-500/80 to-blue-500/80 relative">
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Avatar Section (overlapping) */}
            <div className="absolute -bottom-16 left-6 sm:left-12 flex items-end gap-6 w-full">
              <div className="relative group">
                <div className="size-32 sm:size-40 rounded-full overflow-hidden border-4 border-bg-main shadow-2xl bg-zinc-800">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {isUpdatingProfile && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-2 right-2 
                    bg-primary hover:bg-primary/90
                    p-3 rounded-full cursor-pointer shadow-xl
                    transition-all duration-300 z-10 border-2 border-bg-main
                    ${isUpdatingProfile ? "pointer-events-none opacity-50" : "hover:scale-110"}
                  `}
                >
                  <Camera className="w-5 h-5 text-white" />
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
              
              <div className="mb-4 hidden sm:block">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
                  {authUser?.fullName}
                </h1>
                <p className="text-white/90 drop-shadow-md flex items-center gap-2 mt-1 font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Active Now
                </p>
              </div>
            </div>
          </div>

          <div className="pt-24 px-6 sm:px-12 pb-12 space-y-8">
            
            {/* Mobile Header (Shows only on small screens) */}
            <div className="sm:hidden text-center -mt-4 mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">{authUser?.fullName}</h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-green-500 font-medium text-sm">Active Now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Personal Info Card */}
              <div className="bg-white/5 p-8 rounded-3xl border border-glass-border hover:bg-white/10 transition-colors shadow-lg">
                <h2 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
                  <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                    <User size={22} />
                  </div>
                  Personal Information
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-text-secondary uppercase tracking-widest font-bold ml-1">Full Name</label>
                    <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                      <User className="text-text-secondary" size={20} />
                      <span className="font-semibold text-white/90 text-lg">{authUser?.fullName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-text-secondary uppercase tracking-widest font-bold ml-1">Email Address</label>
                    <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                      <Mail className="text-text-secondary" size={20} />
                      <span className="font-semibold text-white/90 truncate text-lg">{authUser?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info Card */}
              <div className="bg-white/5 p-8 rounded-3xl border border-glass-border hover:bg-white/10 transition-colors shadow-lg flex flex-col">
                <h2 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
                    <Shield size={22} />
                  </div>
                  Account Details
                </h2>
                
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-text-secondary font-medium">Member Since</span>
                    <span className="font-bold text-white/90">
                      {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }) : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-text-secondary font-medium">Account Status</span>
                    <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm font-bold border border-green-500/20 shadow-sm">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-text-secondary font-medium">Total Friends</span>
                    <span className="font-bold text-white/90 text-lg">
                      {authUser?.friends?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
