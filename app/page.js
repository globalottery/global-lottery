'use client';

import { useMemo, useState } from 'react';

function generateMockWallet() {
  const chars = 'abcdef0123456789';
  let value = '0x';
  for (let i = 0; i < 40; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

function generateMockTicket() {
  return `GL-${Math.floor(100000 + Math.random() * 900000)}`;
}

function downloadCsv(users) {
  const headers = ['id', 'fullName', 'email', 'password', 'wallet', 'ticket', 'createdAt', 'verified'];
  const rows = users.map((user) =>
    headers
      .map((header) => {
        const value = String(user[header] ?? '').replace(/"/g, '""');
        return `"${value}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'global_lottery_registros.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function GlobalLotteryLandingPage() {
  const stripePaymentLink = 'https://buy.stripe.com/test_1234567890';
  const [showRegister, setShowRegister] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [mockAccount, setMockAccount] = useState({
    wallet: '',
    ticket: '',
    email: '',
    createdAt: '',
  });

  const mockVerificationCode = useMemo(() => {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }, [registered]);

  const openRegister = () => {
    setShowRegister(true);
    setRegistered(false);
    setFormData({ fullName: '', email: '', password: '' });
    setMockAccount({ wallet: '', ticket: '', email: '', createdAt: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      id: Date.now(),
      fullName: formData.fullName,
      email: formData.email || 'usuario@correo.com',
      password: formData.password,
      wallet: generateMockWallet(),
      ticket: generateMockTicket(),
      createdAt: new Date().toLocaleString('es-ES'),
      verified: false,
    };

    const existingUsers = JSON.parse(window.localStorage.getItem('globalLotteryUsers') || '[]');
    const updatedUsers = [...existingUsers, newUser];

    window.localStorage.setItem('globalLotteryUsers', JSON.stringify(updatedUsers));
    downloadCsv(updatedUsers);

    setMockAccount({
      wallet: newUser.wallet,
      ticket: newUser.ticket,
      email: newUser.email,
      createdAt: newUser.createdAt,
    });
    setRegistered(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white [font-family:Georgia,'Times_New_Roman',serif]">
      
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <div className="absolute h-[800px] w-[800px] rounded-full bg-[#D4AF37]/20 blur-[180px] animate-pulse" />

        <div className="absolute left-0 top-0 flex w-full justify-end p-6">
          <button
            onClick={openRegister}
            className="rounded-full bg-[#D4AF37] px-6 py-2 font-semibold text-black transition hover:scale-105"
          >
            CREAR CUENTA
          </button>
        </div>

        <div className="relative z-10 flex max-w-5xl flex-col items-center">
          <div className="mb-10 flex select-none flex-col items-center">
            <span className="text-[88px] font-black tracking-[-0.08em] text-[#D4AF37] md:text-[128px]">
              GL
            </span>
            <div className="text-[24px] tracking-[0.22em] md:text-[34px]">
              GLOBAL LOTTERY
            </div>
            <div className="text-[10px] tracking-[0.6em] text-[#D4AF37] md:text-[13px]">
              Since 2026
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl text-[#D4AF37]">
            10 ETH
          </h1>

          <p className="mt-4 text-xl text-white/70">
            3 ganadores · Participa desde 10€
          </p>

          {/* BOTÓN KICK PRO */}
          <button
            onClick={() => window.open('https://kick.com/global-lottery', '_blank')}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#53FC18]/30 bg-[#53FC18]/10 px-6 py-3 text-sm text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#53FC18]/20"
          >
            <img
              src="/kick-logo.png"
              alt="Kick"
              className="h-6 w-auto object-contain"
            />
            <span className="font-medium tracking-wide text-[#53FC18]">
              Ver sorteo en directo
            </span>
          </button>

          <button
            onClick={() => window.open(stripePaymentLink, '_blank')}
            className="mt-12 rounded-full bg-[#D4AF37] px-12 py-6 text-2xl text-black"
          >
            Participar ahora
          </button>
        </div>
      </section>

      {/* MODAL */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#111] p-8 rounded-xl w-full max-w-md">
            {!registered ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="fullName" onChange={handleChange} placeholder="Nombre" className="w-full p-3 bg-black text-white"/>
                <input name="email" onChange={handleChange} placeholder="Email" className="w-full p-3 bg-black text-white"/>
                <input name="password" onChange={handleChange} placeholder="Password" className="w-full p-3 bg-black text-white"/>
                <button className="w-full bg-[#D4AF37] p-3">Crear cuenta</button>
              </form>
            ) : (
              <div>
                Wallet: {mockAccount.wallet}
                <br />
                Ticket: {mockAccount.ticket}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}