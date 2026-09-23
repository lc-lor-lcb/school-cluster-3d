// 素材収集: 対象オブジェクトの切り替え管理役
//
// 【設定必須】
// このアイテムに「World Item Reference List」コンポーネントを追加し、
// 対象にしたい壁を wall1 / wall2 / wall3 ... というIDで登録してください。
// 下のWALL_IDSに、登録したIDを全て書き並べてください(数はいくつでも構いません)。

const CYCLE_INTERVAL = 5;      // 対象オブジェクトを切り替える間隔(秒)
const ACTIVE_COUNT = 4;        // ← 同時に点滅させる数。増やしたい場合はこの数字を変更してください
const WALL_IDS = ["wall1", "wall2", "wall3", "wall4", "wall5", "wall6"]; // ← World Item Reference Listに登録したIDと合わせる

let candidates = [];
let activeWalls = []; // 複数同時対応のため配列に変更

$.onStart(() => {
  $.log("WallCycle: onStart開始");

  candidates = [];
  for (const id of WALL_IDS) {
    try {
      const item = $.worldItemReference(id);
      candidates.push(item);
    } catch (e) {
      $.log(`WallCycle: ID "${id}" の参照に失敗 -> ${e}`);
    }
  }
  $.log(`WallCycle: 見つかった対象候補の数 = ${candidates.length}`);

  $.state.timer = CYCLE_INTERVAL;
  pickNextWalls();
});

$.onUpdate((deltaTime) => {
  let timer = ($.state.timer ?? CYCLE_INTERVAL) - deltaTime;
  if (timer <= 0) {
    pickNextWalls();
    timer = CYCLE_INTERVAL;
  }
  $.state.timer = timer;
});

function pickNextWalls() {
  try {
    // 前回アクティブだった壁を全て非アクティブに戻す
    for (const wall of activeWalls) {
      wall.send("deactivate", null);
    }
    activeWalls = [];

    if (candidates.length === 0) return;

    // candidatesの中からACTIVE_COUNT個を重複なしでランダムに選ぶ
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const count = Math.min(ACTIVE_COUNT, shuffled.length);
    activeWalls = shuffled.slice(0, count);

    for (const wall of activeWalls) {
      $.log("WallCycle: 壁にactivateを送信しました");
      wall.send("activate", null);
    }
  } catch (e) {
    $.log(`WallCycle: pickNextWallsでエラー -> ${e}`);
  }
}
