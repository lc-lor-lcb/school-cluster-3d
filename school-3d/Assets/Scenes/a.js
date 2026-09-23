$.onUpdate(function(deltaTime) {
  var player = $.getLocalPlayer();
  if (player == null) return;
  
  var playerPos = player.getPosition();
  var myPos = $.subNode("Panel").getPosition();
  
  var dir = {
    x: playerPos.x - myPos.x,
    y: 0,
    z: playerPos.z - myPos.z
  };
  
  var angle = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
  
  $.subNode("Panel").setEulerAngles(
    new Vector3(0, angle + 180, 0)
  );
});