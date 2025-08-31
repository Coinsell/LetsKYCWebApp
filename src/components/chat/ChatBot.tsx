import React, { useEffect, useState } from "react";
import ReactWebChat, { createDirectLine } from "botframework-webchat";

async function fetchDirectLineToken(): Promise<string> {
  // This should call your backend, which requests a Direct Line token from Azure Bot Service
  const response = await fetch("/api/getDirectLineToken");
  const { token } = await response.json();
  return token;
}

const ChatBot: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetchDirectLineToken().then(setToken);
  }, []);

  if (!token) {
    return <div>Loading chat...</div>;
  }

  const directLine = createDirectLine({ token });

  return (
    <div style={{ height: "600px", width: "400px", border: "1px solid #ccc" }}>
      <ReactWebChat
        directLine={directLine}
        userID="user1"
        styleOptions={{
          bubbleBackground: "#E6F4F1",
          bubbleFromUserBackground: "#CCE5FF",
          bubbleBorderRadius: 12,
          botAvatarInitials: "AI",
          userAvatarInitials: "You",
        }}
      />
    </div>
  );
};

export default ChatBot;
