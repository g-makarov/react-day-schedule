import addMinutes from 'date-fns/addMinutes';
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping';
import endOfDay from 'date-fns/endOfDay';
import endOfToday from 'date-fns/endOfToday';
import formatDate from 'date-fns/format';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import isSameDay from 'date-fns/isSameDay';
import isToday from 'date-fns/isToday';
import isWithinInterval from 'date-fns/isWithinInterval';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import startOfHour from 'date-fns/startOfHour';
import startOfToday from 'date-fns/startOfToday';
import * as React from 'react';

import { DateInterval } from '~/types';
import { eachDateOfInterval } from '~/utils/dates/eachDateOfInterval';

import { Event } from './Event';
import {
  BusinessInterval,
  Container,
  EventsList,
  HalfHourDelimeter,
  HourBody,
  NoAvailable,
  NoAvailableText,
  Row,
  Time,
  Wrapper,
} from './styled';
import { EventData } from './types';
import {
  getAvailableTime,
  getPositionByDate,
  getTimeSlotHeight,
  ROUND_TIME,
  ROW_HEIGHT,
} from './utils';

interface Props {
  date: Date;
  events: EventData[];
  value: Nullable<DateInterval>;
  onTimeChange: (time: Nullable<DateInterval>) => void;
  newEventTitle: string;
  businessIntervals: DateInterval[];
  durationInMinutes: number;
}

export const Schedule: React.FC<Props> = React.memo(
  ({ date, events, onTimeChange, value, newEventTitle, businessIntervals, durationInMinutes }) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [isAvailable, setIsAvailable] = React.useState(true);
    const [viewport, setViewport] = React.useState<Nullable<HTMLElement>>(null);

    const currentEvents = React.useMemo(() => {
      return events.filter(event => isSameDay(event.start, date));
    }, [events, date]);

    const isTimeSlotFree = React.useCallback(
      (time: DateInterval): boolean => {
        const hasEvent = currentEvents.some(event =>
          areIntervalsOverlapping(time, { start: event.start, end: event.end }),
        );
        const inBusinessIntervals = businessIntervals.some(
          interval =>
            isWithinInterval(time.start, interval) && isWithinInterval(time.end, interval),
        );
        return !hasEvent && inBusinessIntervals;
      },
      [currentEvents, businessIntervals],
    );

    React.useEffect(() => {
      let position: Nullable<number> = null;

      if (value && isSameDay(date, value.start) && isTimeSlotFree(value)) {
        position = getHours(value.start) * ROW_HEIGHT;
      } else {
        let startTime: Date;

        if (isToday(date)) {
          const currentDate = new Date();
          const closestStep = [15, 30, 45].find(
            mins => getMinutes(currentDate) + ROUND_TIME < mins,
          );
          const currentTime = startOfHour(setHours(date, getHours(currentDate)));

          if (closestStep) {
            startTime = setMinutes(currentTime, closestStep);
          } else {
            startTime = startOfHour(setHours(date, getHours(currentDate) + 1));
            if (getMinutes(currentDate) >= 60 - ROUND_TIME) {
              startTime = addMinutes(startTime, 15);
            }
          }
        } else {
          startTime = startOfHour(setHours(date, 0));
        }

        const availableTime = getAvailableTime(
          date,
          events,
          startTime,
          businessIntervals,
          durationInMinutes,
        );

        if (availableTime) {
          position = getHours(availableTime.start) * ROW_HEIGHT;
          onTimeChange(availableTime);
        } else {
          onTimeChange(null);
          setIsAvailable(false);
        }
      }

      if (wrapperRef.current) {
        setViewport(wrapperRef.current);
        if (position !== null) {
          wrapperRef.current.scrollTop = position;
        }
      }
    }, []);

    const dates = React.useMemo(() => {
      const hours = eachDateOfInterval({ start: startOfToday(), end: endOfToday() }, { hours: 1 });
      return hours.map(item => formatDate(item, "h aaaaa'm'"));
    }, []);

    const newEvent = React.useMemo<null | EventData>(() => {
      if (!value) {
        return null;
      }

      return {
        id: 0,
        title: newEventTitle,
        ...value,
      };
    }, [value, newEventTitle]);

    const intervalStyles = React.useMemo(() => {
      const styles: React.CSSProperties[] = [];

      for (let i = 0; i < businessIntervals.length; ++i) {
        const curr = businessIntervals[i];
        const prev = businessIntervals[i - 1];

        const currPosition = getPositionByDate(curr.start);
        const prevPosition = prev ? getPositionByDate(prev.end) : 0;

        const difference = currPosition - prevPosition;
        const height = getTimeSlotHeight(curr);
        let heightWithBorders = height + difference;

        const style: React.CSSProperties = {
          top: `${currPosition - difference}px`,
          borderTopWidth: `${difference}px`,
        };

        const isLast = i === businessIntervals.length - 1;

        if (isLast) {
          const diff = getPositionByDate(endOfDay(date)) - currPosition - height;

          style.borderBottomWidth = `${diff}px`;
          style.borderBottomStyle = 'solid';
          heightWithBorders += diff;
        }

        style.height = `${heightWithBorders}px`;
        styles.push(style);
      }

      return styles;
    }, [businessIntervals, date]);

    return (
      <Wrapper ref={wrapperRef}>
        {isAvailable ? (
          <Container>
            {dates.map(date => (
              <Row key={date}>
                <Time>{date}</Time>
                <HourBody>
                  <HalfHourDelimeter />
                </HourBody>
              </Row>
            ))}
            <EventsList>
              {intervalStyles.map(style => (
                <BusinessInterval key={style.top} style={style} />
              ))}
              {currentEvents.map(event => (
                <Event
                  key={event.id}
                  event={event}
                  onTimeChange={onTimeChange}
                  isTimeSlotFree={isTimeSlotFree}
                  viewport={viewport}
                />
              ))}
              {newEvent && (
                <Event
                  editable
                  event={newEvent}
                  onTimeChange={onTimeChange}
                  isTimeSlotFree={isTimeSlotFree}
                  viewport={viewport}
                />
              )}
            </EventsList>
          </Container>
        ) : (
          <NoAvailable>
            <NoAvailableText>No available time</NoAvailableText>
          </NoAvailable>
        )}
      </Wrapper>
    );
  },
);
