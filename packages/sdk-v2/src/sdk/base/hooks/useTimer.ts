import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import moment from "moment";
import useInterval from "./useInterval";

const getTimerState = (targetTime?: Date): [string, boolean] => {
  const duration = moment.duration(moment(targetTime).diff(moment()));
  const isReachedZero = targetTime !== undefined && duration.asSeconds() <= 0;
  const countdown = isReachedZero ? "00:00:00" : moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

  return [countdown, isReachedZero];
};

const useTimer = (tillTime?: Date): [string, boolean, Dispatch<SetStateAction<Date | undefined>>] => {
  const [targetTime, setTargetTime] = useState(tillTime);
  const [timerState, setTimerState] = useState(() => getTimerState(targetTime));
  const [countdown, isReachedZero] = timerState;

  const onTick = useCallback(() => {
    setTimerState(getTimerState(targetTime));
  }, [targetTime, setTimerState]);

  const [start, stop] = useInterval(onTick, 1000, false);

  useEffect(() => {
    start();

    return stop;
  }, [start, stop, /*used*/ targetTime]);

  useEffect(() => {
    if (isReachedZero) {
      stop();
    }
  }, [isReachedZero, stop]);

  return [countdown, isReachedZero, setTargetTime];
};

export default useTimer;
