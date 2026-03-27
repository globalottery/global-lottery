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
            <div className="leading-none">
              <span className="text-[88px] font-black tracking-[-0.08em] text-[#D4AF37] drop-shadow-[0_0_25px_rgba(212,175,55,0.25)] md:text-[128px]">
                GL
              </span>
            </div>
            <div className="-mt-2 text-[24px] font-semibold tracking-[0.22em] text-white/92 md:text-[34px]">
              GLOBAL LOTTERY
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.6em] text-[#D4AF37] md:text-[13px]">
              Since 2026
            </div>
          </div>

          <h1 className="relative text-6xl font-semibold leading-tight tracking-[0.04em] md:text-8xl">
            <span className="absolute inset-0 animate-pulse select-none blur-2xl text-[#D4AF37]/35">
              10 ETH
            </span>
            <span className="relative bg-gradient-to-b from-[#FFF1B8] via-[#D4AF37] to-[#8C6A12] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(212,175,55,0.45)]">
              10 ETH
            </span>
          </h1>

          <p className="mt-4 text-xl text-white/70">
            3 ganadores · Participa desde 10€
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#53FC18] text-[11px] font-black text-black shadow-[0_0_18px_rgba(83,252,24,0.45)]">
              K
            </span>
            <span>Sorteo en directo en Kick</span>
          </div>

          <button
            onClick={() => window.open(stripePaymentLink, '_blank')}
            className="mt-12 rounded-full bg-[#D4AF37] px-12 py-6 text-2xl font-semibold tracking-[0.04em] text-black transition hover:scale-105"
          >
            Participar ahora
          </button>

          <p className="mt-6 text-sm text-white/50">
            Pago seguro con tarjeta a través de Stripe.
          </p>
        </div>
      </section>
<section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-16 text-center text-4xl font-semibold tracking-[0.06em] md:text-5xl">
          3 ganadores. 10 ETH.
        </h2>

        <div className="grid gap-8 text-center md:grid-cols-3">
          <div className="rounded-3xl border border-[#D4AF37] bg-[#D4AF37]/10 p-10">
            <div className="text-sm text-white/60">1º PREMIO</div>
            <div className="mt-4 text-5xl text-[#D4AF37]">6 ETH</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
            <div className="text-sm text-white/60">2º PREMIO</div>
            <div className="mt-4 text-5xl text-[#D4AF37]">3 ETH</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
            <div className="text-sm text-white/60">3º PREMIO</div>
            <div className="mt-4 text-5xl text-[#D4AF37]">1 ETH</div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <h2 className="text-5xl">¿Qué harías con 6 ETH?</h2>
        <p className="mt-6 text-white/70">
          Viajar, invertir, dejar tu trabajo... Todo empieza con una decisión.
        </p>
      </section>

      <section className="px-6 py-32 text-center">
        <h2 className="text-6xl">10€ pueden cambiar tu vida</h2>
        <button className="mt-10 bg-[#D4AF37] px-10 py-4 text-black rounded-full">
          Entrar ahora
        </button>
      </section>

    </div>
  );
}