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
  const [activeSection, setActiveSection] = useState('cuenta');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [mockAccount, setMockAccount] = useState({
    id: '',
    fullName: '',
    wallet: '',
    ticket: '',
    email: '',
    createdAt: '',
    paymentStatus: 'Pendiente de pago',
  });

  useEffect(() => {
    const savedSession = window.localStorage.getItem('globalLotteryCurrentUser');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setMockAccount(parsed);
      setRegistered(true);
    }
  }, []);

  const mockVerificationCode = useMemo(() => {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }, [registered]);

  const openRegister = () => {
    setShowRegister(true);
    setFormData({ fullName: '', email: '', password: '' });
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
      paymentStatus: 'Pendiente de pago',
    };

    const existingUsers = JSON.parse(window.localStorage.getItem('globalLotteryUsers') || '[]');
    const updatedUsers = [...existingUsers, newUser];

    window.localStorage.setItem('globalLotteryUsers', JSON.stringify(updatedUsers));
    window.localStorage.setItem('globalLotteryCurrentUser', JSON.stringify(newUser));
    downloadCsv(updatedUsers);

    setMockAccount(newUser);
    setRegistered(true);
    setShowRegister(false);
    setActiveSection('cuenta');
  };

  const handleLogout = () => {
    window.localStorage.removeItem('globalLotteryCurrentUser');
    setRegistered(false);
    setActiveSection('cuenta');
    setMockAccount({
      id: '',
      fullName: '',
      wallet: '',
      ticket: '',
      email: '',
      createdAt: '',
      paymentStatus: 'Pendiente de pago',
    });
  };

  const renderPrivateContent = () => {
    if (activeSection === 'participacion') {
      return (
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Mi participación</div>
            <h2 className="mt-4 text-4xl text-white">Tu acceso al sorteo</h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-sm text-white/45">Número de sorteo</div>
                <div className="mt-3 text-3xl font-semibold text-[#D4AF37]">{mockAccount.ticket}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-sm text-white/45">Estado</div>
                <div className="mt-3 text-2xl font-semibold text-white">{mockAccount.paymentStatus}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'pago') {
      return (
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <div className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Pago</div>
            <h2 className="mt-4 text-4xl text-white">Completa tu participación</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/65">
              Ya tienes tu cuenta creada y tu número asignado. Solo falta completar el pago para activar tu participación en el sorteo.
            </p>

            <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/10 bg-black/30 p-6 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/50">Importe</span>
                <span className="text-2xl text-[#D4AF37]">10€</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-white/50">Estado actual</span>
                <span className="text-white">{mockAccount.paymentStatus}</span>
              </div>
            </div>

            <button
              onClick={() => window.open(stripePaymentLink, '_blank')}
              className="mt-10 rounded-full bg-[#D4AF37] px-12 py-5 text-xl font-semibold text-black transition hover:scale-105"
            >
              Pagar ahora
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Mi cuenta</div>
          <h2 className="mt-4 text-4xl text-white">
            Bienvenido, {mockAccount.fullName || 'Usuario'}
          </h2>
          <p className="mt-4 max-w-2xl text-white/65">
            Tu cuenta ha sido creada correctamente. Ya tienes tu wallet asignada y tu número de sorteo reservado.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm text-white/45">Correo electrónico</div>
              <div className="mt-3 text-lg text-white">{mockAccount.email}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm text-white/45">Código de validación</div>
              <div className="mt-3 text-2xl font-semibold text-[#D4AF37]">{mockVerificationCode}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6 md:col-span-2">
              <div className="text-sm text-white/45">Wallet asignada</div>
              <div className="mt-3 break-all text-base text-white">{mockAccount.wallet}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm text-white/45">Número de sorteo</div>
              <div className="mt-3 text-3xl font-semibold text-[#D4AF37]">{mockAccount.ticket}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm text-white/45">Estado del pago</div>
              <div className="mt-3 text-2xl font-semibold text-white">{mockAccount.paymentStatus}</div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveSection('pago')}
              className="rounded-full bg-[#D4AF37] px-8 py-4 font-semibold text-black transition hover:scale-105"
            >
              Pagar ahora
            </button>

            <button
              onClick={() => window.open('https://kick.com/global-lottery', '_blank')}
              className="rounded-full border border-[#53FC18]/30 bg-[#53FC18]/10 px-8 py-4 font-semibold text-[#53FC18] transition hover:scale-105 hover:bg-[#53FC18]/20"
            >
              Ver sorteo en Kick
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FooterLegal = () => (
    <footer className="border-t border-white/10 px-6 py-12 text-sm text-white/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-white">
          GLOBAL LOTTERY © 2026
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-white/60">
          <a href="/aviso-legal" className="transition hover:text-white">
            Aviso legal
          </a>

          <a href="/privacidad" className="transition hover:text-white">
            Privacidad
          </a>

          <a href="/terminos" className="transition hover:text-white">
            Términos
          </a>

          <a href="mailto:info@global-lottery.com" className="transition hover:text-white">
            Contacto
          </a>
        </div>

        <div className="text-white/60">
          Kick: global-lottery
        </div>
      </div>
    </footer>
  );

  if (registered) {
    return (
      <div className="min-h-screen bg-black text-white [font-family:Georgia,'Times_New_Roman',serif]">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black tracking-[-0.08em] text-[#D4AF37] md:text-4xl">GL</div>
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-white/45">GLOBAL LOTTERY</div>
                <div className="text-xs text-white/45">Zona privada</div>
              </div>
            </div>

            <nav className="hidden items-center gap-3 lg:flex">
              <button
                onClick={() => setActiveSection('cuenta')}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  activeSection === 'cuenta'
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 text-white/75 hover:bg-white/10'
                }`}
              >
                Mi cuenta
              </button>

              <button
                onClick={() => setActiveSection('participacion')}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  activeSection === 'participacion'
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 text-white/75 hover:bg-white/10'
                }`}
              >
                Mi participación
              </button>

              <button
                onClick={() => setActiveSection('pago')}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  activeSection === 'pago'
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 text-white/75 hover:bg-white/10'
                }`}
              >
                Pagar ahora
              </button>

              <button
                onClick={() => window.open('https://kick.com/global-lottery', '_blank')}
                className="rounded-full border border-[#53FC18]/30 bg-[#53FC18]/10 px-5 py-2 text-sm text-[#53FC18] transition hover:bg-[#53FC18]/20"
              >
                Ver sorteo en Kick
              </button>

              <button
                onClick={handleLogout}
                className="rounded-full bg-white/5 px-5 py-2 text-sm text-white/75 transition hover:bg-white/10"
              >
                Cerrar sesión
              </button>
            </nav>
          </div>
        </header>

        {renderPrivateContent()}
        <FooterLegal />
      </div>
    );
  }

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
        <h2 className="mb-12 text-5xl">Cómo funciona</h2>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 text-2xl text-[#D4AF37]">1</div>
            <h3 className="mb-3 text-xl text-white">Crea tu cuenta</h3>
            <p className="text-white/70">
              Regístrate en GLOBAL LOTTERY en menos de un minuto y accede a tu zona privada.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 text-2xl text-[#D4AF37]">2</div>
            <h3 className="mb-3 text-xl text-white">Activa tu participación</h3>
            <p className="text-white/70">
              Completa el pago para confirmar tu acceso al sorteo y bloquear tu número asignado.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 text-2xl text-[#D4AF37]">3</div>
            <h3 className="mb-3 text-xl text-white">Sigue el sorteo en directo</h3>
            <p className="text-white/70">
              Los ganadores se anunciarán en nuestra cuenta oficial de Kick.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <h2 className="text-5xl">¿Qué harías con 6 ETH?</h2>
        <p className="mt-6 text-white/70">
          Viajar, invertir, dejar tu trabajo... Todo empieza con una decisión.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <h2 className="mb-12 text-center text-5xl">Preguntas frecuentes</h2>

        <div className="space-y-8 text-left">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white">¿Cuánto cuesta participar?</h3>
            <p className="mt-3 text-white/70">
              Participar cuesta 10€.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white">¿Cuántos ganadores habrá?</h3>
            <p className="mt-3 text-white/70">
              Habrá 3 ganadores: 1º premio 6 ETH, 2º premio 3 ETH y 3º premio 1 ETH.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white">¿Dónde se anunciarán los ganadores?</h3>
            <p className="mt-3 text-white/70">
              El sorteo se realizará en directo en nuestra cuenta oficial de Kick.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white">¿Cuántas participaciones puede tener cada usuario?</h3>
            <p className="mt-3 text-white/70">
              Cada usuario podrá tener una única participación.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white">¿Qué ocurre después de crear mi cuenta?</h3>
            <p className="mt-3 text-white/70">
              Accederás a tu zona privada, donde verás tu wallet asignada, tu número de sorteo y el estado de tu pago.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white">¿Qué pasa si todavía no he pagado?</h3>
            <p className="mt-3 text-white/70">
              Tu estado aparecerá como pendiente de pago hasta completar tu participación.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-32 text-center">
        <h2 className="text-6xl">10€ pueden cambiar tu vida</h2>
        <button
          onClick={() => window.open(stripePaymentLink, '_blank')}
          className="mt-10 rounded-full bg-[#D4AF37] px-10 py-4 text-black"
        >
          Entrar ahora
        </button>
      </section>

      <FooterLegal />

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111111] p-8 text-left shadow-2xl shadow-black/50">
            <div className="mb-6 text-center">
              <h3 className="text-3xl font-semibold tracking-[0.05em] text-white">Crear cuenta</h3>
              <p className="mt-2 text-sm text-white/55">
                Regístrate para acceder a tu zona privada.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                placeholder="Nombre completo"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder-white/35 outline-none focus:border-[#D4AF37]"
                required
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Correo electrónico"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder-white/35 outline-none focus:border-[#D4AF37]"
                required
              />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Contraseña"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder-white/35 outline-none focus:border-[#D4AF37]"
                required
              />

              <button
                type="submit"
                className="w-full rounded-full bg-[#D4AF37] px-6 py-4 font-semibold tracking-[0.04em] text-black transition hover:scale-[1.02]"
              >
                Crear cuenta
              </button>
            </form>

            <button
              onClick={() => setShowRegister(false)}
              className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/70 transition hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}