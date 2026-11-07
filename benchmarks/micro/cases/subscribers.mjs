import { compareVariants } from '../measure.mjs';

const fanout = 50_000;
const churnIterations = 5_000_000;
const notificationIterations = 5_000;
const fanoutSubscribers = Array.from({ length: fanout }, () => ({ handleChange() {} }));

export function run(baseModule, candidateModule) {
  const createBaseRecord = createRecordFactory(baseModule);
  const createCandidateRecord = createRecordFactory(candidateModule);

  return [
    {
      name: 'single-subscriber add/remove churn',
      unit: 'ns/cycle',
      ...compareVariants(
        () => ({ record: createBaseRecord(), subscriber: fanoutSubscribers[0] }),
        () => ({ record: createCandidateRecord(), subscriber: fanoutSubscribers[0] }),
        runSingleSubscriberChurn,
        { scale: 1_000_000 / churnIterations },
      ),
    },
    {
      name: `add ${fanout} subscribers`,
      unit: 'ms',
      ...compareVariants(
        () => createBaseRecord(),
        () => createCandidateRecord(),
        addFanout,
        { warmups: 1, samples: 7 },
      ),
    },
    {
      name: `remove ${fanout} subscribers`,
      unit: 'ms',
      ...compareVariants(
        () => createPopulatedRecord(createBaseRecord),
        () => createPopulatedRecord(createCandidateRecord),
        removeFanout,
        { warmups: 1, samples: 7 },
      ),
    },
    {
      name: `notify 1000 subscribers ${notificationIterations} times`,
      unit: 'ms',
      ...compareVariants(
        () => createNotificationRecord(createBaseRecord),
        () => createNotificationRecord(createCandidateRecord),
        runNotifications,
      ),
    },
  ];
}

function createRecordFactory(runtimeModule) {
  class Owner {}
  runtimeModule.subscriberCollection(Owner, null);
  return () => new Owner().subs;
}

function runSingleSubscriberChurn({ record, subscriber }) {
  for (let i = 0; i < churnIterations; ++i) {
    record.add(subscriber);
    record.remove(subscriber);
  }
  return record.count;
}

function addFanout(record) {
  for (const subscriber of fanoutSubscribers) {
    record.add(subscriber);
  }
  return record.count;
}

function createPopulatedRecord(createRecord) {
  const record = createRecord();
  addFanout(record);
  return record;
}

function removeFanout(record) {
  for (const subscriber of fanoutSubscribers) {
    record.remove(subscriber);
  }
  return record.count;
}

function createNotificationRecord(createRecord) {
  const counter = { value: 0 };
  const record = createRecord();
  for (let i = 0; i < 1_000; ++i) {
    record.add({ handleChange() { ++counter.value; } });
  }
  return { counter, record };
}

function runNotifications({ counter, record }) {
  for (let i = 0; i < notificationIterations; ++i) {
    record.notify(i, i - 1);
  }
  return counter.value;
}
