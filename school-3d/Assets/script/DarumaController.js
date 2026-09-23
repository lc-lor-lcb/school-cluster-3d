// だるまさんがころんだ風ゲーム - ClusterScript版
//
// 【設定必須】
// このアイテムに World Item Reference List を追加し、StartPointAudioアイテムを
// "startPointAudio" というIDで登録してください(見つかったときのSEをそちらで鳴らすため)。

const FOV_ANGLE = 60;         // 視野角(度)
const RAY_OFFSET = 0.3;       // 自己ヒットを避けるためのRayの前方オフセット
const SIGHT_RADIUS = 50;      // プレイヤーを検知する半径(m)
const WATCH_TIME = 2;         // 振り向いている時間(秒)
const BACK_TIME_FIRST = 3;    // 最初に背を向けている時間(秒)
const BACK_TIME_MIN = 2;      // 2回目以降、背を向けている最小時間(秒)
const BACK_TIME_MAX = 6;      // 2回目以降、背を向けている最大時間(秒)
const INVINCIBLE_DURATION = 15; // 捕まった後、無敵になる時間(秒)

// 見つかったプレイヤーを戻す座標(ラウンドの開始地点)
// TODO: 実際の座標に書き換えてください(StartButton.jsのGAME_START_POSITIONと揃えるのがおすすめです)
const START_POSITION = new Vector3(-0.35, 0.5, -1.05);

// モデルの「顔・目」に相当するSubNodeの名前
const EYE_SUBNODE_NAME = "EyePoint";
const eyeNode = $.subNode(EYE_SUBNODE_NAME);

function angleBetweenDeg(a, b) {
  const na = a.clone().normalize();
  const nb = b.clone().normalize();
  const dot = Math.min(1, Math.max(-1, na.dot(nb)));
  return Math.acos(dot) * (180 / Math.PI);
}

function getEyeGlobalPose() {
  const pos = eyeNode.getGlobalPosition();
  const rot = eyeNode.getGlobalRotation();
  if (pos !== null && rot !== null) {
    return { position: pos, rotation: rot };
  }
  return { position: $.getPosition(), rotation: $.getRotation() };
}

function lookBack() {
  $.setRotation(Quaternion.euler(0, 0, 0), { warp: true });
}

function lookFront() {
  $.setRotation(Quaternion.euler(0, 180, 0), { warp: true });
}

// 無敵タイマーを進める(経過時間分だけ減らし、切れたプレイヤーは削除する)
function updateInvincibility(deltaTime) {
  const invincible = $.state.invincible ?? {};
  let changed = false;

  for (const id in invincible) {
    const remaining = invincible[id] - deltaTime;
    if (remaining <= 0) {
      delete invincible[id];
    } else {
      invincible[id] = remaining;
    }
    changed = true;
  }

  if (changed) {
    $.state.invincible = invincible;
  }
}

function isInvincible(playerId) {
  const invincible = $.state.invincible ?? {};
  return (invincible[playerId] ?? 0) > 0;
}

function makeInvincible(playerId) {
  const invincible = $.state.invincible ?? {};
  invincible[playerId] = INVINCIBLE_DURATION;
  $.state.invincible = invincible;
}

function checkPlayersInSight() {
  const eye = getEyeGlobalPose();
  const origin = eye.position;
  const forward = new Vector3(0, 0, 1).applyQuaternion(eye.rotation);

  const players = $.getPlayersNear(origin, SIGHT_RADIUS);

  for (const player of players) {
    if (isInvincible(player.id)) continue; // 無敵中のプレイヤーは判定しない

    const playerPos = player.getPosition();
    if (playerPos === null) continue;

    const toPlayer = playerPos.clone().sub(origin);
    const distance = toPlayer.length();
    if (distance < 0.01) continue;

    const angle = angleBetweenDeg(forward, toPlayer);
    if (angle >= FOV_ANGLE) continue;

    const rayOrigin = origin.clone().add(forward.clone().multiplyScalar(RAY_OFFSET));
    const direction = toPlayer.clone().normalize();
    const result = $.raycast(rayOrigin, direction, distance + 0.1);

    if (
      result !== null &&
      result.handle !== null &&
      result.handle.type === "player" &&
      result.handle.id === player.id
    ) {
      player.setPosition(START_POSITION);
      makeInvincible(player.id);

      try {
        const startPointAudio = $.worldItemReference("startPointAudio");
        startPointAudio.send("playCatchSE", null);
      } catch (e) {
        $.log(`DarumaController: startPointAudioの参照に失敗 -> ${e}`);
      }
    }
  }
}

$.onStart(() => {
  $.state.phase = "Back";
  $.state.timer = BACK_TIME_FIRST;
  $.state.isFirstTurn = true;
  $.state.invincible = {};
  lookBack();
});

$.onUpdate((deltaTime) => {
  updateInvincibility(deltaTime);

  let timer = ($.state.timer ?? 0) - deltaTime;

  if ($.state.phase === "Back") {
    if (timer <= 0) {
      $.state.phase = "Watch";
      lookFront();
      timer = WATCH_TIME;
    }
  } else if ($.state.phase === "Watch") {
    checkPlayersInSight();

    if (timer <= 0) {
      $.state.phase = "Back";
      lookBack();

      if ($.state.isFirstTurn) {
        timer = BACK_TIME_FIRST;
        $.state.isFirstTurn = false;
      } else {
        timer = BACK_TIME_MIN + Math.random() * (BACK_TIME_MAX - BACK_TIME_MIN);
      }
    }
  }

  $.state.timer = timer;
});
