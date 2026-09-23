// ゲーム開始・終了機能: 地点Aに設置する、勝利者を表示する看板
//
// 【設定必須】
// ・このアイテムの子オブジェクトとして、名前を「WinnerText」にしたGameObjectを作成し、
//   そこに「Text View」コンポーネントを追加してください(3D空間に文字を表示するための部品です)

$.onReceive((messageType, arg, sender) => {
  const textNode = $.subNode("WinnerText");

  if (messageType === "showWinner") {
    const winnerName = arg;
    textNode.setText(`${winnerName}の勝利`);
  } else if (messageType === "resetText") {
    textNode.setText("");
  }
});
