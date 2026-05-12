import { Helmet } from 'react-helmet-async';

const pillars = [
  {
    title: 'Percheros & Exhibición',
    description: '25 años acompañando a comercios con percheros, soportes y sistemas de exhibición que realzan cada producto.',
    img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
    alt: 'Percheros en local comercial',
  },
  {
    title: 'Maniquíes & Ambientación',
    description: 'Maniquíes y elementos de ambientación que dan vida a tu local y atraen la atención de cada cliente.',
    img: 'https://images.unsplash.com/photo-1637666747418-6b068b2e9633?auto=format&fit=crop&w=800&q=80',
    alt: 'Maniquí ambientado en local',
  },
  {
    title: 'Mostradores & Showroom',
    description: 'Mostradores, vitrinas y muebles de showroom diseñados para lucir tu mercadería con estilo y funcionalidad.',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    alt: 'Mostradores y showroom comercial',
  },
];

export default function Nosotros() {
  return (
    <>
      <Helmet>
        <title>Nosotros — KAP Equipamiento Comercial</title>
        <meta
          name="description"
          content="Somos una empresa familiar con 25 años de experiencia en equipamiento comercial. Conocé nuestra historia y compromiso con la calidad."
        />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1705951495433-fe1de7c30d33?auto=format&fit=crop&w=1920&q=80"
          alt="Maniquíes en local comercial"
          className="absolute inset-0 w-full h-full object-cover animate-zoom"
          loading="eager"
          fetchPriority="high"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/80" />

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto animate-slideUp">
          <span
            className="block mb-5 text-xs font-semibold uppercase tracking-[0.35em]"
            style={{ color: '#d4a843' }}
          >
            Empresa Familiar · Desde 2000
          </span>

          <h1 className="text-5xl md:text-7xl mb-6 text-white" style={{ fontWeight: 300 }}>
            Sobre Nosotros
          </h1>

          <div className="mx-auto mb-8 h-px w-20" style={{ backgroundColor: '#d4a843' }} />

          <p className="mx-auto max-w-2xl text-lg md:text-2xl leading-relaxed text-white/90" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            Somos una empresa familiar, con{' '}
            <strong className="font-semibold text-white">25 años de experiencia</strong> en el
            rubro. Estamos dispuestos a ofrecer los{' '}
            <strong className="font-semibold text-white">mejores productos</strong> a nuestros
            clientes.
          </p>
        </div>

        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats bar ── */}
      <section style={{ backgroundColor: '#1a1a1a' }} className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3 text-center">
            {[
              { value: '25', label: 'Años de experiencia' },
              { value: '100%', label: 'Empresa familiar' },
              { value: '★★★★★', label: 'Calidad garantizada' },
            ].map(({ value, label }) => (
              <div key={label}>
                <dd
                  className="text-5xl mb-2"
                  style={{ color: '#d4a843', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
                >
                  {value}
                </dd>
                <dt className="text-xs uppercase tracking-widest text-gray-400">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 300 }}>
            Nuestro Compromiso
          </h2>
          <div className="mx-auto mb-14 h-px w-16" style={{ backgroundColor: '#d4a843' }} />

          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map(({ title, description, img, alt }) => (
              <article
                key={title}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {img ? (
                    <>
                      <img
                        src={img}
                        alt={alt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs tracking-wide">Tu foto aquí</span>
                    </div>
                  )}
                </div>
                <div className="p-7">
                  <h3
                    className="text-2xl mb-3 text-gray-900"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400 }}
                  >
                    {title}
                  </h3>
                  <div className="mb-4 h-px w-10" style={{ backgroundColor: '#d4a843' }} />
                  <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full-width closing image strip ── */}
      <section className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1920&q=80"
          alt="Showroom de equipamiento comercial"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <p
            className="text-white text-center text-2xl md:text-3xl px-6"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, letterSpacing: '0.05em' }}
          >
            Tu negocio merece lo mejor — y nosotros estamos aquí para dártelo.
          </p>
        </div>
      </section>
    </>
  );
}
