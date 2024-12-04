import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Celebration = () => {
  const [show, setShow] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent  z-9999">
      <Confetti width={width} height={height} />
      <div className="text-white text-6xl font-bold animate-fade-in">Celebration</div>
    </div>
  );
};

export default Celebration;
