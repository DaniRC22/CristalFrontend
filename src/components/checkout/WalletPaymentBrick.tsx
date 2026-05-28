import { Wallet } from '@mercadopago/sdk-react';

interface WalletPaymentBrickProps {
  preferenceId: string;
  onError: (message: string) => void;
}

// Renderiza el botón oficial "Pagar con Mercado Pago". Al hacer click, redirige
// al checkout de MP (mismo dominio, default redirectMode='self'). En mobile, si
// el cliente tiene la app de MP instalada, el sistema operativo intercepta el
// link y abre la app vía deep-link.
//
// Nota: el SDK no ofrece un modo "modal/iframe embebido" para Wallet Brick.
// Los únicos modos son 'self' (redirect en la misma pestaña, default) y 'blank'
// (abre en pestaña nueva). El comportamiento de pago es idéntico a Checkout Pro.
export default function WalletPaymentBrick({ preferenceId, onError }: WalletPaymentBrickProps) {
  return (
    <Wallet
      initialization={{ preferenceId }}
      onError={(error) => {
        const e = error as { message?: string };
        onError(e.message ?? 'Error al iniciar el pago con Mercado Pago');
      }}
    />
  );
}
