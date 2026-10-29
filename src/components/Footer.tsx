export default function Footer() {
  return (
    <footer className="relative border-t border-cream/10 bg-ink px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-4xl tracking-[0.3em] text-champagne">
            AUR<span className="text-gold">U</span>M
          </p>
          <p className="mt-4 max-w-sm text-sm text-cream/55">
            Spa & Wellness. Rituales termales, suites privadas y hammam imperial en el corazón de la ciudad.
          </p>
        </div>
        <div className="text-sm text-cream/60">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gold">Horario</p>
          <p>Lunes – Domingo</p>
          <p>09:00 – 21:00</p>
        </div>
        <div className="text-sm text-cream/60">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gold">Contacto</p>
          <p>hola@aurumspa.com</p>
          <p>+34 900 000 000</p>
          <a href="/admin" className="mt-4 inline-block text-xs text-cream/30 hover:text-gold">
            Panel de reservas →
          </a>
        </div>
      </div>
      <p className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] text-cream/30">
        © {new Date().getFullYear()} Aurum Spa · Maqueta MVP
      </p>
    </footer>
  );
}
