import React, { useEffect } from "react";

export const Preloader: React.FC<{ onComplete?: () => void; done?: () => void }> = ({
  onComplete,
  done,
}) => {
  const handleFinish = onComplete || done || (() => {});

  useEffect(() => {
    const timer = window.setTimeout(handleFinish, 2700);
    return () => window.clearTimeout(timer);
  }, [handleFinish]);

  return (
    <div className="preloader">
      <button onClick={handleFinish}>SKIP</button>
      <div className="preloader__logo">
        <img
          src="/assets/unora.jpg"
          alt="Unora Mark"
          style={{ height: "105px", width: "105px", objectFit: "contain" }}
        />
      </div>
    </div>
  );
};