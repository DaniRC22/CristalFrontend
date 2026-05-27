import { CardPayment } from '@mercadopago/sdk-react';
import api from '../../lib/api';

// Inferimos el tipo del parámetro onSubmit directamente del componente,
// ya que los tipos internos no se re-exportan desde el paquete.
type CardPaymentSubmitData = Parameters<Parameters<typeof CardPayment>[0]['onSubmit']>[0];

interface CardPaymentBrickProps {
  orderId: number;
  total: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onResult: (status: string, redirectUrls: { approved: string; rejected: string; pending: string }) => void;
  onError: (message: string) => void;
}

export default function CardPaymentBrick({
  orderId,
  total,
  email,
  firstName,
  lastName,
  phone,
  onResult,
  onError,
}: CardPaymentBrickProps) {
  const handleSubmit = async (formData: CardPaymentSubmitData) => {
    try {
      const ident = (formData.payer as { identification?: { type?: string; number?: string } }).identification;
      const { data } = await api.post(`/api/checkout/${orderId}/pay`, {
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        installments: formData.installments,
        issuer_id: formData.issuer_id ? parseInt(String(formData.issuer_id)) : undefined,
        payer: {
          email: formData.payer.email ?? email,
          first_name: firstName,
          last_name: lastName,
          phone,
          ...(ident?.type && ident.number && {
            identification: { type: ident.type, number: ident.number },
          }),
        },
      });
      onResult(data.status, data.redirect_urls);
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: {
            error?: string;
            causes?: Array<{ code?: string | number; description?: string }>;
          };
        };
        message?: string;
      };
      const causeText = e.response?.data?.causes?.length
        ? ' (' + e.response.data.causes.map((c) => c.description ?? c.code).join(', ') + ')'
        : '';
      onError((e.response?.data?.error ?? e.message ?? 'Error al procesar el pago') + causeText);
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
