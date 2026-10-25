import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Phone, 
  User, 
  Trash2, 
  Download, 
  CheckCircle2, 
  BedDouble, 
  MessageSquare,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  LogOut,
  PlusCircle,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
  Cloud
} from 'lucide-react';
import { 
  type BookingRecord, 
  saveBookingToCloud, 
  subscribeToBookings, 
  updateBookingStatusInCloud, 
  deleteBookingFromCloud, 
  saveHotelWhatsappNumber, 
  subscribeToHotelSettings 
} from '../lib/bookingsService';

export type { BookingRecord };

interface AdminBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBookingsDrawer: React.FC<AdminBookingsDrawerProps> = ({ isOpen, onClose }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('sheetal_admin_auth') === 'true' ||
      localStorage.getItem('sheetal_admin_remember') === 'true'
    );
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Tab State: 'bookings' | 'walkin' | 'settings'
  const [activeTab, setActiveTab] = useState<'bookings' | 'walkin' | 'settings'>('bookings');

  // Booking Data
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Settings State
  const [whatsappNum, setWhatsappNum] = useState<string>(() => {
    return localStorage.getItem('sheetal_hotel_whatsapp') || '919829000000';
  });
  const [tempPhone, setTempPhone] = useState(whatsappNum);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Walk-in Guest Form State
  const [walkinForm, setWalkinForm] = useState({
    name: '',
    phone: '',
    email: '',
    roomType: 'Super Deluxe AC Room',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    nights: 1,
    guests: 2,
    totalAmount: 2499,
    specialRequest: 'Front desk direct walk-in',
    status: 'Confirmed' as BookingRecord['status'],
  });

  // Cloud Database synchronization status
  const [isCloudLive, setIsCloudLive] = useState<boolean>(true);

  const loadBookings = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('sheetal_bookings_log') || '[]');
      setBookings(stored);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Load initial local data immediately
    loadBookings();
    const savedPhone = localStorage.getItem('sheetal_hotel_whatsapp') || '919829000000';
    setWhatsappNum(savedPhone);
    setTempPhone(savedPhone);

    // Subscribe to real-time Cloud Firestore updates
    const unsubscribeBookings = subscribeToBookings(
      (liveBookings) => {
        setBookings(liveBookings);
        setIsCloudLive(true);
      },
      () => {
        setIsCloudLive(false);
      }
    );

    // Subscribe to cloud settings updates
    const unsubscribeSettings = subscribeToHotelSettings((phone) => {
      setWhatsappNum(phone);
      setTempPhone(phone);
    });

    return () => {
      if (unsubscribeBookings) unsubscribeBookings();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [isOpen]);

  // Handle Login Submission
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const trimmed = passcodeInput.trim();
    const customPass = localStorage.getItem('sheetal_custom_admin_pass');

    // Valid passcodes: default is 'sheetal@tonk' or PIN '1985' or 'admin123' or custom set password
    const isValid = 
      trimmed === 'sheetal@tonk' ||
      trimmed === '1985' ||
      trimmed === 'admin123' ||
      (customPass && trimmed === customPass);

    if (isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sheetal_admin_auth', 'true');
      if (rememberMe) {
        localStorage.setItem('sheetal_admin_remember', 'true');
      }
      setPasscodeInput('');
      setAuthError('');
    } else {
      setAuthError('Access Denied: Incorrect passcode. Only authorized staff may enter.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sheetal_admin_auth');
    localStorage.removeItem('sheetal_admin_remember');
    setPasscodeInput('');
    setActiveTab('bookings');
  };

  // Change Admin Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setPasswordSuccessMsg('Password must be at least 4 characters long.');
      return;
    }
    localStorage.setItem('sheetal_custom_admin_pass', newPassword.trim());
    setPasswordSuccessMsg('Admin passcode updated successfully! Save it securely.');
    setNewPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  // Save WhatsApp Receiving Phone
  const saveWhatsappPhone = () => {
    const clean = tempPhone.replace(/[^0-9]/g, '');
    if (clean.length >= 10) {
      localStorage.setItem('sheetal_hotel_whatsapp', clean);
      setWhatsappNum(clean);
      saveHotelWhatsappNumber(clean).catch(console.error);
      alert(`WhatsApp receiving number updated to +${clean} and synced to Cloud Database!`);
    } else {
      alert('Please enter a valid 10-12 digit phone number with country code (e.g. 919829000000).');
    }
  };

  // Update Booking Status
  const updateBookingStatus = (ref: string, newStatus: BookingRecord['status']) => {
    const updated = bookings.map(b => b.ref === ref ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('sheetal_bookings_log', JSON.stringify(updated));
    updateBookingStatusInCloud(ref, newStatus).catch(console.error);
  };

  // Delete Individual Record
  const deleteBooking = (ref: string) => {
    if (confirm(`Are you sure you want to delete reservation ${ref}?`)) {
      const filtered = bookings.filter(b => b.ref !== ref);
      setBookings(filtered);
      localStorage.setItem('sheetal_bookings_log', JSON.stringify(filtered));
      deleteBookingFromCloud(ref).catch(console.error);
    }
  };

  // Add Manual Walk-in Guest
  const handleAddWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinForm.name || !walkinForm.phone) {
      alert('Please enter guest name and phone number.');
      return;
    }

    const newRecord: BookingRecord = {
      ref: `HST-W${Math.floor(1000 + Math.random() * 9000)}`,
      name: walkinForm.name,
      phone: walkinForm.phone,
      email: walkinForm.email,
      roomType: walkinForm.roomType,
      checkIn: walkinForm.checkIn,
      checkOut: walkinForm.checkOut,
      nights: Number(walkinForm.nights) || 1,
      guests: Number(walkinForm.guests) || 2,
      totalAmount: Number(walkinForm.totalAmount) || 2499,
      specialRequest: walkinForm.specialRequest,
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: walkinForm.status,
    };

    const updated = [newRecord, ...bookings];
    setBookings(updated);
    localStorage.setItem('sheetal_bookings_log', JSON.stringify(updated));
    saveBookingToCloud(newRecord).catch(console.error);
    setActiveTab('bookings');
    alert(`Walk-in guest ${walkinForm.name} registered successfully with Ref ID ${newRecord.ref} and saved to Cloud Database!`);

    // Reset walkin form
    setWalkinForm({
      name: '',
      phone: '',
      email: '',
      roomType: 'Super Deluxe AC Room',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      nights: 1,
      guests: 2,
      totalAmount: 2499,
      specialRequest: 'Front desk direct walk-in',
      status: 'Confirmed',
    });
  };

  // Seed sample data for demonstration if empty
  const addSampleBookings = () => {
    const samples: BookingRecord[] = [
      {
        ref: 'HST-7821',
        name: 'Rajesh Sharma',
        phone: '9829123456',
        email: 'rajesh.sharma@gmail.com',
        roomType: 'Super Deluxe AC Room',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        nights: 2,
        guests: 2,
        totalAmount: 4998,
        specialRequest: 'Early check-in around 11:00 AM requested.',
        createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'Confirmed'
      },
      {
        ref: 'HST-5419',
        name: 'Sunita & Vikram Meena',
        phone: '9414098765',
        email: 'vikram.tonk@yahoo.com',
        roomType: 'Sheetal Royal Wedding Lawn (Up to 1500 Guests)',
        checkIn: '2026-11-15',
        checkOut: '2026-11-17',
        nights: 2,
        guests: 1200,
        totalAmount: 185000,
        specialRequest: 'Need pure vegetarian catering menu discussion with banquet manager.',
        createdAt: new Date(Date.now() - 3600000 * 4).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'Pending'
      },
      {
        ref: 'HST-3104',
        name: 'Amitabh Choudhary',
        phone: '9783112233',
        email: 'amitabh@techcorp.in',
        roomType: 'Executive Business Suite',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nights: 1,
        guests: 1,
        totalAmount: 3499,
        specialRequest: 'Quiet room facing courtyard with high-speed WiFi.',
        createdAt: new Date(Date.now() - 3600000 * 12).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'Checked In'
      }
    ];

    const merged = [...samples, ...bookings];
    setBookings(merged);
    localStorage.setItem('sheetal_bookings_log', JSON.stringify(merged));
  };

  // Export to CSV spreadsheet
  const exportToCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      'Ref ID',
      'Date & Time',
      'Guest Name',
      'Phone / WhatsApp',
      'Email',
      'Room or Banquet Category',
      'Check-In Date',
      'Check-Out Date',
      'Nights',
      'Guests Count',
      'Total Amount (INR)',
      'Special Requests',
      'Status'
    ];

    const rows = bookings.map(b => [
      `"${b.ref}"`,
      `"${b.createdAt}"`,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.email || ''}"`,
      `"${b.roomType}"`,
      `"${b.checkIn}"`,
      `"${b.checkOut}"`,
      b.nights,
      b.guests,
      b.totalAmount,
      `"${(b.specialRequest || '').replace(/"/g, '""')}"`,
      `"${b.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hotel_Sheetal_Tonk_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearBookings = () => {
    if (confirm('Are you sure you want to clear the local booking register? This action cannot be undone.')) {
      localStorage.removeItem('sheetal_bookings_log');
      setBookings([]);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.phone || '').includes(searchTerm) ||
      (b.ref || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.roomType || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#0f131f] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ======================================================== */}
        {/* STATE 1: ADMIN LOGIN SCREEN (When Not Authenticated)    */}
        {/* ======================================================== */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Shield / Lock Graphic */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#d4af37]/20 via-[#d4af37]/10 to-amber-500/20 border border-[#d4af37]/50 flex items-center justify-center shadow-xl">
                <Lock className="w-10 h-10 text-[#d4af37]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0f131f] flex items-center justify-center text-[10px] text-black font-bold">
                ✓
              </div>
            </div>

            {/* Title & Introduction */}
            <div className="space-y-1.5 max-w-md">
              <div className="text-[11px] font-semibold text-[#d4af37] tracking-widest uppercase">
                Hotel Sheetal Tonk · Front Desk Portal
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-white">
                Admin & Receptionist Login
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yahan se Hotel Sheetal Tonk ke manager ya receptionist login karke sabhi customer bookings, guest contact details, WhatsApp slips aur Excel sheet records dekh sakte hain.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Passcode / PIN
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="••••••••••••"
                    autoFocus
                    className="w-full px-4 py-2.5 pr-10 bg-black/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs text-center animate-shake">
                  {authError}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-black text-[#d4af37] focus:ring-0"
                  />
                  <span>Remember on this computer</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-[#e6c150] hover:to-amber-400 text-black font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 font-cinzel"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify & Enter Desk</span>
              </button>
            </form>

            {/* Confidential Front Desk Security Notice */}
            <div className="w-full max-w-sm pt-3 border-t border-white/5 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#d4af37]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Staff & Hotel Management Only</span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Security Policy: Access is restricted to front desk receptionists and administrative officers of Hotel Sheetal Tonk.
              </p>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STATE 2: AUTHENTICATED ADMIN DESK MANAGEMENT CONSOLE     */
          /* ======================================================== */
          <>
            {/* Top Navigation & Status Bar */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>FRONT DESK DESPATCH · LOGGED IN AS MANAGER</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white">
                    Hotel Sheetal Tonk · Admin Control
                  </h3>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2">
                <div 
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 border transition-all ${
                    isCloudLive 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}
                  title={isCloudLive ? 'Connected to Firebase Cloud Firestore. Bookings sync in real-time across devices.' : 'Connecting to Cloud Firestore...'}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isCloudLive ? 'Cloud DB Live' : 'Cloud Syncing'}</span>
                </div>

                {bookings.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
                    title="Export all reservations to Excel / CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Logout from Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 bg-[#111624] border-b border-white/10 flex items-center justify-between overflow-x-auto text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'bookings'
                      ? 'border-[#d4af37] text-[#d4af37]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>All Reservations ({bookings.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('walkin')}
                  className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'walkin'
                      ? 'border-[#d4af37] text-[#d4af37]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ New Walk-in / Phone Guest</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'settings'
                      ? 'border-[#d4af37] text-[#d4af37]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Desk & Password Settings</span>
                </button>
              </div>

              {bookings.length === 0 && (
                <button
                  onClick={addSampleBookings}
                  className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 mb-2 whitespace-nowrap"
                  title="Generate mock reservations to test register"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>+ Add Demo Bookings</span>
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* TAB 1: BOOKINGS LIST */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Guest Name, Phone number, or Ref ID..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#0b0e17] border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-[#0b0e17] border border-white/10 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="All">All Statuses ({bookings.length})</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Checked In">Checked In</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {bookings.length > 0 && (
                        <button
                          onClick={clearBookings}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                          title="Clear entire register"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Orders List View */}
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-3 bg-black/20 rounded-2xl border border-dashed border-white/10">
                      <Calendar className="w-12 h-12 text-slate-600 mx-auto opacity-40" />
                      <p className="text-sm font-medium text-slate-200">
                        {searchTerm ? 'No matching bookings found.' : 'Abhi koi booking record nahi hai.'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Jab bhi koi guest website par 'Reserve Stay', AC Room ya Marriage Lawn book karega, ya aap '+ New Walk-in' tab se guest add karenge, sabhi records yahan register honge.
                      </p>
                      <button
                        onClick={addSampleBookings}
                        className="px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] font-semibold rounded-lg hover:bg-[#d4af37]/30 transition-colors inline-flex items-center gap-1.5 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Add Demo Bookings To Test</span>
                      </button>
                    </div>
                  ) : (
                    filteredBookings.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#d4af37]/40 transition-all space-y-3 shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-mono font-bold text-xs">
                              {b.ref}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">{b.createdAt}</span>
                          </div>

                          {/* Status Dropdown & WhatsApp Direct */}
                          <div className="flex items-center gap-2">
                            <select
                              value={b.status}
                              onChange={(e) => updateBookingStatus(b.ref, e.target.value as BookingRecord['status'])}
                              className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                  : b.status === 'Checked In'
                                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                                  : b.status === 'Pending'
                                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                  : b.status === 'Completed'
                                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Checked In">Checked In</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${b.name || 'Guest'}, greetings from Hotel Sheetal Tonk! We are following up regarding your reservation (${b.ref}) for ${b.roomType}. How may we assist you today?`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                              title="Chat with guest on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>

                            <button
                              onClick={() => deleteBooking(b.ref)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Guest & Room Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Guest Name:</span>
                            <span className="text-white font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                              <User className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span>{b.name || 'Walk-in Guest'}</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Phone / Mobile:</span>
                            <a
                              href={`tel:${b.phone}`}
                              className="text-white font-mono font-medium hover:text-[#d4af37] transition-colors flex items-center gap-1.5 mt-0.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{b.phone}</span>
                            </a>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Tariff / Estimate:</span>
                            <span className="text-[#d4af37] font-mono font-bold text-sm block mt-0.5">
                              ₹{b.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 bg-white/5 p-2.5 rounded-lg">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Room / Service Category:</span>
                            <span className="font-medium text-white">{b.roomType}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Dates & Capacity:</span>
                            <span>{b.checkIn} to {b.checkOut} ({b.nights} night{b.nights > 1 ? 's' : ''}, {b.guests} guest{b.guests > 1 ? 's' : ''})</span>
                          </div>
                        </div>

                        {b.email && (
                          <div className="text-[11px] text-slate-400">
                            Email: <span className="text-slate-200">{b.email}</span>
                          </div>
                        )}

                        {b.specialRequest && (
                          <div className="text-[11px] text-amber-200/90 bg-amber-950/20 border border-amber-500/20 p-2 rounded">
                            <strong>Note:</strong> {b.specialRequest}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: MANUAL WALK-IN / PHONE GUEST ENTRY */}
              {activeTab === 'walkin' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="p-4 rounded-xl bg-[#141b2c] border border-white/10 space-y-1">
                    <h4 className="text-white font-cinzel font-bold text-sm flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-[#d4af37]" />
                      <span>Direct Front Desk Walk-In / Phone Reservation</span>
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Use this form when a guest checks in physically at the reception desk in Tonk or calls over the phone. This will register them immediately into your system and CSV exports.
                    </p>
                  </div>

                  <form onSubmit={handleAddWalkin} className="space-y-4 bg-black/40 p-5 rounded-2xl border border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Guest Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={walkinForm.name}
                          onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={walkinForm.phone}
                          onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                          placeholder="e.g. 9829012345"
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Room or Lawn Category
                        </label>
                        <select
                          value={walkinForm.roomType}
                          onChange={(e) => setWalkinForm({ ...walkinForm, roomType: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Super Deluxe AC Room">Super Deluxe AC Room (₹2,499/night)</option>
                          <option value="Executive Business Suite">Executive Business Suite (₹3,499/night)</option>
                          <option value="Royal Family Jharokha Room">Royal Family Jharokha Room (₹4,299/night)</option>
                          <option value="Sheetal Heritage Villa">Sheetal Heritage Villa (₹6,999/night)</option>
                          <option value="Sheetal Marriage Lawn (Up to 1500 Guests)">Sheetal Marriage Lawn</option>
                          <option value="Glass Restaurant Table Booking">Glass Restaurant Table</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Initial Status
                        </label>
                        <select
                          value={walkinForm.status}
                          onChange={(e) => setWalkinForm({ ...walkinForm, status: e.target.value as BookingRecord['status'] })}
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Check-In Date
                        </label>
                        <input
                          type="date"
                          value={walkinForm.checkIn}
                          onChange={(e) => setWalkinForm({ ...walkinForm, checkIn: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Check-Out Date
                        </label>
                        <input
                          type="date"
                          value={walkinForm.checkOut}
                          onChange={(e) => setWalkinForm({ ...walkinForm, checkOut: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Total Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={walkinForm.totalAmount}
                          onChange={(e) => setWalkinForm({ ...walkinForm, totalAmount: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Front Desk Notes / Special Requests
                      </label>
                      <input
                        type="text"
                        value={walkinForm.specialRequest}
                        onChange={(e) => setWalkinForm({ ...walkinForm, specialRequest: e.target.value })}
                        placeholder="e.g. Extra mattress requested, ID verified at desk"
                        className="w-full px-3 py-2 bg-[#0b0e17] border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Save Walk-in Guest to System</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: SETTINGS & PASSWORD CHANGE */}
              {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6">
                  {/* WhatsApp Receiving Number */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-[#d4af37] font-semibold text-sm">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Reception WhatsApp Receiving Number</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      Jab website par koi guest booking complete karega, to isi WhatsApp number par unka message receive hoga.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="e.g. 919829000000"
                        className="flex-1 px-3 py-2 bg-[#0b0e17] border border-white/20 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                      <button
                        onClick={saveWhatsappPhone}
                        className="px-4 py-2 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold rounded-lg text-xs transition-colors"
                      >
                        Save Number
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Current Active: <span className="text-emerald-400 font-mono font-medium">+{whatsappNum}</span>
                    </div>
                  </div>

                  {/* Change Admin Password */}
                  <form onSubmit={handleUpdatePassword} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-[#d4af37] font-semibold text-sm">
                      <KeyRound className="w-4 h-4" />
                      <span>Change Staff Admin Passcode</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      Set a confidential custom passcode for hotel reception and front desk managers.
                    </p>
                    <div className="space-y-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new confidential passcode..."
                        className="w-full px-3 py-2 bg-[#0b0e17] border border-white/20 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold rounded-lg text-xs transition-colors"
                      >
                        Update Admin Password
                      </button>
                    </div>
                    {passwordSuccessMsg && (
                      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                        {passwordSuccessMsg}
                      </div>
                    )}
                  </form>

                  {/* How it works info */}
                  <div className="p-4 rounded-xl bg-[#141b2c] border border-white/10 text-slate-300 text-xs space-y-2">
                    <div className="font-semibold text-[#d4af37] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Admin Access Guide</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11.5px] text-slate-400">
                      <li><strong>Website Header:</strong> Navbar me upar <strong>"Admin Portal / Desk Log"</strong> button par click karke kabhi bhi yeh screen kholi ja sakti hai.</li>
                      <li><strong>Session:</strong> Ek baar login karne par jab tak aap "Logout" nahi karte, session saved rehta hai.</li>
                      <li><strong>Spreadsheet:</strong> Excel button se aap poore mahine ki reservations CSV format me download karke office computer me save kar sakte hain.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Bar */}
            <div className="p-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active Shift: Hotel Sheetal Tonk Reception</span>
              </div>
              <div className="flex items-center gap-2">
                {bookings.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Sheet</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold rounded-lg transition-colors"
                >
                  Close Register
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
