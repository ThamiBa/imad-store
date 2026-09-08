"use client";

import { useState, useEffect } from "react";
import { Bell, Package, LogOut, RefreshCw, ExternalLink, Check } from "lucide-react";
import { adminLogin, getAdminNotifications, markAllNotificationsRead, markNotificationRead, getAllOrders } from "@/lib/api";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    orderId?: string;
    read: boolean;
    createdAt: string;
}

interface Order {
    id: string;
    customerName: string | null;
    customerPhone: string | null;
    city: string | null;
    region: string | null;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export default function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<"notifications" | "orders">("notifications");
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        const t = localStorage.getItem("adminToken");
        if (t) setToken(t);
    }, []);

    useEffect(() => {
        if (!token) return;
        const tick = async () => {
            try {
                const [n, o] = await Promise.all([
                    getAdminNotifications(),
                    getAllOrders().catch(() => ({ data: [] as unknown as Order[] })),
                ]);
                setNotifications(n.data);
                setUnread(n.unread);
                setOrders((o.data ?? []) as Order[]);
                setLastSync(new Date());
            } catch (err) {
                console.error("Polling failed:", err);
            }
        };
        tick();
        const id = setInterval(tick, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [token]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const res = await adminLogin(email, password);
            const t = res.data.accessToken;
            localStorage.setItem("adminToken", t);
            localStorage.setItem("adminRefresh", res.data.refreshToken);
            setToken(t);
        } catch {
            setAuthError("Invalid credentials");
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefresh");
        setToken(null);
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] to-[#0f0f1e] px-4">
                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-sm bg-white/5 backdrop-blur border border-white/10 p-8 rounded-2xl shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-light text-white tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            IMAD MODE
                        </h1>
                        <p className="text-[#C9A96E] text-[10px] tracking-[0.4em] uppercase mt-2">Admin Dashboard</p>
                    </div>
                    {authError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded">
                            {authError}
                        </div>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full mb-3 bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A96E]"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full mb-6 bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A96E]"
                    />
                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-[#C9A96E] hover:bg-[#b09055] text-[#1A1A2E] text-xs tracking-[0.25em] uppercase font-bold py-3 transition-colors disabled:opacity-50"
                    >
                        {authLoading ? "..." : "Sign In"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f1e] text-white">
            <header className="border-b border-white/10 bg-[#1A1A2E] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-light tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            IMAD <span className="text-[#C9A96E]">Mode</span>
                        </h1>
                        <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">Admin Dashboard</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/50 tracking-widest uppercase">
                            <span className={`w-2 h-2 rounded-full ${lastSync ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                            {lastSync ? `Live · ${lastSync.toLocaleTimeString()}` : "Connecting…"}
                        </div>
                        <button onClick={logout} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex gap-1">
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`relative px-6 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-colors ${
                            activeTab === "notifications" ? "text-[#C9A96E]" : "text-white/50 hover:text-white/80"
                        }`}
                    >
                        <Bell size={14} className="inline mr-2" />
                        Notifications
                        {unread > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                {unread}
                            </span>
                        )}
                        {activeTab === "notifications" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A96E]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`relative px-6 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-colors ${
                            activeTab === "orders" ? "text-[#C9A96E]" : "text-white/50 hover:text-white/80"
                        }`}
                    >
                        <Package size={14} className="inline mr-2" />
                        Orders ({orders.length})
                        {activeTab === "orders" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A96E]" />}
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === "notifications" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg tracking-widest uppercase">Real-Time Notifications</h2>
                            {unread > 0 && (
                                <button
                                    onClick={async () => { await markAllNotificationsRead(); setUnread(0); setNotifications((n) => n.map((x) => ({ ...x, read: true }))); }}
                                    className="text-[10px] text-[#C9A96E] tracking-widest uppercase flex items-center gap-1 hover:underline"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {notifications.length === 0 ? (
                                <div className="text-center py-16 text-white/40 text-sm">No notifications yet</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.read && markNotificationRead(n.id).then(() => {
                                            setNotifications((ns) => ns.map((x) => x.id === n.id ? { ...x, read: true } : x));
                                            setUnread((u) => u - 1);
                                        })}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            n.read ? "bg-white/2 border-white/5" : "bg-[#C9A96E]/10 border-[#C9A96E]/30"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className={`text-sm ${n.read ? "text-white/60" : "text-white font-medium"}`}>{n.title}</p>
                                                <p className="text-xs text-white/40 mt-1">{n.message}</p>
                                            </div>
                                            <span className="text-[10px] text-white/30 tracking-widest uppercase shrink-0">
                                                {new Date(n.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg tracking-widest uppercase">All Orders</h2>
                            <button
                                onClick={async () => { const o = await getAllOrders(); setOrders(o.data ?? []); }}
                                className="text-[10px] text-[#C9A96E] tracking-widest uppercase flex items-center gap-1 hover:underline"
                            >
                                <RefreshCw size={12} /> Refresh
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[10px] tracking-widest uppercase text-white/40 border-b border-white/10">
                                        <th className="py-3 px-2">Ref</th>
                                        <th className="py-3 px-2">Customer</th>
                                        <th className="py-3 px-2">Phone</th>
                                        <th className="py-3 px-2">City</th>
                                        <th className="py-3 px-2">Total</th>
                                        <th className="py-3 px-2">Pay</th>
                                        <th className="py-3 px-2">Status</th>
                                        <th className="py-3 px-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                                            <td className="py-3 px-2 text-[#C9A96E] font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</td>
                                            <td className="py-3 px-2">{o.customerName ?? "—"}</td>
                                            <td className="py-3 px-2 text-white/60">
                                                <a href={`https://wa.me/${o.customerPhone?.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-[#C9A96E] flex items-center gap-1">
                                                    {o.customerPhone} <ExternalLink size={10} />
                                                </a>
                                            </td>
                                            <td className="py-3 px-2 text-white/60">{o.city}</td>
                                            <td className="py-3 px-2 font-medium">{o.totalAmount.toFixed(2)} MAD</td>
                                            <td className="py-3 px-2 text-white/60 text-xs">{o.paymentMethod}</td>
                                            <td className="py-3 px-2">
                                                <span className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded ${
                                                    o.status === "PENDING" ? "bg-yellow-500/20 text-yellow-300" :
                                                    o.status === "CONFIRMED" ? "bg-blue-500/20 text-blue-300" :
                                                    o.status === "SHIPPED" ? "bg-purple-500/20 text-purple-300" :
                                                    o.status === "DELIVERED" ? "bg-emerald-500/20 text-emerald-300" :
                                                    "bg-red-500/20 text-red-300"
                                                }`}>{o.status}</span>
                                            </td>
                                            <td className="py-3 px-2 text-white/40 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {orders.length === 0 && (
                                <div className="text-center py-16 text-white/40 text-sm">No orders yet</div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
