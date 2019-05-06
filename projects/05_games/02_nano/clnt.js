var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.x = 0.5;
camera.position.y = 0.5;
camera.position.z = 5;

USR_IO_INIT()
var reqFrame = FU.reqFrame()

function animate() {
  USR_IO_TICK(() => {})
  renderer.render( scene, camera );
  reqFrame( animate );
}
animate();
