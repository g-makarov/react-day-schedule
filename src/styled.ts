import styled, { css } from 'styled-components';

import { FontWeight } from '~/config/ui';
import { Box, Text } from '~/view/components';

export const TimeBlock = styled.div<{ isEditable?: boolean }>`
  background-color: ${props =>
    props.isEditable ? props.theme.colors.ceriseRed : props.theme.colors.shamrock};
  height: 100%;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 15px;
  z-index: ${props => (props.isEditable ? 1 : undefined)};
`;

export const ResizeBtn = styled.button.attrs({
  type: 'button',
})<{ top?: boolean; bottom?: boolean }>`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background-color: ${props => props.theme.colors.ceriseRed};
  width: 15px;
  height: 15px;
  border: 2px solid ${props => props.theme.colors.white};
  box-sizing: border-box;
  border-radius: 50%;
  padding: 0;

  ${props =>
    props.top &&
    css`
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `};

  ${props =>
    props.bottom &&
    css`
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
    `};
`;

export const TimeText = styled(Text).attrs(({ theme }) => ({
  color: theme.colors.white,
  fontWeight: 500,
}))``;

export const EventsList = styled.div`
  position: absolute;
  top: 0;
  left: 50px;
  right: 0;
  bottom: 0;
`;

export const Row = styled.div`
  height: 50px;
  display: flex;
`;

export const Wrapper = styled.div`
  height: 50vh;
  overflow-y: scroll;
  padding: 10px 16px;
  margin-top: 20px;
`;

export const Container = styled.div`
  position: relative;
  user-select: none;
`;

export const NoAvailable = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NoAvailableText = styled.p`
  font-size: 16px;
  font-weight: ${FontWeight.MEDIUM};
`;

export const HalfHourDelimeter = styled(Box)`
  background-color: ${props => props.theme.colors.whiteLilac};
  height: 1px;
`;

export const Time = styled(Text)`
  width: 40px;
  text-align: right;
  margin-right: 10px;
  margin-top: -10px;
`;

export const HourBody = styled.div`
  display: flex;
  border-top: 1px solid ${props => props.theme.colors.athensGray};
  flex: 1;
  align-items: center;
`;

export const BusinessInterval = styled.div`
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  border-color: ${props => props.theme.colors.whiteLilac};
  border-top-style: solid;
`;
