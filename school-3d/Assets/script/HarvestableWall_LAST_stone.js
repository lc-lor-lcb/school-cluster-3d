// 素材収集: 対象オブジェクト(壁)用スクリプト
//
// 【重要】このファイルは素材の種類ごとにコピーしてください。
// 例: HarvestableWall_Wood.js (MATERIAL_ID = "wood")
//     HarvestableWall_Stone.js (MATERIAL_ID = "stone")
// コピーしたファイルを、対象にしたい各壁オブジェクトのScriptable Itemに設定してください。
//
// 【設定必須】
// ・壁にItem Material Set Listを追加し、名前を下のEMISSION_MATERIAL_IDと合わせてマテリアルを登録
// ・そのマテリアルを、壁のMesh RendererのMaterialsにも同じものを設定(Element 0)
// ・壁ごとに別々のマテリアルアセットを使うこと(使い回すと点滅が連動してしまいます)
// ・壁に Item Audio Set List を追加し、"getSE" というIDで採取時の効果音を登録してください
//
// 【変更点】
// 採掘の判定は、Pickaxe.js側のRay(狙っている壁だけに当たる)で行うようになったため、
// ここでの距離判定は廃止しました。

const MATERIAL_ID = "stone"; // ← このコピーで取得できる素材名。コピーごとに書き換えてください
const EMISSION_MATERIAL_ID = "Emission"; // 発光に使うマテリアルスロット名
const BLINK_INTERVAL = 0.3; // 点滅の周期(秒)

$.onStart(() => {
  $.state.active = false;
  $.state.blinkTimer = 0;
  setGlow(false);
});

$.onUpdate((deltaTime) => {
  if (!$.state.active) return;
  const t = ($.state.blinkTimer ?? 0) + deltaTime;
  const on = Math.floor(t / BLINK_INTERVAL) % 2 === 0;
  setGlow(on);
  $.state.blinkTimer = t;
});

$.onReceive((messageType, arg, sender) => {
  $.log(`HarvestableWall(${MATERIAL_ID}): メッセージ受信 = ${messageType}`);

  if (messageType === "activate") {
    $.state.active = true;
    $.state.blinkTimer = 0;
  } else if (messageType === "deactivate") {
    $.state.active = false;
    setGlow(false);
  } else if (messageType === "mineAttempt") {
    if (!$.state.active) {
      $.log(`HarvestableWall(${MATERIAL_ID}): 現在アクティブでないため無視`);
      return;
    }

    // argにはPickaxe.jsから渡されたPlayerHandleが入っている
    const player = arg;
    player.send("addMaterial", MATERIAL_ID);
    $.audio("getSE").play();
    $.log(`HarvestableWall(${MATERIAL_ID}): ${MATERIAL_ID}を渡しました`);

    // 採掘完了。非アクティブに戻す(次にWallCycleが選ぶまで採掘不可)
    $.state.active = false;
    setGlow(false);
  }
});

function setGlow(on) {
  const mat = $.material(EMISSION_MATERIAL_ID);
  if (on) {
    mat.setEmissionColor(3, 3, 1, 1);
  } else {
    mat.setEmissionColor(0, 0, 0, 1);
  }
}
