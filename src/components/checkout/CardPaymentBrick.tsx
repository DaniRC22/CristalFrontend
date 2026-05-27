import { useEffect, useRef } from 'react';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import api from '../../lib/api';

// Inferimos el tipo del parámetro onSubmit directamente del componente,
// ya que los tipos internos no se re-exportan desde el paquete.
type CardPaymentSubmitData = Parameters<Parameters<typeof CardPayment>[0]['onSubmit']>[0];

interface CardPaymentBrickProps {
  orderId: number;
  total: number;
  email: string;
  publicKey: string;
  onResult: (status: string, redirectUrls: { approved: string; rejected: string; pending: string }) => void;
  onError: (message: string) => void;
}

export default function CardPaymentBrick({
  orderId,
  total,
  email,
  publicKey,
  onResult,
  onError,
}: CardPaymentBrickProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
      initialized.current = true;
    }
  }, [publicKey]);

  const handleSubmit = async (formData: CardPaymentSubmitData) => {
    try {
      const { data } = await api.post(`/api/checkout/${orderId}/pay`, {
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        installments: formData.installments,
        issuer_id: formData.issuer_id ? parseInt(String(formData.issuer_id)) : undefined,
        payer: { email: formData.payer.email ?? email },
      });
      onResult(data.status, data.redirect_urls);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      onError(e.response?.data?.error ?? e.message ?? 'Error al procesar el pago');
    }
  };

  return (
    <CardPayment
      initialization={{ amount: total, payer: { email } }}
      onSubmit={handleSubmit}
      locale="es-AR"
      onError={(err) => onError(err.message ?? 'Error en el formulario de pago')}
    />
  );
}
