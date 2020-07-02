import React from 'react';
import UnitImage from '@/objects/Unit/UnitImage';
import { Icon } from 'rsuite';

/**
 *
 * TODO framer-motion animation to deck
 * todo icon set - http://nagoshiashumari.github.io/Rpg-Awesome/
 */
function Card({card}) {
  return (
    <div className="card">
      <div className="card-frame frame">
        <div className="frame-header">
          <div className="frame-header_icon"><Icon icon='star-half-o' /></div>
          <span className="frame-header_name">{card.name}</span>
          <div className="frame-header_cost">{card.cost}</div>
        </div>

        <div className="frame-body">
          <p className="frame-body_description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatibus reprehenderit error quam, iste dicta!
          </p>
        </div>

        <div className="frame-image">
          {card.monster && <UnitImage lookType={card.monster.lookType} direction={3} isMoving={false} />}
        </div>
      </div>
    </div>
  );
}

export default Card;
