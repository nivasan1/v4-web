import { useDispatch } from 'react-redux';
import styled, { AnyStyledComponent } from 'styled-components';

import { DialogTypes } from '@/constants/dialogs';
import { STRING_KEYS } from '@/constants/localization';

import { useStringGetter, useURLConfigs } from '@/hooks';

import { IconButton } from '@/components/IconButton';
import { Link } from '@/components/Link';
import { Panel } from '@/components/Panel';

import { openDialog } from '@/state/dialogs';

export const StakingPanel = ({ className }: { className?: string }) => {
  const stringGetter = useStringGetter();
  const dispatch = useDispatch();
  const { stakingLearnMore } = useURLConfigs();

  return (
    <Styled.Panel
      className={className}
      slotHeaderContent={
        <Styled.Header>
          <Styled.Title>{stringGetter({ key: STRING_KEYS.STAKE_WITH_KEPLR })}</Styled.Title>
          <Styled.Img src="/third-party/keplr.png" alt={stringGetter({ key: STRING_KEYS.KEPLR })} />
        </Styled.Header>
      }
      onClick={() => dispatch(openDialog({ type: DialogTypes.ExternalNavKeplr }))}
    >
      <Styled.Description>
        {stringGetter({ key: STRING_KEYS.STAKING_DESCRIPTION })}
        <Link href={stakingLearnMore} onClick={(e) => e.stopPropagation()}>
          {stringGetter({ key: STRING_KEYS.LEARN_MORE })} →
        </Link>
      </Styled.Description>
    </Styled.Panel>
  );
};

const Styled: Record<string, AnyStyledComponent> = {};

Styled.Panel = styled(Panel)`
  align-items: start;

  header {
    justify-content: unset;
    padding-bottom: 0;
  }
`;

Styled.Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

Styled.Title = styled.h3`
  font: var(--font-medium-book);
  color: var(--color-text-2);
`;

Styled.Img = styled.img`
  width: 2rem;
  height: 2rem;
  margin-left: 0.5rem;
`;

Styled.Description = styled.div`
  color: var(--color-text-0);
  --link-color: var(--color-text-1);

  a {
    display: inline;
    ::before {
      content: ' ';
    }
  }
`;

Styled.IconButton = styled(IconButton)`
  color: var(--color-text-0);
  --color-border: var(--color-layer-6);
`;
