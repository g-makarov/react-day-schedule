import addMinutes from 'date-fns/addMinutes';
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import isAfter from 'date-fns/isAfter';
import isSameDay from 'date-fns/isSameDay';
import isWithinInterval from 'date-fns/isWithinInterval';
import setDate from 'date-fns/set';
import setHours from 'date-fns/setHours';
import startOfDay from 'date-fns/startOfDay';

import { DateInterval } from '~/types';

import { EventData } from './types';

export const ROW_HEIGHT = 50;
export const DEFAULT_MINUTES = 60;
export const MINUTES_STEP = 15;
export const STEP_HEIGHT = (MINUTES_STEP / 60) * ROW_HEIGHT;
export const ROUND_TIME = 5;

export function getAvailableTime(
  baseDate: Date,
  events: EventData[],
  startTime: Date,
  businessIntervals: DateInterval[],
  duration: number = DEFAULT_MINUTES,
): Nullable<DateInterval> {
  let start = isSameDay(baseDate, startTime) ? startTime : setHours(startTime, 0);
  let end = addMinutes(start, Math.abs(duration));

  if (!isSameDay(baseDate, startTime)) {
    const newStartTime = setHours(startTime, 8);
    return getAvailableTime(newStartTime, events, newStartTime, businessIntervals, duration);
  }

  const availableInterval = businessIntervals.find(interval => {
    const inInterval = isWithinInterval(start, interval) && isWithinInterval(end, interval);
    const isDurationAvailable =
      Math.abs(differenceInMinutes(interval.start, interval.end)) >= duration;

    if (!inInterval) {
      return isDurationAvailable && end.getTime() <= interval.end.getTime();
    }

    return isDurationAvailable;
  });

  if (!availableInterval) {
    return null;
  }

  if (isAfter(availableInterval.start, start)) {
    start = availableInterval.start;
    end = addMinutes(availableInterval.start, Math.abs(duration));
  }

  const existingEvent = events.find(event => {
    return areIntervalsOverlapping({ start, end }, { start: event.start, end: event.end });
  });

  if (existingEvent) {
    // todo: reduce events for each call
    return getAvailableTime(baseDate, events, existingEvent.end, businessIntervals, duration);
  }

  if (!isSameDay(start, end)) {
    return { start, end: startOfDay(end) };
  }

  return { start, end };
}

export function moveTimeByPosition(
  interval: DateInterval,
  position: number,
  height?: number,
): DateInterval {
  const currentTimePosition = position / ROW_HEIGHT;
  const hours = Math.floor(currentTimePosition);
  const minutes = Math.floor((currentTimePosition % 1) * 60);
  const startDate = setDate(interval.start, { hours, minutes });
  const duration = height
    ? (height / ROW_HEIGHT) * 60
    : differenceInMinutes(interval.end, interval.start);

  return {
    start: startDate,
    end: addMinutes(startDate, duration),
  };
}

export function getHoursAsFloat(date: Date): number {
  return getMinutes(date) / 60 + getHours(date);
}

export function getPositionByDate(date: Date): number {
  return getHoursAsFloat(date) * ROW_HEIGHT;
}

export function getTimeSlotHeight(interval: DateInterval): number {
  return (differenceInMinutes(interval.end, interval.start) / 60) * ROW_HEIGHT;
}

export function normalizePositionToStep(position: number): number {
  return Math.floor(Number(position.toFixed(2)) / STEP_HEIGHT) * STEP_HEIGHT;
}
