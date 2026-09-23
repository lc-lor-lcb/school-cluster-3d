// ゲーム開始・終了機能: 地点A(ロビー)に置く開始ボタン
//
// 【設定必須】
// ・このアイテムにColliderコンポーネントが必要です(interactの判定に使われます)
// ・このアイテムに World Item Reference List を追加し、GameManagerを
//   "gameManager" というIDで登録してください。
// ・このアイテムに Item Audio Set List を追加し、"clickSE" というIDでボタン音を登録してください。

const RADIUS = 50; // スタートボタンからこの半径(m)以内にいるプレイヤーを対象にする
const GAME_START_POSITION = new Vector3(-0.35, 0.5, -1.05); // TODO: 実際のスタート地点の座標に書き換えてください

$.onInteract((player) => {
  $.log(`StartButton: ${player.userDisplayName}が開始ボタンを押しました`);
  $.audio("clickSE").play();

  try {
    const gameManager = $.worldItemReference("gameManager");
    gameManager.send("startGame", null);
  } catch (e) {
    $.log(`StartButton: gameManagerの参照に失敗 -> ${e}`);
  }

  const nearbyPlayers = $.getPlayersNear($.getPosition(), RADIUS);
  for (const p of nearbyPlayers) {
    p.setPosition(GAME_START_POSITION);
  }
  $.log(`StartButton: ${nearbyPlayers.length}人のプレイヤーをスタート地点へ転送しました`);
});
