import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Truck, Package, MapPin, AlertTriangle, FileText } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

const cards = [
  {
    icon: MapPin,
    title: 'Todo el país',
    desc: 'Realizamos envíos a cualquier provincia de Argentina a través de los transportes más confiables del mercado.',
  },
  {
    icon: Package,
    title: 'Embalaje incluido',
    desc: 'Nos encargamos de embalar y despachar tu compra hasta la puerta del transporte sin cargo adicional.',
  },
  {
    icon: Truck,
    title: 'Costo a cargo del cliente',
    desc: 'El costo del flete es abonado por el comprador. Te asesoramos sobre las opciones disponibles.',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function Envios() {
  return (
    <>
      <Helmet>
        <title>Envíos — KAP Equipamiento Comercial</title>
        <meta name="description" content="Información sobre envíos y entregas de KAP Equipamiento Comercial. Enviamos a todo el país." />
      </Helmet>

      {/* Hero */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #d4a843 0, #d4a843 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeUp(0.1)} className="flex justify-center mb-6">
            <div className="p-4 rounded-full border border-white/10" style={{ backgroundColor: 'rgba(212,168,67,0.1)' }}>
              <Truck size={32} style={{ color: '#d4a843' }} strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ backgroundColor: '#d4a843' }} />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: '#d4a843' }}>Logística</span>
            <div className="w-8 h-px" style={{ backgroundColor: '#d4a843' }} />
          </motion.div>

          <motion.h1
            {...fadeUp(0.3)}
            className="text-5xl md:text-7xl text-white mb-5"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
          >
            Envíos
          </motion.h1>

          <motion.p {...fadeUp(0.45)} className="text-white/60 text-base md:text-lg tracking-wide max-w-xl mx-auto">
            Nos encargamos de embalar y despachar tu compra
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Cards */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={cardAnim}
              className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col gap-4"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#fef3cd' }}
              >
                <Icon size={20} style={{ color: '#b8962e' }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Política */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Título sección */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px" style={{ backgroundColor: '#d4a843' }} />
            <FileText size={15} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-400">Política de Envíos</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <p>
              <span className="font-semibold text-gray-900 uppercase tracking-wide text-xs">Realizamos envíos a todo el país.</span>{' '}
              El costo del envío corre por cuenta del cliente y se abona directamente al transporte elegido.
            </p>
            <p>
              Nosotros nos encargamos de embalarlo correctamente y despacharlo hasta la puerta del transporte{' '}
              <span className="font-medium text-gray-800">sin cargo adicional</span>.
            </p>

            {/* Aviso */}
            <div
              className="flex gap-4 p-5 rounded-xl border"
              style={{ backgroundColor: '#fffbf0', borderColor: '#f0d080' }}
            >
              <AlertTriangle size={18} style={{ color: '#b8962e', flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
              <p className="text-sm" style={{ color: '#7a6020' }}>
                La empresa <span className="font-semibold">no se hace responsable</span> por daños ocasionados una vez que la mercadería está en manos del transporte. Recomendamos verificar el estado del paquete al momento de la recepción.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
