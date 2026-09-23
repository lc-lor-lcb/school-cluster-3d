// BGM: ゲームステージ(だるまがいる区画)用
// ステージの中心あたりに配置してください。
//
// 【設定必須】
// このアイテムに Item Audio Set List を追加し、"bgm" というIDでステージのBGMを登録してください。
// 登録したAudio ClipのInspectorで「Loop」を有効にしておくと、繰り返し再生されます。
//
// ロビーBGMと違い、ワールド開始時にはまだ再生しません。
// GameManagerからの「開始/終了」の合図で再生・停止します。

$.onReceive((messageType, arg, sender) => {
  if (messageType === "play") {
    $.audio("bgm").play();
  } else if (messageType === "stop") {
    $.audio("bgm").stop();
  }
});
