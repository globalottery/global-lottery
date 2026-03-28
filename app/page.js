'use client';

import { useEffect, useMemo, useState } from 'react';

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
  const headers = ['id', 'fullName', 'email', 'password', 'wallet', 'ticket', 'createdAt', 'verified', 'paymentStatus'];
  const rows = users.map((user) =>
    headers
      .map((header) => `"${String(user[header] ?? '').replace(/"/g, '""')}"`)
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
  const [activeSection, setActiveSection] = useState('cuenta');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [mockAccount, setMockAccount] = useState({
    fullName: '',
    wallet: '',
    ticket: '',
    email: '',
    paymentStatus: 'Pendiente de pago',
  });

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setMockAccount(JSON.parse(saved));
      setRegistered(true);
    }
  }, []);

  const mockVerificationCode = useMemo(() => {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }, [registered]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      fullName: formData.fullName,
      email: formData.email,
      wallet: generateMockWallet(),
      ticket: generateMockTicket(),
      paymentStatus: 'Pendiente de pago',
    };

    localStorage.setItem('user', JSON.stringify(newUser));
    setMockAccount(newUser);
    setRegistered(true);
    setShowRegister(false);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setRegistered(false);
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-black text-white">
        
        {/* HEADER */}
        <header className="border-b border-white/10 p-6 flex justify-between">
          <div>GLOBAL LOTTERY</div>

          <div className="flex gap-4">
            <button onClick={() => setActiveSection('cuenta')}>Mi cuenta</button>
            <button onClick={() => setActiveSection('participacion')}>Mi participación</button>
            <button onClick={() => setActiveSection('pago')}>Pagar</button>
            <button onClick={() => window.open('https://kick.com/global-lottery', '_blank')}>
              Kick
            </button>
            <button onClick={logout}>Cerrar</button>
          </div>
        </header>

        {/* CONTENIDO */}
        <div className="p-10 text-center">
          <h2 className="text-4xl mb-6">Bienvenido {mockAccount.fullName}</h2>
          <p>Wallet: {mockAccount.wallet}</p>
          <p>Ticket: {mockAccount.ticket}</p>
          <p>Estado: {mockAccount.paymentStatus}</p>

          <button
            onClick={() => window.open(stripePaymentLink, '_blank')}
            className="mt-6 bg-[#D4AF37] px-6 py-3 text-black rounded"
          >
            Pagar ahora
          </button>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-white/10 px-6 py-12 text-sm text-white/50 mt-20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="text-white">
              GLOBAL LOTTERY © 2026
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-white/60">

              <a href="/aviso-legal" className="hover:text-white transition">
                Aviso legal
              </a>

              <a href="/privacidad" className="hover:text-white transition">
                Privacidad
              </a>

              <a href="/terminos" className="hover:text-white transition">
                Términos
              </a>

              <a href="mailto:info@global-lottery.com" className="hover:text-white transition">
                Contacto
              </a>

            </div>

            <div className="text-white/60">
              Kick: global-lottery
            </div>

          </div>
        </footer>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white text-center">

      <button onClick={() => setShowRegister(true)} className="m-6 bg-[#D4AF37] px-4 py-2 text-black">
        Crear cuenta
      </button>

      <h1 className="text-6xl mt-20">10 ETH</h1>

      {showRegister && (
        <form onSubmit={handleSubmit} className="mt-10">
          <input name="fullName" placeholder="Nombre" onChange={(e)=>setFormData({...formData, fullName:e.target.value})} />
          <input name="email" placeholder="Email" onChange={(e)=>setFormData({...formData, email:e.target.value})} />
          <input name="password" placeholder="Password" onChange={(e)=>setFormData({...formData, password:e.target.value})} />
          <button>Crear cuenta</button>
        </form>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-12 text-sm text-white/50 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="text-white">
            GLOBAL LOTTERY © 2026
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/60">

            <a href="/aviso-legal" className="hover:text-white transition">
              Aviso legal
            </a>

            <a href="/privacidad" className="hover:text-white transition">
              Privacidad
            </a>

            <a href="/terminos" className="hover:text-white transition">
              Términos
            </a>

            <a href="mailto:info@global-lottery.com" className="hover:text-white transition">
              Contacto
            </a>

          </div>

          <div className="text-white/60">
            Kick: global-lottery
          </div>

        </div>
      </footer>

    </div>
  );
}