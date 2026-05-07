import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react";

const CallManager = () => {
  const {
    callAccepted,
    callEnded,
    stream,
    remoteStream,
    answerCall,
    leaveCall,
  } = useCallStore();

  const [incomingCall, setIncomingCall] = useState(null);
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const socket = useAuthStore((state) => state.socket);

  useEffect(() => {
    if (socket) {
      const handleIncomingCall = (data) => {
        setIncomingCall(data);
      };
      
      const handleCallEnded = () => {
        window.location.reload();
      };

      socket.on("incomingCall", handleIncomingCall);
      socket.on("callEnded", handleCallEnded);

      return () => {
        socket.off("incomingCall", handleIncomingCall);
        socket.off("callEnded", handleCallEnded);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (myVideoRef.current && stream) {
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play().catch(e => console.log("Play error:", e));
    }
  }, [stream]);

  useEffect(() => {
    if (userVideoRef.current && remoteStream) {
      userVideoRef.current.srcObject = remoteStream;
      userVideoRef.current.play().catch(e => console.log("Play error:", e));
    }
  }, [remoteStream, callAccepted]);

  if (!stream && !incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-morphism w-full max-w-4xl p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* My Video */}
          <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-glass-border">
            <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-lg text-xs">You</div>
          </div>

          {/* User Video */}
          {callAccepted && !callEnded && (
            <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-glass-border">
              <video playsInline ref={userVideoRef} autoPlay className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-lg text-xs">Partner</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          {incomingCall && !callAccepted ? (
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-xl font-bold animate-pulse">{incomingCall.name} is calling...</h3>
              <div className="flex gap-4">
                <button
                  className="btn bg-green-500 hover:bg-green-600 text-white p-4 rounded-full"
                  onClick={() => {
                    useCallStore.getState().initiateStream().then(() => {
                        answerCall(incomingCall);
                        setIncomingCall(null);
                    });
                  }}
                >
                  <Phone size={24} />
                </button>
                <button
                  className="btn bg-red-500 hover:bg-red-600 text-white p-4 rounded-full"
                  onClick={() => {
                    useCallStore.setState({ callPartnerId: incomingCall.from });
                    leaveCall();
                    setIncomingCall(null);
                  }}
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl flex items-center gap-2"
              onClick={() => leaveCall(incomingCall?.from)}
            >
              <PhoneOff size={20} />
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallManager;
