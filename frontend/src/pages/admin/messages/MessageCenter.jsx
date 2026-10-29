import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  User,
  Building2,
  FolderKanban,
  Paperclip,
  CheckCheck,
  Search,
} from "lucide-react";
import { getMessages, sendMessage, markMessagesRead } from "../../../api/messages";
import { getProjects } from "../../../api/projects";
import { getVendors } from "../../../api/vendors";
import { getClients } from "../../../api/clients";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function MessageCenter() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active chat channel
  const [activeChannel, setActiveChannel] = useState(null); // { type: 'project'|'user', id, title, subtitle }
  const [inputContent, setInputContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [msgsData, projsData, vendorsData, clientsData] = await Promise.all([
        getMessages(),
        getProjects(),
        getVendors().catch(() => []),
        getClients().catch(() => []),
      ]);
      setMessages(msgsData || []);
      setProjects(projsData || []);
      setVendors(vendorsData || []);
      setClients(clientsData || []);

      if (projsData && projsData.length > 0 && !activeChannel) {
        setActiveChannel({
          type: "project",
          id: projsData[0].id,
          title: projsData[0].title,
          subtitle: `Project Team Room (${projsData[0].code || "PRJ"})`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messaging center");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
      try {
        const msgsData = await getMessages();
        setMessages(msgsData || []);
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() && !attachment) return;

    try {
      setSending(true);
      const fd = new FormData();
      fd.append("content", inputContent);
      if (attachment) fd.append("attachment", attachment);

      if (activeChannel?.type === "project") {
        fd.append("project", activeChannel.id);
        fd.append("conversation_type", "project_room");
      } else if (activeChannel?.type === "user") {
        fd.append("recipient", activeChannel.id);
        fd.append("conversation_type", activeChannel.convType || "direct_admin_vendor");
      }

      await sendMessage(fd);
      setInputContent("");
      setAttachment(null);
      const updated = await getMessages();
      setMessages(updated || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!activeChannel) return true;
    if (activeChannel.type === "project") {
      return m.project === activeChannel.id;
    }
    return m.recipient === activeChannel.id || m.sender === activeChannel.id;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="text-blue-500" size={26} />
            Unified Communication Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time threaded conversations with Clients, Vendors, and Project Teams.
          </p>
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[650px] rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
        {/* SIDEBAR: CHANNELS & USERS */}
        <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
          <div className="p-3.5 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* PROJECT ROOMS */}
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Project Rooms</span>
              <div className="mt-1 space-y-1">
                {projects.map((p) => {
                  const isActive = activeChannel?.type === "project" && activeChannel.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveChannel({ type: "project", id: p.id, title: p.title, subtitle: `Project Room (${p.code || "PRJ"})` })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <FolderKanban size={15} />
                      <span className="truncate">{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VENDORS */}
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Vendors</span>
              <div className="mt-1 space-y-1">
                {vendors.map((v) => {
                  const isActive = activeChannel?.type === "user" && activeChannel.id === v.user;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setActiveChannel({ type: "user", id: v.user, title: v.name, subtitle: v.company_name || "Vendor", convType: "direct_admin_vendor" })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <User size={15} />
                      <span className="truncate">{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLIENTS */}
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Clients</span>
              <div className="mt-1 space-y-1">
                {clients.map((c) => {
                  const isActive = activeChannel?.type === "user" && activeChannel.id === c.user;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveChannel({ type: "user", id: c.user, title: c.name, subtitle: c.company_name || "Client", convType: "direct_admin_client" })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Building2 size={15} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CHAT THREAD */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-slate-900/30">
          {/* CHANNEL TOP HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                {activeChannel?.title || "Select a Conversation"}
              </h3>
              <p className="text-[11px] text-slate-400">{activeChannel?.subtitle}</p>
            </div>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No messages yet. Send a message to begin communication.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.sender === user?.id || msg.sender_username === user?.username;

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {isMe ? "You" : `${msg.sender_name || msg.sender_username} (${msg.sender_role})`}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div
                      className={`max-w-md rounded-2xl px-4 py-2.5 text-xs ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20"
                          : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] underline opacity-90 hover:opacity-100"
                        >
                          <Paperclip size={12} /> View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* MESSAGE INPUT */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <label className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
                <Paperclip size={18} />
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                placeholder={activeChannel ? `Message ${activeChannel.title}...` : "Select a channel to type..."}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                disabled={!activeChannel}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={sending || !activeChannel || (!inputContent.trim() && !attachment)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all cursor-pointer shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            {attachment && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-blue-400 px-2">
                <span>Attached: {attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} className="text-slate-500 hover:text-rose-400">
                  Remove
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
