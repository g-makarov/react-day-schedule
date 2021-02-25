import differenceInMinutes from 'date-fns/differenceInMinutes';
import formatDate from 'date-fns/format';
import * as React from 'react';
import {
  HandleComponent,
  HandleStyles,
  Position,
  ResizeEnable,
  Rnd,
  RndDragCallback,
  RndResizeCallback,
} from 'react-rnd';

import { DateInterval } from '~/types';

import { ResizeBtn, TimeBlock, TimeText } from './styled';
import { EventData } from './types';
import {
  getPositionByDate,
  getTimeSlotHeight,
  moveTimeByPosition,
  normalizePositionToStep,
  ROW_HEIGHT,
  STEP_HEIGHT,
} from './utils';

interface Props {
  event: EventData;
  onTimeChange: (time: DateInterval) => void;
  isTimeSlotFree: (time: DateInterval) => boolean;
  editable?: boolean;
  viewport: Nullable<HTMLElement>;
}

const enableResizing: ResizeEnable = {
  bottom: false,
  bottomLeft: false,
  bottomRight: false,
  left: false,
  right: false,
  top: false,
  topLeft: false,
  topRight: false,
};

const resizeHandleComponent: HandleComponent = {
  top: <ResizeBtn top />,
  bottom: <ResizeBtn bottom />,
};

const resizeHandleStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const resizeHandleStyles: HandleStyles = {
  top: {
    ...resizeHandleStyle,
    top: 0,
    right: 15,
    transform: 'translateY(-50%)',
    left: undefined,
  },
  bottom: {
    ...resizeHandleStyle,
    bottom: 0,
    left: 15,
    transform: 'translateY(50%)',
  },
};

const VIEWPORT_PADDINGS = 20;

export const Event: React.FC<Props> = React.memo(
  ({ event, onTimeChange, editable, isTimeSlotFree, viewport }) => {
    const eventTime = React.useMemo(() => {
      return { start: event.start, end: event.end };
    }, [event.start, event.end]);

    const [time, setTime] = React.useState<DateInterval>(eventTime);

    const initialPosition = React.useMemo(() => getPositionByDate(eventTime.start), []);
    const initialHeight = React.useMemo(() => getTimeSlotHeight(eventTime), []);
    const [position, setPosition] = React.useState<Position>({ x: 0, y: initialPosition });
    const [height, setHeight] = React.useState(initialHeight);

    React.useEffect(() => {
      setTime(eventTime);
      setPosition({ x: 0, y: getPositionByDate(eventTime.start) });
      setHeight(getTimeSlotHeight(eventTime));
    }, [eventTime]);

    const notEditableStyle = React.useMemo<React.CSSProperties>(() => {
      if (editable) {
        return {};
      }
      return {
        position: 'absolute',
        top: `${initialPosition}px`,
        height: `${initialHeight}px`,
      };
    }, [editable, initialHeight, initialPosition]);

    const period = React.useMemo(
      () => `${formatDate(time.start, "h:mm aaaaa'm'")} - ${formatDate(time.end, "h:mm aaaaa'm'")}`,
      [time],
    );

    const duration = React.useMemo(() => {
      const difference = differenceInMinutes(time.end, time.start);
      const hours = Math.floor(difference / 60);
      const minutes = difference % 60;

      if (minutes > 0) {
        return `${hours} hr ${minutes} min`;
      }

      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }, [time]);

    const handleStop = React.useCallback(() => {
      if (isTimeSlotFree(time)) {
        onTimeChange(time);
      } else {
        setHeight(getTimeSlotHeight(eventTime));
        setPosition({ x: 0, y: getPositionByDate(eventTime.start) });
        setTime(eventTime);
      }
    }, [isTimeSlotFree, time, onTimeChange, eventTime]);

    const handleResize = React.useCallback<RndResizeCallback>(
      (e, direction, element, delta, position) => {
        const height = normalizePositionToStep(element.offsetHeight);
        const pos = normalizePositionToStep(position.y);
        setTime(time => moveTimeByPosition(time, pos, height));
        setPosition({ x: 0, y: pos });
        setHeight(height);
      },
      [],
    );

    const handleDrag = React.useCallback<RndDragCallback>(
      (e, data) => {
        const pos = normalizePositionToStep(data.y);
        if (viewport) {
          const start = viewport.scrollTop;
          const end = start + viewport.offsetHeight;
          if (data.y < start) {
            viewport.scrollTop = data.y;
          } else if (data.y + height + VIEWPORT_PADDINGS > end) {
            viewport.scrollTop = data.y + height + VIEWPORT_PADDINGS - viewport.offsetHeight;
          }
        }
        setPosition({ x: 0, y: pos });
        if (data.deltaY !== 0) {
          setTime(time => moveTimeByPosition(time, pos));
        }
      },
      [viewport, height],
    );

    const body = (
      <TimeBlock isEditable={editable} style={notEditableStyle}>
        <TimeText fontSize={height === STEP_HEIGHT ? 10 : 14}>{period}</TimeText>
        {height >= ROW_HEIGHT && (
          <TimeText fontSize={12}>
            {duration}
            {event.title ? ` · ${event.title}` : ''}
          </TimeText>
        )}
      </TimeBlock>
    );

    if (!editable) {
      return body;
    }

    return (
      <Rnd
        size={{ width: '100%', height }}
        position={position}
        dragGrid={[STEP_HEIGHT, STEP_HEIGHT]}
        resizeGrid={[STEP_HEIGHT, STEP_HEIGHT]}
        onDrag={handleDrag}
        onDragStop={handleStop}
        onResize={handleResize}
        onResizeStop={handleStop}
        resizeHandleComponent={resizeHandleComponent}
        enableResizing={enableResizing}
        resizeHandleStyles={resizeHandleStyles}
        bounds="parent"
      >
        {body}
      </Rnd>
    );
  },
);
