// スタート地点に置く、SE再生専用アイテム
// だるまに見つかったプレイヤーが戻ってくる場所(START_POSITIONの近く)に配置してください。
//
// 【設定必須】
// このアイテムに Item Audio Set List を追加し、"catchSE" というIDで
// 見つかったときの効果音を登録してください。

$.onReceive((messageType, arg, sender) => {
  if (messageType === "playCatchSE") {
    $.audio("catchSE").play();
  }
});
