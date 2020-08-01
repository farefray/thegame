import React from 'react';
import Timer from './Timer.jsx';
import { useStoreState } from 'easy-peasy';
import { Steps } from 'rsuite';
import SvgIcons, { ICON_NAMES } from 'components/SvgIcons';

const styles = {
  display: 'inline-table',
  verticalAlign: 'top'
};

function GameSteps() {
  const { countdown, gamePhase, tradingPlayer } = useStoreState((state) => state.app)

  return (
    <div className="gamesteps">
      <Steps current={gamePhase} vertical style={styles}>
        <Steps.Item title="Cards play" icon={SvgIcons(ICON_NAMES.CARDS_RANDOM, '2x')} />
        <Steps.Item title="Battle" icon={SvgIcons(ICON_NAMES.SWORDS, '2x')} />
        <Steps.Item title="Trade" icon={SvgIcons(ICON_NAMES.TRADE, '2x')}/>
      </Steps>
      {tradingPlayer ? (<div className="tradingPlayer">{tradingPlayer}</div>) : ''}

      <Timer initialTimerValue={countdown} />
    </div>
  );
}

export default GameSteps;
