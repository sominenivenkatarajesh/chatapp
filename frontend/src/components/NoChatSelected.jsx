import { MessageSquare, Laptop, Lock } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-[#222e35] border-b-4 border-[#00a884]">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#2a3942] flex items-center justify-center">
              <Laptop size={64} className="text-[#8696a0]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center border-4 border-[#222e35]">
              <MessageSquare size={20} className="text-[#00a884]" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-[32px] font-light text-[#d1d7db] tracking-tight">WhatsApp Web</h2>
        <div className="space-y-2">
          <p className="text-[#8696a0] text-[14px] leading-relaxed">
            Send and receive messages without keeping your phone online.<br />
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>

        <div className="pt-20 flex items-center justify-center gap-2 text-[#8696a0] text-[12px]">
          <Lock size={12} />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;

