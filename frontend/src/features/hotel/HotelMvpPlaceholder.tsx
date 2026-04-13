import "./HotelMvpPlaceholder.css";

/**
 * Marcador del módulo hotelero: las pantallas y mutaciones irán contra `/v1/hotel`
 * usando el mismo paquete de contratos que el resto del BFF.
 */
export function HotelMvpPlaceholder() {
  return (
    <section
      className="hotel-placeholder"
      aria-labelledby="hotel-mvp-heading"
    >
      <h2 id="hotel-mvp-heading" className="hotel-placeholder__title">
        Gestión hotelera (MVP)
      </h2>
      <p className="hotel-placeholder__body">
        Las operaciones de habitaciones, reservas y huéspedes se integrarán aquí,
        consumiendo endpoints bajo <code>/v1/hotel</code> y tipos compartidos desde{" "}
        <code>@fichacliente/api-contracts</code>.
      </p>
    </section>
  );
}
