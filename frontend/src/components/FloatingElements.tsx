import React from 'react';
import { motion } from 'framer-motion';

const Shape: React.FC<{ className: string; animate: any; transition: any; initial: any; style: any }> = ({ className, style, ...props }) => (
  <motion.div
    className={`absolute ${className}`}
    style={style}
    {...props}
  />
);

const FloatingElements: React.FC = () => {
  return (
    <div className="w-full h-full absolute top-0 left-0 overflow-hidden -z-10">
      {/* Soft Sphere 1 */}
      <Shape
        className="w-48 h-48 bg-primary/10 dark:bg-primary/5 rounded-full blur-2xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: 1, scale: 1 }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        style={{ top: '10%', left: '5%' }}
      />
      
      {/* Donut Shape */}
      <Shape
        className="w-32 h-32 border-[20px] border-accent/10 dark:border-accent/5 rounded-full blur-lg"
        initial={{ opacity: 0 }}
        animate={{ y: [0, 20, 0], rotate: [0, 90, 0], opacity: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 2 }}
        style={{ top: '20%', right: '10%' }}
      />

      {/* Small Cube */}
       <Shape
        className="w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-2xl blur-sm"
        initial={{ opacity: 0 }}
        animate={{ x: [0, -15, 0], rotate: [0, -45, 0], opacity: 1 }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 5 }}
        style={{ bottom: '15%', left: '20%' }}
      />

      {/* Soft Sphere 2 */}
      <Shape
        className="w-24 h-24 bg-accent/5 dark:bg-accent/10 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{ y: [0, -15, 0], opacity: 1 }}
        transition={{ duration: 12, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1 }}
        style={{ bottom: '25%', right: '15%' }}
      />
    </div>
  );
};

export default FloatingElements;
