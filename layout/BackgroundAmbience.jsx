import { useTheme } from "../ThemeProvider";

export default function BackgroundAmbience() {
  const { theme } = useTheme();
  
  if (theme !== "dark") return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: `
          radial-gradient(ellipse 800px 300px at 20% 30%, rgba(236, 44, 163, 0.04) 0%, transparent 40%),
          radial-gradient(ellipse 600px 250px at 80% 20%, rgba(14, 165, 233, 0.04) 0%, transparent 35%),
          radial-gradient(ellipse 700px 350px at 50% 100%, rgba(124, 58, 237, 0.04) 0%, transparent 45%)
        `,
        animation: "ambient-drift 24s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes ambient-drift {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.5;
          }
          25% {
            transform: translate(20px, -15px);
            opacity: 0.6;
          }
          50% {
            transform: translate(-10px, 20px);
            opacity: 0.5;
          }
          75% {
            transform: translate(15px, -10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}