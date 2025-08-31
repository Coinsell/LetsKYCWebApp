import React, { useEffect, useState } from "react";
import ReactWebChat from "botframework-webchat";

const CopilotChat: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch("/api/token"); // your backend
      const data = await res.json();
      setToken(data.token);
    };
    fetchToken();
  }, []);

  if (!token) return <div>Loading chat...</div>;

  return (
    <ReactWebChat
      directLine={{ secret: undefined, token }}
      styleOptions={{
        bubbleBackground: "#E6F4F1",
        bubbleFromUserBackground: "#CCE5FF",
        bubbleBorderRadius: 12,
        botAvatarInitials: "AI",
        userAvatarInitials: "You",
      }}
    />
  );
};

export default CopilotChat;
