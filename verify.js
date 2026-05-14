const rawDb = require('./src/data/free-exercise-db.json');
const dbMap = new Map(rawDb.map(e => [e.id, e]));
const CARDIO_MAP = {
  'cardio-run': 'Jogging_Treadmill',
  'cardio-stairs': 'Stairmaster',
  'cardio-swim': 'Rowing_Stationary',
  'cardio-rope': 'Rope_Jumping',
};

function getImageUrl(exerciseId, frame = 0) {
  const dbId = CARDIO_MAP[exerciseId] || exerciseId.replace(/^ex-/, '');
  const entry = dbMap.get(dbId);
  if (!entry?.images?.[frame]) return undefined;
  return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/images/' + entry.images[frame];
}

const ids = [
  'ex-Barbell_Squat',
  'ex-Dumbbell_Bench_Press',
  'cardio-run',
  'cardio-stairs',
  'cardio-swim',
  'cardio-rope',
];

ids.forEach(id => {
  console.log(id, '->', getImageUrl(id));
});
