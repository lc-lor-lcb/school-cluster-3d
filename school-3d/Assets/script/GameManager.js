// ゲーム開始・終了機能: 進行状況を管理する役
// すでにあるGameManagerアイテムのScriptable Itemに、このスクリプトを設定してください。
//
// 【設定必須】
// このアイテムに World Item Reference List を追加し、以下の3つを登録してください。
// ・WinnerUIアイテムを "winnerUI" というIDで
// ・LobbyBGMアイテムを "lobbyBGM" というIDで
// ・StageBGMアイテムを "stageBGM" というIDで

$.onStart(() => {
  $.state.isRunning = false;
});

$.onReceive((messageType, arg, sender) => {
  if (messageType === "startGame") {
    $.state.isRunning = true;
    $.log("GameManager: ゲーム開始");

    sendToRef("winnerUI", "resetText", null);
    sendToRef("lobbyBGM", "stop", null);
    sendToRef("stageBGM-1", "play", null);
    sendToRef("stageBGM-2", "play", null);
    sendToRef("stageBGM-3", "play", null);
    sendToRef("stageBGM-4", "play", null);
  } else if (messageType === "declareWinner") {
    if (!$.state.isRunning) {
      $.log("GameManager: ゲームが開始されていないため無視");
      return;
    }

    const player = arg; // EndButton.jsから渡されたPlayerHandle(勝者)
    $.state.isRunning = false; // 次の開始まで、以後の勝利判定をロック

    $.log(`GameManager: ${player.userDisplayName}の勝利`);

    sendToRef("winnerUI", "showWinner", player.userDisplayName);
    sendToRef("stageBGM-1", "stop", null);
    sendToRef("stageBGM-2", "stop", null);
    sendToRef("stageBGM-3", "stop", null);
    sendToRef("stageBGM-4", "stop", null);
    sendToRef("lobbyBGM", "play", null);
  }
});

function sendToRef(id, messageType, arg) {
  try {
    const item = $.worldItemReference(id);
    item.send(messageType, arg);
  } catch (e) {
    $.log(`GameManager: ${id}の参照に失敗 -> ${e}`);
  }
}
