// クラフト機能: 遮蔽物を実際に生成する管理役
// ワールド内に1つ配置し、Scriptable Itemにこのスクリプトを設定してください。
//
// 【設定必須】
// World Item Template Listに、barrier1 / barrier2 / barrier3 という名前で、
// それぞれBarrier.jsを付けたプレハブを登録してください。
// また、このアイテムに Item Audio Set List を追加し、"craftSE" というIDで
// クラフト成功時の効果音を登録してください。

$.onReceive((messageType, arg, sender) => {
  $.log(`CraftManager: メッセージ受信 = ${messageType}`);

  if (messageType !== "craftBarrier") return;

  const templateId = arg.templateId;
  const p = arg.position;
  const r = arg.rotation;

  // sendToを経由するとVector3/Quaternionの「本物のインスタンス」ではなくなることがあるため、
  // 受け取った値から明示的に組み立て直す
  const position = new Vector3(p.x, p.y, p.z);
  const rotation = new Quaternion(r.x, r.y, r.z, r.w);

  try {
    const worldItemTemplateId = new WorldItemTemplateId(templateId);
    $.createItem(worldItemTemplateId, position, rotation);
    $.audio("craftSE").play();
    $.log(`CraftManager: ${templateId}を生成しました`);
  } catch (e) {
    $.log(`CraftManager: createItem失敗 -> ${e}`);
  }
}, { player: true, item: true });
