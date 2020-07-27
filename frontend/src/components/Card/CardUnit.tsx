import React from 'react';
import UnitImage from '@/objects/Unit/UnitImage';

export default function CardUnit({ monster }) {
  return <div className="frame-image">{monster && <UnitImage lookType={monster.lookType} direction={3} isMoving={false} extraClass={''} />}</div>;
}
