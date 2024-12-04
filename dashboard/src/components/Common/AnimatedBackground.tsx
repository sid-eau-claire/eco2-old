// ChangingBackground.js
import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ChangingBackground = ({ children, className, colors }: { children: React.ReactNode, className: string, colors: string[] }) => {
  const primary = useMotionValue(colors[0]); // Initial RGB values
  // Transform the motion value into a CSS gradient
  const background = useTransform(primary, value => `linear-gradient(to bottom right, rgb(${value}), rgb(${colors[colors.length - 1]}))`);

  useEffect(() => {
    let index = 0;
    const changeColor = () => {
      animate(primary, colors[index % colors.length], { duration: 2, ease: "linear" });
      index++;
      setTimeout(changeColor, 3000);
    };
    changeColor();
    return () => primary.stop();
  }, [primary, colors]);

  return (
    <motion.div
      className={className}
      style={{ background }}
    >
      {children}
    </motion.div>
  );
};

export default ChangingBackground;