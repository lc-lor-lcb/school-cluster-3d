// クラフト機能: プレイヤーごとの所持素材・クラフトボタンを管理するPlayerScript
// Pickaxe.jsのPlayerScriptコンポーネントに、このファイルを設定してください。
//
// 【設定必須】
// ・つるはしのアイテムに World Item Reference List を追加し、CraftManagerを "craftManager" というIDで登録
// ・つるはしのアイテムに Icon Asset List を追加し、3種類のアイコンを
//   "barrier1Icon" / "barrier2Icon" / "barrier3Icon" として登録
// ・シーンに「GameObject > UI > PlayerLocalUI – cluster」を1つ作成し、
//   その中のSafeAreaの下にUI > Legacy > Textを1つ追加
// ・別の空オブジェクトに Player Local Object Reference List を追加し、
//   そのTextを "inventoryText" というIDで登録
// ・ワールドのどこかにWorld Runtime Settingを追加し、Use Cluster HUD v2を有効化

let inventory = {}; // 例: { wood: 3, stone: 1 }

const BARRIERS = [
  { buttonIndex: 1, templateId: "barrier1", iconId: "barrier1Icon", cost: { wood: 2 } },
  { buttonIndex: 2, templateId: "barrier2", iconId: "barrier2Icon", cost: { wood: 1, stone: 1 } },
  { buttonIndex: 3, templateId: "barrier3", iconId: "barrier3Icon", cost: { stone: 2 } },
];

for (const barrier of BARRIERS) {
  try {
    _.showButton(barrier.buttonIndex, _.iconAsset(barrier.iconId));
  } catch (e) {
    _.log(`showButton(${barrier.buttonIndex})でエラー -> ${e}`);
  }

  _.onButton(barrier.buttonIndex, (isDown) => {
    _.log(`ボタン${barrier.buttonIndex}: isDown=${isDown}`);
    if (!isDown) return;
    tryCraft(barrier);
  });
}

updateInventoryText();

_.onReceive((messageType, arg, sender) => {
  if (messageType === "addMaterial") {
    const materialId = arg;
    inventory[materialId] = (inventory[materialId] ?? 0) + 1;
    _.log(`${materialId} を入手！ 現在の所持数: ${inventory[materialId]}`);
    updateInventoryText();
  }
});

function tryCraft(barrier) {
  _.log(`tryCraft開始: ${barrier.templateId}`);

  for (const materialId in barrier.cost) {
    const have = inventory[materialId] ?? 0;
    _.log(`  必要: ${materialId} x${barrier.cost[materialId]} / 所持: ${have}`);
    if (have < barrier.cost[materialId]) {
      _.log("クラフト失敗: 素材が足りません");
      return;
    }
  }

  for (const materialId in barrier.cost) {
    inventory[materialId] -= barrier.cost[materialId];
  }

  const forward = new Vector3(0, 0, 1).applyQuaternion(_.getRotation());
  const position = _.getPosition().clone().add(forward.clone().multiplyScalar(2));
  const rotation = _.getRotation();

  try {
    const craftManagerId = _.worldItemReference("craftManager");
    _.log(`craftManagerId取得成功: ${craftManagerId}`);
    _.sendTo(craftManagerId, "craftBarrier", {
      templateId: barrier.templateId,
      position: position,
      rotation: rotation,
    });
    _.log(`遮蔽物(${barrier.templateId})の生成をリクエストしました`);
  } catch (e) {
    _.log(`craftでエラー -> ${e}`);
  }

  updateInventoryText();
}

function updateInventoryText() {
  const keys = Object.keys(inventory);
  const lines = keys.map((id) => `${id}: ${inventory[id]}`);
  const text = lines.length > 0 ? lines.join("\n") : "素材なし";

  const textObject = _.playerLocalObject("inventoryText");
  if (textObject === null) {
    _.log("updateInventoryText: inventoryTextが見つかりません");
    return;
  }
  const textComponent = textObject.getUnityComponent("TextMeshProUGUI");
  if (textComponent === null) {
    _.log("updateInventoryText: TextMeshProUGUIコンポーネントが見つかりません");
    return;
  }
  textComponent.unityProp.text = text;
}

function getMaterialCount(materialId) {
  return inventory[materialId] ?? 0;
}
