// ゲーム開始・終了機能: だるま付近に置く終了ボタン
//
// 【設定必須】
// ・このアイテムにColliderコンポーネントが必要です(interactの判定に使われます)
// ・このアイテムに World Item Reference List を追加し、GameManagerを
//   "gameManager" というIDで登録してください。

const RADIUS = 100; // 終了ボタンからこの半径(m)以内にいるプレイヤー全員をロビーへ転送する
const LOBBY_POSITION = new Vector3(-500, 1, -500); // TODO: 実際の地点Aの座標に書き換えてください

$.onInteract((player) => {
  $.log(`EndButton: ${player.userDisplayName}が終了ボタンを押しました`);

  try {
    const gameManager = $.worldItemReference("gameManager");
    gameManager.send("declareWinner", player);
  } catch (e) {
    $.log(`EndButton: gameManagerの参照に失敗 -> ${e}`);
  }

  // 押した本人を含め、周囲にいる全プレイヤーをロビーへ転送する
  const nearbyPlayers = $.getPlayersNear($.getPosition(), RADIUS);
  for (const p of nearbyPlayers) {
    p.setPosition(LOBBY_POSITION);
  }
  $.log(`EndButton: ${nearbyPlayers.length}人のプレイヤーをロビーへ転送しました`);
});
