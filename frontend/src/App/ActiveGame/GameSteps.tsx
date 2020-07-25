import React from 'react';
import Timer from './Timer.jsx';
import { useStoreState } from 'easy-peasy';
import { Steps } from 'rsuite';
import SvgIcons, { ICON_NAME } from '@/components/SvgIcons';

const styles = {
  width: '200px',
  display: 'inline-table',
  verticalAlign: 'top'
};

function GameSteps() {
  const { countdown, gamePhase, tradingPlayer } = useStoreState((state) => state.app)

  return (
    <div>
      <Steps current={gamePhase} vertical style={styles}>
        <Steps.Item title="Cards play" icon={SvgIcons(ICON_NAME.CARDS_RANDOM, '2x')} />
        <Steps.Item title="Battle" icon={SvgIcons(ICON_NAME.SWORDS, '2x')} />
        <Steps.Item title="Trade" description={tradingPlayer} icon={SvgIcons(ICON_NAME.TRADE, '2x')} />
      </Steps>

      <Timer initialTimerValue={countdown} />
    </div>
  );
}

export default GameSteps;
