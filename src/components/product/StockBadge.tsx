interface Props {
  stock: number;
  threshold?: number;
}

export default function StockBadge({ stock, threshold = 5 }: Props) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        Sin stock
      </span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
        Últimas {stock} unidades
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      En stock
    </span>
  );
}
