// クラフト機能: 遮蔽物本体のスクリプト
// World Item Templateに登録するプレハブ(barrier1/barrier2/barrier3など)に設定してください。
// 種類ごとにコピーしてLIFETIMEを変えても構いません。
//
// 【設定必須】(点滅させたい場合)
// 壁のときと同様に、Item Material Set Listを追加し、"Emission"という名前でマテリアルを登録し、
// 同じマテリアルをMesh RendererのMaterialsにも設定してください。

const LIFETIME = 30;        // この遮蔽物が消えるまでの時間(秒)
const BLINK_START = 2;      // 残りこの秒数から点滅を始める
const BLINK_INTERVAL = 0.2; // 点滅の周期(秒)
const EMISSION_MATERIAL_ID = "Emission";
const THROW_FORCE = 6;      // 離した瞬間に前方へ加える力の強さ(値を大きくすると遠くまで飛ぶ)

$.onStart(() => {
  $.state.remaining = LIFETIME;
});

// 離した瞬間、傾いたまま持たれていても向きを直立に戻してから、
// そのときの水平方向へ少し力を加える
// 【設定必須】このアイテムにGrabbableItemコンポーネントが必要です
$.onGrab((isGrab, isLeftHand, player) => {
  if (isGrab) return; // 掴んだ瞬間は無視。離した瞬間だけ処理する

  // 水平方向(Y軸まわり)の角度だけを取り出して、直立の向きを作る
  const currentForward = new Vector3(0, 0, 1).applyQuaternion($.getRotation());
  const yawDegrees = Math.atan2(currentForward.x, currentForward.z) * (180 / Math.PI);
  const uprightRotation = Quaternion.euler(0, yawDegrees, 0);

  // Rigidbody付きのアイテムなので、向きの変更にはwarp: trueが必須
  $.setRotation(uprightRotation, { warp: true });

  const forward = new Vector3(0, 0, 1).applyQuaternion(uprightRotation);
  $.addImpulsiveForce(forward.multiplyScalar(THROW_FORCE));
});

$.onUpdate((deltaTime) => {
  let remaining = ($.state.remaining ?? LIFETIME) - deltaTime;

  if (remaining <= BLINK_START) {
    const elapsed = LIFETIME - remaining;
    const on = Math.floor(elapsed / BLINK_INTERVAL) % 2 === 0;
    setGlow(on);
  }

  if (remaining <= 0) {
    $.destroy();
    return;
  }

  $.state.remaining = remaining;
});

function setGlow(on) {
  try {
    const mat = $.material(EMISSION_MATERIAL_ID);
    mat.setEmissionColor(on ? 3 : 0, on ? 1 : 0, on ? 1 : 0, 1);
  } catch (e) {
    // マテリアル未設定の場合は点滅を諦めて無視する
  }
}
