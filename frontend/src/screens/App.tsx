import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import DeformCanvas from "../components/DeformCanvas";
import { Globe, LayoutDashboard, Wallet, Orbit, Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/Tooltip";
import Logo from "../assets/logo.svg";
import styled from "styled-components";
import Dashboard from "./Dashboard";
import Agents from "./Agents";

function HomeScreen({
  walletAddress,
  connectWalletDirectly,
  sendMessage,
}: {
  walletAddress: string;
  connectWalletDirectly: () => void;
  sendMessage: (message: string) => void;
}) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <Styled.HomeContainer>
      {/* Background Canvas */}
      <DeformCanvas />

      {/* Logo and Title */}
      <Styled.LogoContainer>
        {/* Div blurred blob */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            zIndex: -1,
            width: "25rem",
            height: "20rem",
            backgroundColor: "#8d00ff",
            borderRadius: "50%",
            filter: "blur(50px)",
            opacity: 0.12,
          }}
        />
        <Styled.LogoImage src={Logo} alt="Logo" />
      </Styled.LogoContainer>
      <Styled.TitleText>IRIS</Styled.TitleText>

      {/* Top right wallet panel */}
      <Styled.TopRightPanel>
        {walletAddress ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Styled.WalletStatusDisplay>
                  <div className="flex-container">
                    <div className="pulse-container">
                      <span className="pulse-ping"></span>
                      <span className="pulse-dot"></span>
                    </div>
                    <span className="connected-text">Connected</span>
                  </div>
                </Styled.WalletStatusDisplay>
              </TooltipTrigger>
              <TooltipContent>
                <p className="wallet-address">
                  {walletAddress}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="wallet-button-container">
            <Styled.ConnectButton
              variant="default"
              onClick={connectWalletDirectly}
            >
              <Wallet size={16} />
              Connect Wallet
            </Styled.ConnectButton>
          </div>
        )}
      </Styled.TopRightPanel>

      {/* Floating island for prompt UI */}
      <Styled.FloatingIsland>
        <Styled.GlassmorphicContainer>
          <Styled.PromptHeading>What can I help with?</Styled.PromptHeading>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Styled.PromptBar>
              <Styled.PromptInput
                type="text"
                placeholder="Ask anything"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Styled.SendButton type="submit">
                <Send size={18} />
              </Styled.SendButton>
            </Styled.PromptBar>
          </form>

          <Styled.ButtonRow>
            <Styled.ConnectButton onClick={() => navigate("/dashboard")}>
              <LayoutDashboard size={18} />
              Dashboard
            </Styled.ConnectButton>
            <Styled.ConnectButton onClick={() => navigate("/universe")}>
              <Orbit size={18} />
              Universe
            </Styled.ConnectButton>
            <Styled.ConnectButton onClick={() => navigate("/marketplace")}>
              <Globe size={18} />
              Marketplace
            </Styled.ConnectButton>
          </Styled.ButtonRow>
        </Styled.GlassmorphicContainer>
      </Styled.FloatingIsland>
    </Styled.HomeContainer>
  );
}

function App() {
  const [walletAddress, setWalletAddress] = useState<string>("");

  const sendMessage = (message: string) => {
    // Create a new WebSocket connection for this message
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("WebSocket connection opened for sending message");
      ws.send(JSON.stringify({ input: message, wallet: walletAddress }));
      console.log(`Message sent: ${message}`);

      // Set up a handler for any response that might come back
      ws.onmessage = (event) => {
        const response = event.data;
        console.log("Message received:", response);

        // Close the connection after receiving the response
        ws.close();
      };
    };

    ws.onerror = (error) => {
      console.error("WebSocket error while sending message:", error);
      ws.close();
    };
  };

  const connectWalletDirectly = async () => {
    try {
      if ((window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log("Direct wallet connection successful:", accounts[0]);
        }
      } else {
        alert(
          "No Ethereum wallet detected. Please install MetaMask or another supported wallet."
        );
      }
    } catch (error) {
      console.error("Error connecting wallet directly:", error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              walletAddress={walletAddress}
              connectWalletDirectly={connectWalletDirectly}
              sendMessage={sendMessage}
            />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/universe" element={<Agents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/* ----------------------------------------------------------------------
   STYLED COMPONENTS
---------------------------------------------------------------------- */
export const Styled = {
  /* === Containers & Layout === */
  HomeContainer: styled.div`
    min-height: 100vh;
    color: #ffffff;
    position: relative;
    overflow: hidden;
    background-color: #18181b;
  `,
  LogoContainer: styled.div`
    position: absolute;
    top: 50%; /* Adjust this to center it vertically */
    left: 50%;
    transform: translate(-50%, -50%); /* Center the container */
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    pointer-events: none;
  `,
  LogoImage: styled.img`
    width: 30vw; /* Make the logo larger */
    max-width: 300px;
    opacity: 0.4;
    margin-bottom: 200px; /* Adjust spacing */
    max-width: none;
  `,
  TitleText: styled.h1`
    position: absolute; /* Position the title absolutely inside the page */
    top: 45%; /* Move the title vertically to the center of the page */
    left: 50%; /* Move the title horizontally to the center of the page */
    transform: translate(-50%, -50%); /* Adjust for exact centering */
    font-size: 8rem; /* Increase the font size for the title */
    font-weight: 900;
    font-family: "kugile";
    color: #fff; /* White color for the title */
    z-index: 2;
    margin-top: 0;
  `,
  TopRightPanel: styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 3;
  `,
  FloatingIsland: styled.div`
    position: absolute;
    top: 65%; /* Keep it as it is, this will keep the floating island lower */
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    transform: translateY(-50%);
    z-index: 3;
  `,
  GlassmorphicContainer: styled.div`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    width: 100%;
    max-width: 32rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  `,
  PromptHeading: styled.h1`
    font-size: 2.2rem;
    font-weight: 600;
    color: #ffffff;
  `,
  PromptBar: styled.div`
    display: flex;
    align-self: center;
    background-color: rgba(255, 255, 255, 0.07);
    border-radius: 9999px;
    padding: 0.5rem 1rem;
    width: 90%;
    height: 2.5rem;
    justify-content: space-between;
  `,
  PromptInput: styled.input`
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 1.2rem;
    padding: 0.2rem 0.5rem;
    &::placeholder {
      color: #c0c0c0;
    }
  `,
  SendButton: styled.button`
    background: transparent;
    border: none;
    color: #7f56d9;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    transition: color 0.2s ease;
    &:hover {
      color: #9b66ff;
    }
  `,
  ButtonRow: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    @media (min-width: 640px) {
      flex-direction: row;
    }
  `,

  /* === Buttons (Uniform style for wallet, dashboard, and marketplace) === */
  ConnectButton: styled(Button)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 9999px;
    color: #ffffff;
    background-color: #7f56d9;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.15s ease;
    &:hover {
      background-color: #9b66ff;
    }
    &:active {
      transform: scale(0.98);
    }
  `,

  /* === Connected Status Styling === */
  WalletStatusDisplay: styled.div`
    /* Match ConnectButton dimensions */
    height: 2.5rem;
    padding: 0 1rem;
    background-color: #27272a;
    border-radius: 9999px;
    color: #ffffff;
    cursor: pointer;
    
    /* Match ConnectButton display properties */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    & .flex-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 100%;
    }
    
    & .pulse-container {
      position: relative;
      display: flex;
    }
    
    & .pulse-ping {
      position: absolute;
      height: 100%;
      width: 100%;
      border-radius: 9999px;
      background-color: #4ade80;
      opacity: 0.75;
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    
    & .pulse-dot {
      position: relative;
      display: inline-flex;
      height: 0.75rem;
      width: 0.75rem;
      border-radius: 9999px;
      background-color: #22c55e;
    }
    
    & .connected-text {
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `,

  /* === Small Inline Styles for animated pulse === */
  PulseStyles: {
    pulseCircle: {
      position: "absolute" as const,
      width: "100%",
      height: "100%",
      borderRadius: "9999px",
      backgroundColor: "#22c55e",
      opacity: 0.6,
      animation: "ping 1s infinite",
    },
    pulseDot: {
      position: "relative" as const,
      display: "inline-block",
      width: "0.75rem",
      height: "0.75rem",
      borderRadius: "9999px",
      backgroundColor: "#22c55e",
    },
  },
};