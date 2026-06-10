import React from 'react';
import FuzzyText from './FuzzyText';

const EmptyText = ({ hoverIntensity = 0.5, enableHover = true }) => {
  return (
    <FuzzyText 
      baseIntensity={0.2} 
      hoverIntensity={hoverIntensity} 
      enableHover={enableHover}
    >
      Nothing to show
    </FuzzyText>
  );
};

export default EmptyText;
