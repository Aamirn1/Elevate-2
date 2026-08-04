"use client";

import { useEffect, useRef, useState } from "react";

const responses: Record<string, string> = {
  greeting:
    "Hello! 👋 Welcome to ElevateEdge Digital. How can we help your business today?",
  services:
    "We offer:\n• Custom Website Development\n• Digital Marketing & Ads\n• Social Media Management\n• Virtual Assistant Service\n\nWhich service interests you?",
  website:
    "We build stunning, responsive websites tailored to your industry — retail, food, professional services, and more! Our packages start at very affordable rates. Ready to Boost your presence?",
  marketing:
    "Our digital marketing team runs data-driven campaigns on Google Ads, Facebook & Instagram to maximize your ROI. We offer budget-friendly packages that deliver real results! 📈",
  social:
    "We handle everything — content calendars, graphics, scheduling & engagement. Your social media presence will be managed by experts who know how to grow your audience! 🚀",
  pricing:
    "Our packages are designed to be budget-friendly! We believe every business deserves a great online presence. Contact us for a custom project proposal tailored to your needs.",
  contact:
    "You can reach us via:\n• WhatsApp: +92 311 0523073\n• Email: elevateedgedigitalagency@gmail.com\n• Or fill out our Order Now form!\n\nWe'd love to hear from you! 💬",
  quote:
    "Great choice! 🎉 Please visit our Order Now page or message us on WhatsApp at +92 311 0523073 to get your custom project roadmap started.",
  default:
    "Thanks for your message! I'd love to help. You can ask about our services, careers, or how to get started. For detailed inquiries, connect with our team on WhatsApp! 😊",
};

function getResponse(message: string): string {
  const msg = message.toLowerCase();
  if (msg.match(/\b(hi|hello|hey|howdy|greetings)\b/)) return responses.greeting;
  if (msg.match(/\b(service|offer|what do you do|help)\b/)) return responses.services;
  if (msg.match(/\b(website|web|site|design|develop)\b/)) return responses.website;
  if (msg.match(/\b(market|ads|advertis|google|facebook|campaign|seo)\b/))
    return responses.marketing;
  if (msg.match(/\b(social|media|instagram|facebook page|content|post)\b/))
    return responses.social;
  if (msg.match(/\b(price|cost|pricing|afford|budget|how much|rate)\b/))
    return responses.pricing;
  if (msg.match(/\b(contact|reach|call|phone|email|whatsapp)\b/))
    return responses.contact;
  if (msg.match(/\b(quote|start|begin|get started|sign up|interested)\b/))
    return responses.quote;
  return responses.default;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: "bot" | "user";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, text: "How can we help your business today? 😊", sender: "bot" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: getResponse(text),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      <button
        className={`chat-toggle ${open ? "open" : ""}`}
        id="chat-toggle"
        aria-label="Open AI Support Assistant"
        onClick={() => setOpen(!open)}
      >
        <i className={`fas ${open ? "fa-times" : "fa-headset"}`}></i>
      </button>
      <div className={`chat-box ${open ? "open" : ""}`} id="chat-box">
        <div className="chat-header">
          <div className="avatar">
            <i className="fas fa-headset"></i>
          </div>
          <div className="info">
            <h4>Elevate Edge Support</h4>
            <span>
              <i
                className="fas fa-circle"
                style={{ color: "#25D366", fontSize: "0.5rem", marginRight: "4px" }}
              ></i>{" "}
              Online — Ready to help
            </span>
          </div>
        </div>
        <div className="chat-messages" id="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.sender}`}>
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            id="chat-input"
            placeholder="Type a message..."
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            id="chat-send"
            aria-label="Send"
            onClick={sendMessage}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
}
