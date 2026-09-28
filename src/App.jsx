import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Wrench, 
  AlertTriangle, 
  UploadCloud, 
  ChevronRight, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  CheckCircle,
  Sparkles,
  DollarSign,
  Lock,
  LogOut,
  X,
  KeyRound,
  User,
  Check,
  RotateCcw
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function App() {
  const [currentView, setCurrentView] = useState("landing"); // "landing" | "owner" | "tenant"
  const [dbStatus, setDbStatus] = useState(false);

  // Modal Login States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState("owner");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("Kamar A-03");

  // Portal Penghuni States
  const [showPayModal, setShowPayModal] = useState(false);
  const [preferredTime, setPreferredTime] = useState("Siang (13.00 - 16.00 / Pulang Kuliah)");
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  // Modal Penyelesaian & Upload Foto Teknisi
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [techNoteInput, setTechNoteInput] = useState("");
  const [techPhotoInput, setTechPhotoInput] = useState(null);

  const defaultTickets = [
    {
      id: "TK-101",
      room: "Kamar A-03",
      tenant: "Budi Santoso",
      category: "Pipa / Saluran Air",
      issue: "Kran wastafel bocor deras, merembes ke lantai bawah saat diputar.",
      priority: "Tinggi",
      status: "menunggu_konfirmasi", // "diajukan" | "diproses" | "menunggu_konfirmasi" | "selesai"
      date: "28 Sep 2026",
      technician: "Pak Joko (Teknisi Pipa)",
      technicianNote: "Paking seal kran kuningan sudah diganti baru dan pipa pembuangan di-lem ulang. Silakan diuji coba.",
      beforePhoto: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80",
      afterPhoto: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80",
      isVerifiedByTenant: false,
      visitSlot: "Siang (13.00 - 16.00)"
    },
    {
      id: "TK-102",
      room: "Kamar B-07",
      tenant: "Annisa Putri",
      category: "Kelistrikan & AC",
      issue: "Kompresor AC mati mendadak dan keluar dengungan panas.",
      priority: "Sedang",
      status: "diproses",
      date: "27 Sep 2026",
      technician: "Pak Wahyu (Spesialis AC)",
      technicianNote: "Sedang menunggu pengeringan kisi evaporator setelah pembersihan filter.",
      beforePhoto: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80",
      afterPhoto: null,
      isVerifiedByTenant: false,
      visitSlot: "Pagi (08.30 - 11.30)"
    },
    {
      id: "TK-103",
      room: "Kamar A-01",
      tenant: "Rian Pratama",
      category: "Pintu & Kunci",
      issue: "Gagang pintu luar goyang dan silinder kunci macet dari dalam.",
      priority: "Rendah",
      status: "selesai",
      date: "25 Sep 2026",
      technician: "Pak Manto",
      technicianNote: "Gagang pintu stainless dan silinder kunci set telah diganti baru.",
      beforePhoto: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=80",
      afterPhoto: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=80",
      isVerifiedByTenant: true,
      visitSlot: "Bebas Kapan Saja"
    }
  ];

  const defaultBillings = [
    { id: 1, name: "Budi Santoso", room: "Kamar A-03", phone: "6281234567890", dueDate: "01 Okt 2026", amount: "Rp 1.450.000", status: "Menunggu" },
    { id: 2, name: "Annisa Putri", room: "Kamar B-07", phone: "6281298765432", dueDate: "02 Okt 2026", amount: "Rp 1.600.000", status: "Menunggu" },
    { id: 3, name: "Rian Pratama", room: "Kamar A-01", phone: "6281311223344", dueDate: "25 Sep 2026", amount: "Rp 1.450.000", status: "Lunas" },
  ];

  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem("kostara_tickets");
      return saved ? JSON.parse(saved) : defaultTickets;
    } catch (e) {
      return defaultTickets;
    }
  });

  const [billings, setBillings] = useState(() => {
    try {
      const saved = localStorage.getItem("kostara_billings");
      return saved ? JSON.parse(saved) : defaultBillings;
    } catch (e) {
      return defaultBillings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("kostara_tickets", JSON.stringify(tickets));
    } catch (e) {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem("kostara_billings", JSON.stringify(billings));
    } catch (e) {}
  }, [billings]);

  const [formCat, setFormCat] = useState("Pipa / Saluran Air");
  const [formPri, setFormPri] = useState("Sedang");
  const [formDesc, setFormDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(API_BASE + "/tickets.php")
      .then(r => r.json())
      .then(d => {
        if (d && d.status === "success" && d.data && d.data.length > 0) {
          setTickets(d.data);
          setDbStatus(true);
        }
      })
      .catch(() => setDbStatus(false));
  }, []);

  const moveTicketStatus = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    fetch(API_BASE + "/tickets.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus })
    }).catch(() => {});
  };

  const handleTenantVerification = (ticketId, isApproved) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: isApproved ? "selesai" : "diproses",
          isVerifiedByTenant: isApproved,
          technicianNote: isApproved 
            ? "Telah diperiksa langsung oleh penghuni kamar: Fasilitas sudah normal dan berfungsi baik (Rating 5/5)."
            : "Komplain ulang oleh penghuni: Masih terdapat kendala pada fasilitas terkait. Teknisi dijadwalkan kembali."
        };
      }
      return t;
    }));
  };

  const markAsPaid = (id) => {
    setBillings(prev => prev.map(b => b.id === id ? { ...b, status: "Lunas" } : b));
  };

  const handleResetDemoData = () => {
    localStorage.removeItem("kostara_billings");
    localStorage.removeItem("kostara_tickets");
    window.location.reload();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTechPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTechPhotoInput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenResolveModal = (ticket) => {
    setResolvingTicket(ticket);
    setTechNoteInput("Pekerjaan telah selesai diperbaiki dan diuji fungsi. Silakan dicek kembali.");
    setTechPhotoInput(null);
  };

  const handleConfirmResolveTicket = (e) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    setTickets(prev => prev.map(t => {
      if (t.id === resolvingTicket.id) {
        return {
          ...t,
          status: "menunggu_konfirmasi",
          afterPhoto: techPhotoInput || "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80",
          technician: t.technician || "Teknisi Unit Kost",
          technicianNote: techNoteInput
        };
      }
      return t;
    }));

    setResolvingTicket(null);
    setTechPhotoInput(null);
    setTechNoteInput("");
  };

  const submitTicket = (e) => {
    e.preventDefault();
    if (!formDesc.trim()) return;

    const newTicket = {
      id: "TK-" + Math.floor(104 + Math.random() * 890),
      room: selectedRoom,
      tenant: selectedRoom === "Kamar A-03" ? "Budi Santoso" : selectedRoom === "Kamar B-07" ? "Annisa Putri" : "Penghuni " + selectedRoom,
      category: formCat,
      issue: formDesc,
      priority: formPri,
      status: "diajukan",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      technician: null,
      technicianNote: "Menunggu penugasan teknisi oleh pengelola kost.",
      beforePhoto: uploadedPhoto || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80",
      afterPhoto: null,
      visitSlot: preferredTime,
      isVerifiedByTenant: false
    };

    setTickets(prev => [newTicket, ...prev]);

    fetch(API_BASE + "/tickets.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket)
    }).catch(() => {});

    setSubmitted(true);
    setFormDesc("");
    setUploadedPhoto(null);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleOpenLogin = (role) => {
    setLoginRole(role);
    setShowLoginModal(true);
  };

  const handlePerformLogin = (e) => {
    e.preventDefault();
    setShowLoginModal(false);
    setCurrentView(loginRole);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8F5EE] text-[#121212] flex flex-col font-sans selection:bg-[#FFE600] selection:text-black relative">
      
      {/* 1. BACKGROUND SILUET ARSITEKTUR & STIKER RETRO NEUBRUTALISM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div 
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: "linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)",
            backgroundSize: "36px 36px"
          }}
        ></div>

        <svg className="absolute bottom-0 left-0 right-0 w-full h-44 sm:h-56 opacity-[0.07] text-black fill-current" viewBox="0 0 1440 220" preserveAspectRatio="none">
          <path d="M0,220 L0,130 L50,80 L100,130 L160,130 L160,90 L230,90 L230,140 L280,100 L330,140 L400,140 L400,60 L460,60 L460,130 L520,90 L570,130 L650,130 L650,70 L720,70 L720,140 L780,90 L840,140 L910,140 L910,50 L980,50 L980,130 L1040,80 L1100,130 L1170,130 L1170,70 L1240,70 L1240,140 L1300,90 L1360,140 L1440,140 L1440,220 Z" />
        </svg>

        <div className="absolute top-28 left-6 rotate-[-10deg] hidden xl:block opacity-75">
          <div className="bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_#000] px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-1.5">
            <span>🔑</span>
            <span>KAMAR NO. 03</span>
          </div>
        </div>
        <div className="absolute top-80 left-5 rotate-[7deg] hidden xl:block opacity-65">
          <div className="bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_#000] px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-1.5">
            <span>📍</span>
            <span>5 MENIT KE UNDIP</span>
          </div>
        </div>

        <div className="absolute top-28 right-6 rotate-[9deg] hidden xl:block opacity-75">
          <div className="bg-[#3B82F6] text-white border-2 border-black shadow-[3px_3px_0px_#000] px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-1.5">
            <span>⚡</span>
            <span>METERAN TOKEN</span>
          </div>
        </div>
        <div className="absolute top-80 right-5 rotate-[-8deg] hidden xl:block opacity-65">
          <div className="bg-[#10B981] text-white border-2 border-black shadow-[3px_3px_0px_#000] px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-1.5">
            <span>🛵</span>
            <span>PARKIR BERPAGAR</span>
          </div>
        </div>
      </div>

      {/* 2. RESPONSIVE NAVBAR */}
      <header className="border-b-3 sm:border-b-4 border-[#121212] bg-[#FFFFFF] px-3 sm:px-6 py-2.5 sm:py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          <div 
            onClick={() => setCurrentView("landing")}
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer select-none group min-w-0"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFE600] border-[2.5px] sm:border-[3px] border-[#121212] shadow-[2.5px_2.5px_0px_#121212] sm:shadow-[3.5px_3.5px_0px_#121212] rounded-xl flex items-center justify-center font-black transition-all">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.7] text-[#121212]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#3B82F6] border-2 border-black rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              </div>
            </div>

            <div className="space-y-0.5 truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#121212] font-mono group-hover:text-[#2563EB] transition-colors">
                  KOSTARA
                </span>
                <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.2 rounded border border-black bg-[#E0E7FF] text-[#1D4ED8] text-[9px] font-black uppercase">
                  DIGITAL KOST
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-600 truncate">
                Kost Griya Harmoni
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {currentView === "landing" && (
              <>
                <button 
                  onClick={() => handleOpenLogin("tenant")}
                  className="neu-btn bg-[#FFFFFF] hover:bg-[#F3F4F6] text-black px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]"
                >
                  <KeyRound className="w-3.5 h-3.5 stroke-[2.5] text-blue-600" />
                  <span className="hidden xs:inline">Portal</span> Penghuni
                </button>

                <button 
                  onClick={() => handleOpenLogin("owner")}
                  className="neu-btn bg-[#FFE600] text-black px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden xs:inline">Masuk</span> Pengelola
                </button>
              </>
            )}

            {currentView === "owner" && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 neu-badge bg-[#E0E7FF] text-[#2563EB] text-xs">
                  <User className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Pengelola</span>
                </div>
                <button 
                  onClick={() => setCurrentView("landing")}
                  className="neu-btn bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#DC2626] px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Keluar</span>
                </button>
              </div>
            )}

            {currentView === "tenant" && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 neu-badge bg-[#FEF3C7] text-black text-xs">
                  <span>🏠 {selectedRoom}</span>
                </div>
                <button 
                  onClick={() => setCurrentView("landing")}
                  className="neu-btn bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#DC2626] px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 flex-1 relative z-10">
        
        {/* VIEW 1: LANDING PAGE KATALOG KOST */}
        {currentView === "landing" && (
          <div className="space-y-8 sm:space-y-12">
            
            <section className="neu-box bg-[#FFFFFF] p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 sm:pb-5 border-b-3 border-[#121212]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                    <span className="neu-badge bg-[#10B981] text-white px-2 py-0.5 text-[10px] sm:text-xs">
                      ✓ Kamar Tersedia (Sisa 2 Kamar)
                    </span>
                    <span className="neu-badge bg-[#FFE600] text-black px-2 py-0.5 text-[10px] sm:text-xs">
                      Campur / Mahasiswa & Karyawan
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#121212] tracking-tight">
                    Kost Griya Harmoni
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>📍 Jl. Tirto Agung No. 12, Tembalang, Semarang</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-[#2563EB]">5 Menit ke Gerbang Kampus UNDIP</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <div className="neu-box-sm bg-[#FFFDF7] p-2.5 sm:p-3 text-left sm:text-right">
                    <span className="text-[10px] uppercase font-black text-slate-500 block">Harga Sewa Mulai</span>
                    <span className="text-lg sm:text-2xl font-black font-mono text-[#2563EB]">Rp 1.450.000</span>
                    <span className="text-[10px] font-bold text-slate-500 block">/ bulan (All-in WiFi & Air)</span>
                  </div>

                  <a 
                    href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kost%20Griya%20Harmoni,%20saya%20tertarik%20untuk%20survey%20kamar%20kost%20yang%20masih%20tersedia."
                    target="_blank"
                    rel="noreferrer"
                    className="neu-btn bg-[#25D366] text-black px-4 py-3 text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[3]" />
                    <span>Tanya Kamar via WA</span>
                  </a>
                </div>
              </div>

              {/* FOTO-FOTO KOST & FASILITAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="md:col-span-2 border-3 border-black rounded-xl overflow-hidden h-56 sm:h-72 md:h-96 relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80" 
                    alt="Bangunan Kost Griya Harmoni" 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 neu-badge bg-black text-white px-2.5 py-1 text-[10px] sm:text-xs">
                    Gedung Utama (20 Kamar • 2 Lantai)
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
                  <div className="border-3 border-black rounded-xl overflow-hidden h-32 sm:h-36 md:h-[184px] relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" 
                      alt="Interior Kamar Kost" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 left-1.5 neu-badge bg-[#FFE600] text-black px-2 py-0.5 text-[9px] sm:text-[10px]">
                      Kamar Standar
                    </div>
                  </div>

                  <div className="border-3 border-black rounded-xl overflow-hidden h-32 sm:h-36 md:h-[184px] relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" 
                      alt="Kamar Mandi Dalam" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 left-1.5 neu-badge bg-[#3B82F6] text-white px-2 py-0.5 text-[9px] sm:text-[10px]">
                      Kamar Mandi Dalam
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* DETAIL FASILITAS LENGKAP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              <div className="neu-box bg-[#FFFFFF] p-5 sm:p-6 space-y-3.5">
                <div className="flex items-center gap-2 font-black text-sm sm:text-base text-[#121212]">
                  <span className="text-lg">🛏️</span>
                  <span>Fasilitas Setiap Kamar</span>
                </div>
                <ul className="space-y-2 text-xs font-bold text-slate-800">
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3] shrink-0" />
                    <span>Kasur Springbed & Bantal Guling</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3] shrink-0" />
                    <span>Kamar Mandi Dalam (Shower & Kloset Duduk)</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3] shrink-0" />
                    <span>Lemari Pakaian 2 Pintu & Meja Belajar</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3] shrink-0" />
                    <span>AC Split Dingin & Ventilasi Jendela Luar</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3] shrink-0" />
                    <span>Meteran Listrik Token Kamar Sendiri</span>
                  </li>
                </ul>
              </div>

              <div className="neu-box bg-[#FFFFFF] p-5 sm:p-6 space-y-3.5">
                <div className="flex items-center gap-2 font-black text-sm sm:text-base text-[#121212]">
                  <span className="text-lg">🏡</span>
                  <span>Fasilitas Bersama</span>
                </div>
                <ul className="space-y-2 text-xs font-bold text-slate-800">
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3] shrink-0" />
                    <span>WiFi Internet Fiber Optik 100 Mbps</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3] shrink-0" />
                    <span>Dapur Bersama (Kompor Gas, Kulkas, Dispenser)</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3] shrink-0" />
                    <span>Area Parkir Motor & Mobil Berpagar Gerbang</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3] shrink-0" />
                    <span>Area Jemuran Baju Luas di Lantai 2</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3] shrink-0" />
                    <span>Mesin Cuci Bersama & Tempat Cuci Piring</span>
                  </li>
                </ul>
              </div>

              <div className="neu-box bg-[#FFFFFF] p-5 sm:p-6 space-y-3.5">
                <div className="flex items-center gap-2 font-black text-sm sm:text-base text-[#121212]">
                  <span className="text-lg">🛡️</span>
                  <span>Keamanan & Lingkungan</span>
                </div>
                <ul className="space-y-2 text-xs font-bold text-slate-800">
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D97706] stroke-[3] shrink-0" />
                    <span>CCTV 24 Jam di Seluruh Koridor & Parkiran</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D97706] stroke-[3] shrink-0" />
                    <span>Akses Kunci Gerbang Mandiri 24 Jam</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D97706] stroke-[3] shrink-0" />
                    <span>Lingkungan Tenang (Kondusif untuk Kuliah/Kerja)</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D97706] stroke-[3] shrink-0" />
                    <span>Petugas Kebersihan Koridor Tiap 2 Hari Sekali</span>
                  </li>
                  <li className="neu-box-sm bg-[#FFFDF7] p-2 sm:p-2.5 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D97706] stroke-[3] shrink-0" />
                    <span>Teknisi Siaga untuk Perbaikan Fasilitas Kamar</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* PILIHAN TIPE KAMAR & KETERSEDIAAN */}
            <div className="neu-box bg-[#FFE600] p-5 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#121212]">Daftar Kamar & Tarif Sewa</h3>
                  <p className="text-xs font-bold text-slate-800">Pilih tipe kamar yang sesuai kebutuhan</p>
                </div>
                <span className="neu-badge bg-[#FFFFFF] px-2.5 py-1 text-xs self-start sm:self-auto">2 Tipe Pilihan</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="neu-box-sm bg-[#FFFFFF] p-5 sm:p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="neu-badge bg-[#E0E7FF] text-[#2563EB] px-2 py-0.5 text-[10px]">Tipe Deluxe • Lantai 1</span>
                      <h4 className="text-lg sm:text-xl font-black mt-1">Kamar 3x4 Meter</h4>
                      <p className="text-xs font-semibold text-slate-500">AC, Kamar Mandi Dalam, Kasur Queen Size, Meja Belajar</p>
                    </div>
                    <span className="neu-badge bg-[#D1FAE5] text-[#059669] px-2 py-0.5 text-[10px]">Sisa 1 Kamar</span>
                  </div>

                  <div className="text-xl sm:text-2xl font-black font-mono text-[#2563EB]">
                    Rp 1.600.000 <span className="text-xs font-bold text-slate-600">/ bulan</span>
                  </div>

                  <a 
                    href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20booking/survey%20Kamar%20Tipe%20Deluxe%20(Rp%201.600.000)%20di%20Kost%20Griya%20Harmoni."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 neu-btn bg-[#2563EB] text-white text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <span>Booking Tipe Deluxe</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </a>
                </div>

                <div className="neu-box-sm bg-[#FFFFFF] p-5 sm:p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="neu-badge bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 text-[10px]">Tipe Standar • Lantai 2</span>
                      <h4 className="text-lg sm:text-xl font-black mt-1">Kamar 3x3.5 Meter</h4>
                      <p className="text-xs font-semibold text-slate-500">AC, Kamar Mandi Dalam, Kasur Single Bed, Lemari 2 Pintu</p>
                    </div>
                    <span className="neu-badge bg-[#D1FAE5] text-[#059669] px-2 py-0.5 text-[10px]">Sisa 1 Kamar</span>
                  </div>

                  <div className="text-xl sm:text-2xl font-black font-mono text-[#2563EB]">
                    Rp 1.450.000 <span className="text-xs font-bold text-slate-600">/ bulan</span>
                  </div>

                  <a 
                    href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20booking/survey%20Kamar%20Tipe%20Standar%20(Rp%201.450.000)%20di%20Kost%20Griya%20Harmoni."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 neu-btn bg-[#FFE600] text-black text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <span>Booking Tipe Standar</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </a>
                </div>
              </div>
            </div>

            {/* AKSES STRATEGIS */}
            <div className="neu-box bg-[#FFFFFF] p-5 sm:p-8 space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-[#121212]">Akses & Jarak ke Titik Strategis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs font-bold">
                <div className="neu-box-sm bg-[#F8F5EE] p-3 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Kampus</span>
                  <span className="font-black text-sm block mt-0.5">3 Menit</span>
                  <span className="text-slate-600 text-[10px] sm:text-[11px]">Gerbang UNDIP</span>
                </div>
                <div className="neu-box-sm bg-[#F8F5EE] p-3 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Minimarket</span>
                  <span className="font-black text-sm block mt-0.5">1 Menit</span>
                  <span className="text-slate-600 text-[10px] sm:text-[11px]">Indomaret/Alfamart</span>
                </div>
                <div className="neu-box-sm bg-[#F8F5EE] p-3 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Kuliner</span>
                  <span className="font-black text-sm block mt-0.5">Jalan Kaki</span>
                  <span className="text-slate-600 text-[10px] sm:text-[11px]">Cafe & Resto</span>
                </div>
                <div className="neu-box-sm bg-[#F8F5EE] p-3 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Laundry & ATM</span>
                  <span className="font-black text-sm block mt-0.5">2 Menit</span>
                  <span className="text-slate-600 text-[10px] sm:text-[11px]">Bank & Kiloan</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: DASHBOARD PENGELOLA KOST */}
        {currentView === "owner" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="neu-box bg-[#FFE600] p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="neu-badge bg-[#FFFFFF] px-2.5 py-0.5 text-black inline-block mb-1.5 text-xs">
                  UNIT PENGELOLAAN UTAMA
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#121212] tracking-tight">
                  Kost Griya Harmoni
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                  Semarang • 20 Pintu Kamar (2 Lantai) • Terhubung Real-Time
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="neu-btn bg-[#FFFFFF] hover:bg-[#FEE2E2] text-[#DC2626] px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
                  title="Kembalikan data tiket dan tagihan ke kondisi awal demo"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Reset Demo</span>
                </button>
                <div className="neu-box-sm bg-[#FFFFFF] px-3 py-1.5 text-xs font-black">
                  Sep - Okt 2026
                </div>
                <div className="neu-badge bg-[#10B981] text-white px-3 py-1.5 text-xs">
                  Sistem Aktif
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="neu-box bg-[#FFFFFF] p-5 sm:p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-600">Okupansi Kamar</span>
                  <span className="neu-badge bg-[#10B981] text-white px-2 py-0.5 text-xs">90% Full</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black font-mono">18<span className="text-xl sm:text-2xl font-bold text-slate-500">/20</span></h3>
                </div>
                <p className="text-xs font-bold text-slate-700 pt-2 border-t-2 border-slate-200">
                  2 kamar kosong di Lantai 2 siap disewakan
                </p>
              </div>

              <div className="neu-box bg-[#FFFFFF] p-5 sm:p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-600">Tiket Fasilitas</span>
                  <span className="neu-badge bg-[#EF4444] text-white px-2 py-0.5 text-xs">Prioritas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black font-mono">
                    {tickets.filter(t => t.status !== "selesai").length}
                  </h3>
                  <span className="text-xs sm:text-sm font-bold text-slate-600">Perlu Tindakan</span>
                </div>
                <p className="text-xs font-bold text-slate-700 pt-2 border-t-2 border-slate-200">
                  {tickets.filter(t => t.status === "menunggu_konfirmasi").length} menunggu konfirmasi anak kost
                </p>
              </div>

              <div className="neu-box bg-[#FFFFFF] p-5 sm:p-6 space-y-2 sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-600">Tagihan Tertunda</span>
                  <span className="neu-badge bg-[#F59E0B] text-black px-2 py-0.5 text-xs">
                    {billings.filter(b => b.status !== "Lunas").length} Kamar
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black font-mono text-[#2563EB]">
                    {"Rp " + billings.filter(b => b.status !== "Lunas").reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^0-9]/g, "")), 0).toLocaleString("id-ID")}
                  </h3>
                </div>
                <p className="text-xs font-bold text-slate-700 pt-2 border-t-2 border-slate-200">
                  Jatuh tempo sewa tgl 01 - 02 Okt 2026
                </p>
              </div>
            </div>

            {/* KANBAN BOARD PEMELIHARAAN */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <Wrench className="w-5 h-5 stroke-[3]" />
                    Papan Pemeliharaan Fasilitas
                  </h3>
                  <p className="text-xs font-bold text-slate-600">
                    Laporan masuk ➔ Tugaskan teknisi ➔ Verifikasi tuntas
                  </p>
                </div>
                <span className="neu-badge bg-[#FFFFFF] px-2.5 py-1 text-xs self-start sm:self-auto">
                  Total {tickets.length} Tiket
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Kolom 1: Laporan Masuk */}
                <div className="neu-box bg-[#FFE4E6] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-3 border-[#121212]">
                    <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-black"></span>
                      1. Laporan Masuk
                    </span>
                    <span className="neu-badge bg-[#FFFFFF] px-2 py-0.5 text-xs">
                      {tickets.filter(t => t.status === "diajukan").length}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {tickets.filter(t => t.status === "diajukan").length === 0 ? (
                      <div className="text-center py-8 text-xs font-bold text-slate-500 border-2 border-dashed border-slate-400 rounded-xl">
                        Tidak ada antrean laporan baru
                      </div>
                    ) : (
                      tickets.filter(t => t.status === "diajukan").map(t => (
                        <div key={t.id} className="neu-box-sm bg-[#FFFFFF] p-3.5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="neu-badge bg-[#E0E7FF] text-[#2563EB] px-2 py-0.5 text-[10px]">
                              {t.room}
                            </span>
                            <span className="neu-badge bg-[#FEE2E2] text-[#DC2626] px-2 py-0.5 text-[10px]">
                              {t.priority}
                            </span>
                          </div>

                          <div className="border-2 border-black rounded-lg overflow-hidden h-32 sm:h-36 bg-slate-100">
                            <img src={t.beforePhoto || t.photoUrl} alt="Foto Kerusakan" className="w-full h-full object-cover" />
                          </div>

                          <div>
                            <h4 className="font-black text-xs sm:text-sm text-[#121212]">{t.category}</h4>
                            <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">{t.issue}</p>
                          </div>

                          <div className="bg-[#FFFDF7] p-2 border border-slate-300 rounded text-[11px] font-bold text-slate-700 space-y-0.5">
                            <div>Pelapor: <b>{t.tenant}</b></div>
                            <div className="text-blue-700">Izin Kunjungan: <b>{t.visitSlot || "Siang"}</b></div>
                          </div>

                          <button 
                            onClick={() => moveTicketStatus(t.id, "diproses")}
                            className="w-full py-2 neu-btn bg-[#2563EB] text-white text-xs flex items-center justify-center gap-1.5"
                          >
                            <span>Tugaskan Teknisi</span>
                            <ChevronRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kolom 2: Sedang Dikerjakan */}
                <div className="neu-box bg-[#FEF3C7] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-3 border-[#121212]">
                    <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border-2 border-black"></span>
                      2. Sedang Dikerjakan
                    </span>
                    <span className="neu-badge bg-[#FFFFFF] px-2 py-0.5 text-xs">
                      {tickets.filter(t => t.status === "diproses" || t.status === "menunggu_konfirmasi").length}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {tickets.filter(t => t.status === "diproses" || t.status === "menunggu_konfirmasi").map(t => {
                      const isHandover = t.status === "menunggu_konfirmasi";

                      return (
                        <div key={t.id} className="neu-box-sm bg-[#FFFFFF] p-3.5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="neu-badge bg-[#E0E7FF] text-[#2563EB] px-2 py-0.5 text-[10px]">
                              {t.room}
                            </span>
                            <span className={"neu-badge px-2 py-0.5 text-[10px] " + (isHandover ? "bg-[#FFE600] text-black" : "bg-[#FEF3C7] text-[#D97706]")}>
                              {isHandover ? "Cek Penghuni" : t.priority}
                            </span>
                          </div>

                          <div className="border-2 border-black rounded-lg overflow-hidden h-32 sm:h-36 bg-slate-100">
                            <img src={t.afterPhoto || t.beforePhoto || t.photoUrl} alt="Foto Kerusakan" className="w-full h-full object-cover" />
                          </div>

                          <div>
                            <h4 className="font-black text-xs sm:text-sm text-[#121212]">{t.category}</h4>
                            <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">{t.issue}</p>
                          </div>

                          <div className="bg-[#F8F5EE] p-2 border border-slate-300 rounded text-xs space-y-1">
                            <div className="flex justify-between text-[10px] sm:text-[11px] font-black">
                              <span>Teknisi: <b className="text-black">{t.technician || "Pak Joko"}</b></span>
                              <span className="text-blue-700">{t.visitSlot || "Siang"}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium italic">
                              "{t.technicianNote || "Dalam proses pengerjaan."}"
                            </p>
                          </div>

                          {isHandover ? (
                            <div className="p-2.5 bg-[#FEFCE8] border-2 border-[#D97706] rounded-xl text-center space-y-0.5">
                              <span className="text-[11px] font-black text-[#B45309] block">
                                🔔 Menunggu Konfirmasi: {t.tenant}
                              </span>
                              <p className="text-[10px] font-bold text-slate-500">
                                Penghuni sedang menguji hasil perbaikan
                              </p>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenResolveModal(t)}
                              className="w-full py-2 neu-btn bg-[#FFE600] text-black text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                            >
                              <UploadCloud className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Upload Bukti Beres</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Kolom 3: Selesai */}
                <div className="neu-box bg-[#D1FAE5] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-3 border-[#121212]">
                    <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-black"></span>
                      3. Riwayat Tuntas
                    </span>
                    <span className="neu-badge bg-[#FFFFFF] px-2 py-0.5 text-xs">
                      {tickets.filter(t => t.status === "selesai").length}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {tickets.filter(t => t.status === "selesai").map(t => (
                      <div key={t.id} className="neu-box-sm bg-[#FFFFFF] p-3.5 space-y-2 opacity-95">
                        <div className="flex justify-between items-center">
                          <span className="neu-badge bg-[#E0E7FF] text-[#2563EB] px-2 py-0.5 text-[10px]">
                            {t.room}
                          </span>
                          <span className="neu-badge bg-[#D1FAE5] text-[#059669] px-2 py-0.5 text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Terverifikasi
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-[#121212]">{t.category}</h4>
                          <p className="text-xs font-medium text-slate-600 mt-1">{t.issue}</p>
                        </div>

                        <div className="pt-2 border-t-2 border-slate-200 text-[10px] sm:text-[11px] font-mono text-slate-600 flex justify-between">
                          <span>Selesai: {t.date}</span>
                          <span className="text-amber-500 font-black">★★★★★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* TABEL TAGIHAN SEWA & KONFIRMASI LUNAS (DENGAN HORIZONTAL SCROLL) */}
            <div className="neu-box bg-[#FFFFFF] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#121212] flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#2563EB] stroke-[3]" />
                    Monitoring Tagihan Sewa
                  </h3>
                  <p className="text-xs font-bold text-slate-600">
                    Kirim template pengingat WA atau tandai lunas saat bukti transfer masuk
                  </p>
                </div>
                <div className="neu-badge bg-[#FEF3C7] text-[#D97706] px-2.5 py-0.5 text-xs self-start sm:self-auto">
                  Rekening: BCA & Mandiri
                </div>
              </div>

              <div className="overflow-x-auto border-3 border-[#121212] rounded-xl -mx-1 sm:mx-0">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead className="bg-[#FFE600] border-b-3 border-[#121212] text-black font-black uppercase tracking-wider text-[10px] sm:text-[11px]">
                    <tr>
                      <th className="py-3 px-3 sm:px-4 border-r-2 border-black">Kamar</th>
                      <th className="py-3 px-3 sm:px-4 border-r-2 border-black">Nama</th>
                      <th className="py-3 px-3 sm:px-4 border-r-2 border-black">Jatuh Tempo</th>
                      <th className="py-3 px-3 sm:px-4 border-r-2 border-black">Nominal</th>
                      <th className="py-3 px-3 sm:px-4 border-r-2 border-black">Status</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#121212] font-bold">
                    {billings.map(b => (
                      <tr key={b.id} className="hover:bg-[#FFFBEB] transition-colors">
                        <td className="py-3 px-3 sm:px-4 border-r-2 border-black font-black">{b.room}</td>
                        <td className="py-3 px-3 sm:px-4 border-r-2 border-black">{b.name}</td>
                        <td className="py-3 px-3 sm:px-4 border-r-2 border-black font-mono">{b.dueDate}</td>
                        <td className="py-3 px-3 sm:px-4 border-r-2 border-black font-mono font-black text-[#2563EB]">{b.amount}</td>
                        <td className="py-3 px-3 sm:px-4 border-r-2 border-black">
                          <span className={"neu-badge px-2 py-0.5 text-[10px] " + (
                            b.status === "Lunas" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"
                          )}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status !== "Lunas" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => markAsPaid(b.id)}
                                  className="neu-btn bg-[#10B981] hover:bg-[#059669] text-white px-2 py-1 text-[10px] sm:text-[11px] flex items-center gap-1 shadow-[2px_2px_0px_#000]"
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Lunas</span>
                                </button>

                                <a 
                                  href={"https://wa.me/" + b.phone + "?text=Halo%20" + encodeURIComponent(b.name) + ",%20ini%20pengingat%20sewa%20kamar%20" + b.room + "%20sebesar%20" + encodeURIComponent(b.amount) + "%20jatuh%20tempo%20pada%20" + b.dueDate}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="neu-btn bg-[#25D366] text-black px-2 py-1 text-[10px] sm:text-[11px] inline-flex items-center gap-1 shadow-[2px_2px_0px_#000]"
                                >
                                  <MessageSquare className="w-3 h-3 stroke-[3]" />
                                  <span>WA</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-emerald-700 font-black text-xs flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Terbayar
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: PORTAL PENGHUNI REALISTIS */}
        {currentView === "tenant" && (
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            
            {/* KARTU KAMAR */}
            <div className="neu-box bg-[#FFFFFF] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border-3 sm:border-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b-3 border-[#121212]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 -mt-1 mb-2">
                    <span className="neu-badge bg-[#FFE600] text-black px-2.5 py-0.5 text-[10px]">
                      KAMAR AKTIF ANDA
                    </span>
                    <span className="neu-badge bg-[#10B981] text-white px-2.5 py-0.5 text-[10px]">
                      SEWA AKTIF
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#121212] tracking-tight">{selectedRoom}</h2>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    Penghuni Terdaftar: <b className="text-black font-black">Budi Santoso</b>
                  </p>
                </div>

                <div className="neu-box-sm bg-[#FFFDF7] p-3 text-left sm:text-right space-y-1 w-full sm:w-auto">
                  <div className="flex sm:block justify-between items-baseline">
                    <span className="text-[10px] uppercase font-black text-slate-500 block">Jatuh Tempo Sewa</span>
                    <span className="text-lg font-black font-mono text-[#2563EB]">Rp 1.450.000</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#DC2626] block">Batas: 01 Okt 2026</span>
                  
                  <button
                    type="button"
                    onClick={() => setShowPayModal(true)}
                    className="w-full py-1.5 neu-btn bg-[#FFE600] hover:bg-[#FACC15] text-black text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                  >
                    <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Bayar / Info Rekening</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs font-bold">
                <div className="neu-box-sm bg-[#F8F5EE] p-2">
                  <span className="text-[9px] text-slate-500 uppercase block">Tipe Kamar</span>
                  <span className="font-black text-slate-900 text-xs">Deluxe (Lt. 1)</span>
                </div>
                <div className="neu-box-sm bg-[#F8F5EE] p-2">
                  <span className="text-[9px] text-slate-500 uppercase block">Kamar Mandi</span>
                  <span className="font-black text-[#10B981] text-xs">Dalam & Shower</span>
                </div>
                <div className="neu-box-sm bg-[#F8F5EE] p-2">
                  <span className="text-[9px] text-slate-500 uppercase block">Pendingin</span>
                  <span className="font-black text-[#2563EB] text-xs">AC Split Aktif</span>
                </div>
                <div className="neu-box-sm bg-[#F8F5EE] p-2">
                  <span className="text-[9px] text-slate-500 uppercase block">WiFi Kamar</span>
                  <span className="font-black text-[#D97706] text-xs">Harmoni_Lt1</span>
                </div>
              </div>
            </div>

            {/* BAGIAN 1: STATUS & VALIDASI PERBAIKAN AKTIF */}
            <div className="neu-box bg-[#FFFFFF] p-4 sm:p-6 md:p-8 space-y-5 border-3 sm:border-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-4 border-b-3 border-[#121212]">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#121212] flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#2563EB] stroke-[3]" />
                    <span>Status & Validasi Perbaikan Kamar</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    Memantau perbaikan yang sedang berjalan dan konfirmasi hasil pengerjaan
                  </p>
                </div>
                <span className="neu-badge bg-[#FFE600] text-black px-2.5 py-0.5 text-xs self-start sm:self-auto">
                  {tickets.filter(t => t.room === selectedRoom && t.status !== "selesai").length} Masalah Aktif
                </span>
              </div>

              {tickets.filter(t => t.room === selectedRoom && t.status !== "selesai").length === 0 ? (
                <div className="p-6 sm:p-8 neu-box-sm bg-[#F0FDF4] border-2 border-[#10B981] text-center space-y-2">
                  <CheckCircle2 className="w-9 h-9 text-[#10B981] mx-auto stroke-[2.5]" />
                  <h4 className="font-black text-sm text-[#065F46]">Seluruh Fasilitas Kamar Berfungsi Normal!</h4>
                  <p className="text-xs font-bold text-slate-600 max-w-md mx-auto">
                    Tidak ada perbaikan yang sedang berjalan. Laporan tuntas tersimpan di arsip bawah.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {tickets.filter(t => t.room === selectedRoom && t.status !== "selesai").map(t => {
                    const isAwaitingCheck = t.status === "menunggu_konfirmasi";
                    const isInProgress = t.status === "diproses";
                    const isPending = t.status === "diajukan";

                    return (
                      <div 
                        key={t.id} 
                        className={"neu-box p-4 sm:p-5 space-y-3.5 border-3 transition-all " + (
                          isAwaitingCheck 
                            ? "bg-[#FEFCE8] border-[#D97706] shadow-[5px_5px_0px_#D97706]" 
                            : "bg-[#FFFFFF] border-black"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2 py-0.5 bg-black text-[#FFE600] rounded">
                              {t.id}
                            </span>
                            <span className="font-black text-xs sm:text-sm text-[#121212]">{t.category}</span>
                            <span className="text-[11px] font-bold text-slate-500">• {t.date}</span>
                          </div>

                          <div>
                            {isPending && (
                              <span className="neu-badge bg-[#FEE2E2] text-[#DC2626] px-2.5 py-0.5 text-xs">
                                ⏳ 1. Laporan Diajukan
                              </span>
                            )}
                            {isInProgress && (
                              <span className="neu-badge bg-[#FEF3C7] text-[#D97706] px-2.5 py-0.5 text-xs">
                                ⚡ 2. Sedang Dikerjakan
                              </span>
                            )}
                            {isAwaitingCheck && (
                              <span className="neu-badge bg-[#FFE600] text-black px-2.5 py-0.5 text-xs animate-pulse">
                                🔔 3. Menunggu Pengecekan Anda
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="neu-box-sm bg-white p-3 border-2 text-xs space-y-1">
                          <div className="flex flex-wrap justify-between items-center text-[10px] font-black text-slate-500 uppercase gap-1">
                            <span>Laporan Awal Anda:</span>
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Kunjungan: {t.visitSlot || "Siang"}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900">{t.issue}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                              <span>📷</span> Foto Kerusakan (Pelapor)
                            </span>
                            <div className="h-32 sm:h-36 rounded-lg overflow-hidden border-2 border-black bg-slate-100">
                              <img src={t.beforePhoto || t.photoUrl} alt="Foto Kerusakan" className="w-full h-full object-cover" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                              <span>🛠️</span> Foto Bukti Hasil Tukang
                            </span>
                            <div className="h-32 sm:h-36 rounded-lg overflow-hidden border-2 border-black bg-slate-100 flex items-center justify-center text-center p-3">
                              {t.afterPhoto ? (
                                <img src={t.afterPhoto} alt="Foto Hasil Perbaikan" className="w-full h-full object-cover" />
                              ) : (
                                <div className="space-y-1 text-slate-400">
                                  <Wrench className="w-5 h-5 mx-auto stroke-[2]" />
                                  <span className="text-[10px] font-bold block">Tukang belum upload foto bukti</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {t.technician && (
                          <div className="neu-box-sm bg-[#F8F5EE] p-2.5 border-2 text-xs space-y-0.5">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-600">
                              <span>TEKNISI: <b className="text-black">{t.technician}</b></span>
                              <span className="text-emerald-700">TERCATAT DI SISTEM</span>
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px]">
                              "{t.technicianNote}"
                            </p>
                          </div>
                        )}

                        {isAwaitingCheck && (
                          <div className="neu-box bg-[#FFFFFF] p-3.5 border-3 border-[#D97706] space-y-2.5">
                            <div>
                              <h4 className="font-black text-xs uppercase text-[#B45309]">
                                Konfirmasi Hasil Pengerjaan Fasilitas
                              </h4>
                              <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                                Teknisi menyatakan perbaikan telah selesai. Apakah fasilitas di kamar sudah Anda uji coba dan berfungsi normal?
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleTenantVerification(t.id, true)}
                                className="neu-btn bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Sudah Bagus & Berfungsi Normal</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleTenantVerification(t.id, false)}
                                className="neu-btn bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Masih Rusak / Komplain Ulang</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BAGIAN 2: RIWAYAT ARSIP PERBAIKAN SELESAI */}
            {tickets.filter(t => t.room === selectedRoom && t.status === "selesai").length > 0 && (
              <div className="neu-box bg-[#FFFFFF] p-4 sm:p-6 md:p-8 space-y-3.5 border-3 sm:border-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📋</span>
                    <h3 className="text-sm sm:text-base font-black text-[#121212]">
                      Riwayat Arsip Perbaikan Selesai
                    </h3>
                  </div>
                  <span className="neu-badge bg-[#D1FAE5] text-[#059669] px-2 py-0.5 text-[10px]">
                    {tickets.filter(t => t.room === selectedRoom && t.status === "selesai").length} Tiket Tuntas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tickets.filter(t => t.room === selectedRoom && t.status === "selesai").map(t => (
                    <div key={t.id} className="neu-box-sm bg-[#F8FAFC] p-3 border-2 border-slate-300 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px]">
                            {t.id}
                          </span>
                          <span className="font-black text-slate-900">{t.category}</span>
                          <span className="text-slate-500 font-bold text-[11px]">• {t.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="neu-badge bg-[#D1FAE5] text-[#059669] px-1.5 py-0.2 text-[9px] flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Terverifikasi
                          </span>
                          <span className="text-amber-500 text-xs font-black">★★★★★</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-semibold bg-white p-2 rounded border border-slate-200">
                        {t.issue}
                      </p>

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-1">
                        <span>Teknisi: <b className="text-slate-800">{t.technician || "Teknisi Unit Kost"}</b></span>
                        <span className="italic text-emerald-700 font-medium">"{t.technicianNote}"</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORM LAPOR KERUSAKAN */}
            <div className="neu-box bg-[#FFFFFF] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border-3 sm:border-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#121212] flex items-center gap-2">
                  <span>📝</span>
                  <span>Formulir Lapor Kerusakan Baru</span>
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Fasilitas kamar atau koridor ada yang rusak? Foto dan laporkan di sini agar tukang segera datang.
                </p>
              </div>

              {submitted && (
                <div className="p-3.5 neu-box-sm bg-[#D1FAE5] text-[#065F46] text-xs font-black flex items-center gap-2 border-2 border-black">
                  <CheckCircle className="w-4 h-4 stroke-[3]" />
                  Laporan berhasil dikirim! Pengelola akan segera menugaskan teknisi ke kamar Anda.
                </div>
              )}

              <form onSubmit={submitTicket} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block mb-1.5 uppercase text-slate-700">Kategori Fasilitas</label>
                    <select 
                      value={formCat} 
                      onChange={e => setFormCat(e.target.value)}
                      className="w-full neu-input p-2.5 sm:p-3"
                    >
                      <option>Pipa / Saluran Air</option>
                      <option>Kelistrikan & AC</option>
                      <option>Pintu & Kunci</option>
                      <option>Perabot Kamar (Kasur/Lemari)</option>
                      <option>Fasilitas Bersama (Dapur/WiFi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase text-slate-700">Tingkat Urgensi</label>
                    <select 
                      value={formPri} 
                      onChange={e => setFormPri(e.target.value)}
                      className="w-full neu-input p-2.5 sm:p-3"
                    >
                      <option>Sedang (Bisa ditangani dalam 24 jam)</option>
                      <option>Tinggi (Darurat - Bocor deras/Mati listrik)</option>
                      <option>Rendah (Pengecekan berkala)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-slate-700">Waktu Kunjungan Teknisi yang Diizinkan</label>
                  <select 
                    value={preferredTime} 
                    onChange={e => setPreferredTime(e.target.value)}
                    className="w-full neu-input p-2.5 sm:p-3"
                  >
                    <option>Siang (13.00 - 16.00 / Pulang Kuliah)</option>
                    <option>Pagi (08.30 - 11.30)</option>
                    <option>Sore (16.00 - 18.00)</option>
                    <option>Bebas Kapan Saja (Izin Masuk Kamar Didampingi Penjaga Kost)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-slate-700">Rincian Kerusakan</label>
                  <textarea 
                    rows={3} 
                    required 
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Contoh: Kran wastafel airnya tidak mau berhenti menetes dan rembes ke lantai..."
                    className="w-full neu-input p-2.5 sm:p-3 resize-none font-semibold text-xs"
                  />
                </div>

                {/* UPLOAD FOTO */}
                <div>
                  <label className="block mb-1.5 uppercase text-slate-700">Lampirkan Bukti Foto Kerusakan</label>
                  
                  <input 
                    type="file" 
                    id="damage-photo-input" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />

                  {!uploadedPhoto ? (
                    <label 
                      htmlFor="damage-photo-input"
                      className="border-3 border-dashed border-[#121212] rounded-2xl p-5 sm:p-6 text-center space-y-1.5 bg-[#FFFDF7] cursor-pointer hover:bg-[#FFE600]/15 flex flex-col items-center justify-center transition-all block"
                    >
                      <UploadCloud className="w-8 h-8 text-[#2563EB] stroke-[2.5]" />
                      <p className="text-xs font-black text-slate-800">Klik untuk upload foto dari galeri atau kamera ponsel</p>
                      <p className="text-[10px] font-bold text-slate-500">Mendukung format JPG, PNG, atau WEBP</p>
                    </label>
                  ) : (
                    <div className="neu-box-sm bg-[#FFFFFF] p-2.5 sm:p-3 border-2 border-black flex items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-black shrink-0 bg-slate-100">
                        <img src={uploadedPhoto} alt="Preview Bukti Kerusakan" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="font-black text-emerald-700 block">✓ Foto Berhasil Dipilih</span>
                        <span className="text-[10px] text-slate-600 font-bold block mt-0.5">Foto asli terlampir ke tiket teknisi.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedPhoto(null)}
                        className="neu-btn bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#DC2626] px-2 py-1 text-[10px] font-black shrink-0"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 neu-btn bg-[#FFE600] text-black text-xs sm:text-sm font-black flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>Kirim Laporan Kerusakan</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* 4. MODAL INFO REKENING (RESPONSIF DENGAN MAX-HEIGHT SCROLL) */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="neu-box bg-[#FFFFFF] max-w-md w-full p-5 sm:p-8 space-y-4 sm:space-y-5 border-3 sm:border-4 relative my-auto max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setShowPayModal(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 neu-btn bg-[#FEE2E2] text-black flex items-center justify-center"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            <div>
              <span className="neu-badge bg-[#10B981] text-white px-2 py-0.5 text-[10px] inline-block mb-1">
                PEMBAYARAN SEWA
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#121212]">Tagihan Kamar A-03</h3>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                Periode Sewa: 01 Okt 2026 - 01 Nov 2026
              </p>
            </div>

            <div className="neu-box-sm bg-[#FFFDF7] p-3 sm:p-4 border-2 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Pembayaran</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#2563EB] block">Rp 1.450.000</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 block">Sudah termasuk Listrik, Air, & WiFi Kamar</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <label className="uppercase text-slate-600 block text-[11px]">Transfer Rekening Pengelola Kost:</label>
              
              <div className="neu-box-sm bg-white p-2.5 sm:p-3 border-2 flex justify-between items-center gap-2">
                <div className="truncate">
                  <span className="font-black text-xs sm:text-sm block">BCA: 8035-129-889</span>
                  <span className="text-slate-500 text-[10px] block truncate">a/n Siti Rahmawati (Pemilik Kost)</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Nomor rekening BCA berhasil disalin!")}
                  className="px-2 py-1 bg-[#F1ECE1] border border-black rounded text-[10px] font-black shrink-0"
                >
                  Salin
                </button>
              </div>

              <div className="neu-box-sm bg-white p-2.5 sm:p-3 border-2 flex justify-between items-center gap-2">
                <div className="truncate">
                  <span className="font-black text-xs sm:text-sm block">Mandiri: 136-00-128938-1</span>
                  <span className="text-slate-500 text-[10px] block truncate">a/n Siti Rahmawati (Pemilik Kost)</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Nomor rekening Mandiri berhasil disalin!")}
                  className="px-2 py-1 bg-[#F1ECE1] border border-black rounded text-[10px] font-black shrink-0"
                >
                  Salin
                </button>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Ibu%20Siti%20(Pengelola%20Kost%20Griya%20Harmoni),%20saya%20Budi%20Santoso%20dari%20Kamar%20A-03%20ingin%20mengirimkan%20bukti%20transfer%20sewa%20sebesar%20Rp%201.450.000."
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 sm:py-3 neu-btn bg-[#25D366] text-black text-xs font-black flex items-center justify-center gap-2 uppercase"
              >
                <MessageSquare className="w-4 h-4 stroke-[3]" />
                <span>Kirim Bukti Transfer via WA</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL UPLOAD BUKTI TEKNISI (RESPONSIF) */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="neu-box bg-[#FFFFFF] max-w-lg w-full p-5 sm:p-8 space-y-4 sm:space-y-5 border-3 sm:border-4 relative my-auto max-h-[92vh] overflow-y-auto">
            
            <button 
              onClick={() => setResolvingTicket(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 neu-btn bg-[#FEE2E2] text-black flex items-center justify-center"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            <div>
              <span className="neu-badge bg-[#FFE600] text-black px-2 py-0.5 text-[10px] inline-block mb-1">
                TIKET: {resolvingTicket.id}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#121212]">
                Unggah Bukti Selesai
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                Kamar: <b>{resolvingTicket.room}</b> • {resolvingTicket.category}
              </p>
            </div>

            <form onSubmit={handleConfirmResolveTicket} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block mb-1.5 uppercase text-slate-700">Foto Bukti Setelah Diperbaiki</label>
                
                <input 
                  type="file" 
                  id="tech-proof-photo" 
                  accept="image/*" 
                  onChange={handleTechPhotoUpload} 
                  className="hidden" 
                />

                {!techPhotoInput ? (
                  <label 
                    htmlFor="tech-proof-photo"
                    className="border-3 border-dashed border-[#121212] rounded-2xl p-5 text-center space-y-1.5 bg-[#FFFDF7] cursor-pointer hover:bg-[#FFE600]/15 flex flex-col items-center justify-center transition-all block"
                  >
                    <UploadCloud className="w-8 h-8 text-[#2563EB] stroke-[2.5]" />
                    <p className="text-xs font-black text-slate-800">Klik untuk upload foto hasil tukang</p>
                    <p className="text-[10px] font-bold text-slate-500">Tampil di portal anak kost untuk diperiksa</p>
                  </label>
                ) : (
                  <div className="neu-box-sm bg-[#FFFFFF] p-2.5 border-2 border-black flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-black shrink-0 bg-slate-100">
                      <img src={techPhotoInput} alt="Preview Bukti Tukang" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-black text-emerald-700 block">✓ Foto Bukti Terpasang</span>
                      <span className="text-[10px] text-slate-600 font-bold block mt-0.5">Penghuni kamar dapat membandingkan before & after.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTechPhotoInput(null)}
                      className="neu-btn bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#DC2626] px-2 py-1 text-[10px] font-black shrink-0"
                    >
                      Ganti
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-slate-700">Catatan Pengerjaan Teknisi</label>
                <textarea 
                  rows={3} 
                  required 
                  value={techNoteInput}
                  onChange={e => setTechNoteInput(e.target.value)}
                  placeholder="Contoh: Silinder kunci telah diganti dengan merk solid kuningan..."
                  className="w-full neu-input p-2.5 resize-none font-semibold text-xs"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 neu-btn bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Kirim Bukti & Minta Verifikasi</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 6. MODAL LOGIN (RESPONSIF) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="neu-box bg-[#FFFFFF] max-w-md w-full p-5 sm:p-8 space-y-4 sm:space-y-5 border-3 sm:border-4 relative my-auto max-h-[92vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 neu-btn bg-[#FEE2E2] text-black flex items-center justify-center"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            <div>
              <span className={"neu-badge px-2.5 py-0.5 text-xs inline-block mb-1.5 " + (
                loginRole === "owner" ? "bg-[#FFE600] text-black" : "bg-[#3B82F6] text-white"
              )}>
                {loginRole === "owner" ? "Portal Pengelola Kost" : "Akses Penghuni Kost"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#121212]">
                {loginRole === "owner" ? "Masuk Dashboard Pemilik" : "Akses Portal Kamar"}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                {loginRole === "owner" 
                  ? "Kelola tiket kerusakan fasilitas dan billing reminder penyewa."
                  : "Pilih nomor kamarmu untuk melihat tagihan & melaporkan kerusakan."}
              </p>
            </div>

            <form onSubmit={handlePerformLogin} className="space-y-3.5 text-xs font-bold">
              {loginRole === "owner" ? (
                <>
                  <div>
                    <label className="block mb-1.5 uppercase text-slate-700">Email Pengelola</label>
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="admin@kostara.id"
                      className="w-full neu-input p-2.5 sm:p-3"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase text-slate-700">Kata Sandi</label>
                    <input 
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full neu-input p-2.5 sm:p-3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-1.5 uppercase text-slate-700">Pilih Kamar Kost Anda</label>
                    <select 
                      value={selectedRoom} 
                      onChange={e => setSelectedRoom(e.target.value)}
                      className="w-full neu-input p-2.5 sm:p-3"
                    >
                      <option>Kamar A-03</option>
                      <option>Kamar B-07</option>
                      <option>Kamar A-01</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase text-slate-700">Nomor WhatsApp Penghuni</label>
                    <input 
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      className="w-full neu-input p-2.5 sm:p-3"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit"
                className={"w-full py-3 neu-btn text-xs sm:text-sm font-black flex items-center justify-center gap-2 uppercase tracking-wider " + (
                  loginRole === "owner" ? "bg-[#FFE600] text-black" : "bg-[#2563EB] text-white"
                )}
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="pt-2 border-t-2 border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setCurrentView(loginRole);
                  }}
                  className="text-xs font-black text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gunakan Akun Demo (Bypass Langsung)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
