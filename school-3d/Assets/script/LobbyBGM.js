// BGM: ロビー用
// ロビーの中心あたりに配置してください。
//
// 【設定必須】
// このアイテムに Item Audio Set List を追加し、"bgm" というIDでロビーのBGMを登録してください。
// 登録したAudio ClipのInspectorで「Loop」を有効にしておくと、繰り返し再生されます。
// また、部屋全体で聞こえるようにしたい場合、AudioSourceの「Spatial Blend」を2D寄りに
// (あるいはMax Distanceを広め)調整してください。

$.onStart(() => {
  $.audio("bgm").play();
});

$.onReceive((messageType, arg, sender) => {
  if (messageType === "play") {
    $.audio("bgm").play();
  } else if (messageType === "stop") {
    $.audio("bgm").stop();
  }
});
