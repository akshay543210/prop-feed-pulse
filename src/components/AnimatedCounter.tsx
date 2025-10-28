import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedCounter = ({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <span ref={ref} className={className}>
      {inView && (
        <CountUp
          end={end}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          separator=","
        />
      )}
    </span>
  );
};

export default AnimatedCounter;
