import { ExperimentDoc } from "../model_ts/Experiment";

export function updateParticipation(
  target: ExperimentDoc,
  allParticipants: String[],
  percent_participanting: number,
) {
  const percentConverterToInt = 100;
  const initialPercentageOfParticipants = Math.round(
    (target.active.length / allParticipants.length) * percentConverterToInt
  );

  if (initialPercentageOfParticipants === percent_participanting) {
    return target
  }

  let needToIncrease = initialPercentageOfParticipants < percent_participanting;

  for (const jhed of allParticipants) {
    if (
      !removeOrAddUser(
        jhed,
        needToIncrease,
        target,
        allParticipants,
        percent_participanting
      )
    ) {
      break;
    }
  }

  const finalPercentageOfParticipants = Math.round(
    (target.active.length / allParticipants.length) * percentConverterToInt
  );
  target.percent_participanting = finalPercentageOfParticipants;

  return target;
}

export function removeOrAddUser(
  jhed: String,
  needToIncrease: boolean,
  target: ExperimentDoc,
  allParticipants: String[],
  percent_participating: number
 ) : boolean {
  const percentConverterToInt = 100;

  //This variable represents the current percentage of people participating in an experiment
  //Helps with deciding if an experiment reaches the precentage of 10%, 15%, etc
  const runningPercentageOfParticipants = Math.round(
    (target.active.length / allParticipants.length) * percentConverterToInt
  );

  if (needToIncrease) {
    if (runningPercentageOfParticipants >= percent_participating) {
      return false;
    }
    //Does not randomize the lists, only adds
    if (!target.blacklist.includes(jhed) && !target.active.includes(jhed)) {
      target.active.push(jhed);
    }
  } else {
    if (runningPercentageOfParticipants <= percent_participating) {
      return false;
    }
    //Does not randomize the lists, only removes
    target.active.splice(Math.floor(Math.random() * target.active.length), 1);
  }
  return true;
}