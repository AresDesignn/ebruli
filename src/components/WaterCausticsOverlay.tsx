interface WaterCausticsOverlayProps {
  active: boolean;
}

export function WaterCausticsOverlay({ active }: WaterCausticsOverlayProps) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      <div className="water-caustics-a" />
      <div className="water-caustics-b" />
    </div>
  );
}
