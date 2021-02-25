import { DateInterval } from '~/types';

export interface EventData extends DateInterval {
  id: number | string;
  title: string;
}
