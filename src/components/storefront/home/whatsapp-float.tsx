function buildWhatsAppHref(number: string, message: string) {
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${params}`;
}

export function WhatsAppFloat({
  enabled,
  number,
  message,
}: {
  enabled: boolean;
  number: string;
  message: string;
}) {
  if (!enabled || !number) return null;

  return (
    <a
      href={buildWhatsAppHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex size-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-b from-[#5AD671] to-[#128C7E] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.87.502 3.626 1.377 5.13L2 22l4.977-1.354a9.964 9.964 0 0 0 5.027 1.352h.004c5.518 0 10.004-4.486 10.004-10.004S17.522 2 12.004 2zm0 18.166a8.14 8.14 0 0 1-4.148-1.134l-.297-.176-3.043.828.81-2.966-.194-.304a8.14 8.14 0 0 1-1.245-4.406c0-4.5 3.662-8.162 8.166-8.162 2.18 0 4.229.85 5.77 2.393a8.11 8.11 0 0 1 2.393 5.774c0 4.5-3.662 8.147-8.212 8.147z" />
      </svg>
    </a>
  );
}
