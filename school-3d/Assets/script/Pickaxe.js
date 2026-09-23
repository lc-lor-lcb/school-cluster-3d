// 素材収集: つるはし本体のスクリプト
//
// 【設定必須】
// ・このアイテムに GrabbableItem コンポーネントを追加してください
// ・このアイテムに PlayerScript コンポーネントを追加し、Source Code Assetに PlayerInventory.js を設定してください
//
// 【変更点】
// 以前は登録済みの壁全部にメッセージを送っていましたが、複数の対象が同時にアクティブな場合に
// 意図しない壁が反応してしまうため、Rayを飛ばして実際に狙っている壁だけに送る方式に変更しました。
// (World Item Reference Listはこのファイルでは不要になりました)

const MINE_DISTANCE = 5; // Rayを飛ばす最大距離(m)
const RAY_OFFSET = 0.3;  // 自己ヒット防止のための前方オフセット

$.onUse((isDown, player) => {
  if (!isDown) return; // 押した瞬間のみ反応

  $.log("Pickaxe: 使用されました");

  const origin = $.getPosition();
  const forward = new Vector3(0, 0, 1).applyQuaternion($.getRotation());
  const rayOrigin = origin.clone().add(forward.clone().multiplyScalar(RAY_OFFSET));

  const result = $.raycast(rayOrigin, forward, MINE_DISTANCE);

  if (result !== null && result.handle !== null && result.handle.type === "item") {
    result.handle.send("mineAttempt", player);
  } else {
    $.log("Pickaxe: 対象が見つかりませんでした");
  }
});

// 初めて掴んだプレイヤーに、所持素材を管理するPlayerScriptを登録する
$.onGrab((isGrab, isLeftHand, player) => {
  if (!isGrab) return;

  const registered = $.state.registeredPlayerIds ?? [];
  if (!registered.includes(player.id)) {
    $.setPlayerScript(player);
    $.state.registeredPlayerIds = [...registered, player.id];
  }
});
