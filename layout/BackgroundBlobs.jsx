export default function BackgroundBlobs() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Pink blob — top left */}
      <div style={{
        position: "absolute", width: "700px", height: "700px",
        top: "-15%", left: "0%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,44,163,0.22) 0%, transparent 65%)",
        filter: "blur(90px)", opacity: 0.9,
        animation: "blob-float 8s ease-in-out infinite alternate",
        mixBlendMode: "screen",
      }} />

      {/* Blue blob — top right */}
      <div style={{
        position: "absolute", width: "600px", height: "600px",
        top: "-8%", right: "2%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 65%)",
        filter: "blur(90px)", opacity: 0.85,
        animation: "blob-float 10s ease-in-out infinite alternate",
        animationDelay: "2.5s",
        mixBlendMode: "screen",
      }} />

      {/* Purple blob — mid center */}
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        top: "25%", left: "38%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)",
        filter: "blur(100px)", opacity: 0.75,
        animation: "blob-float 12s ease-in-out infinite alternate",
        animationDelay: "5s",
        mixBlendMode: "screen",
      }} />

      {/* Cyan accent — bottom right */}
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        bottom: "5%", right: "10%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)",
        filter: "blur(80px)", opacity: 0.7,
        animation: "blob-float 9s ease-in-out infinite alternate",
        animationDelay: "1s",
        mixBlendMode: "screen",
      }} />

      <style>{`
        @keyframes blob-float {
          from { transform: translateX(0px) translateY(0px) scale(1); }
          to   { transform: translateX(18px) translateY(-14px) scale(1.07); }
        }
      `}</style>
    </div>
  );
}