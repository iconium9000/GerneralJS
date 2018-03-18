log = console.log

var vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  attribute vec3 vertColor;
  varying vec4 fragColor;

  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  uniform vec3 xColor;
  uniform vec3 yColor;
  uniform vec3 zColor;

  void main()
  {
    // fragColor = vertColor;
    fragColor = vec4(
      dot(xColor,vertPosition),
      dot(yColor,vertPosition),
      dot(zColor,vertPosition), 1);

    // fragColor = vec3(0.4,0.4,0.4);
    // gl_Position = mView * vec4(vertPosition, 1.0);
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  }
`

var fragmentShaderText = `
  precision mediump float;

  varying vec4 fragColor;
  void main()
  {
    gl_FragColor = fragColor;//vec4(fragColor, 1.0);
  }
`

function f32(a) {
  return new Float32Array(a)
}

var gl;

//
// Create buffer
//
var boxVertices =
[ // X, Y, Z           R, G, B
  // Top
  -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
  -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
  1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
  1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

  // Left
  -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
  -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
  -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
  -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

  // Right
  1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
  1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
  1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
  1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

  // Front
  1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
  1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
  -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
  -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

  // Back
  1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
  1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
  -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
  -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

  // Bottom
  -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
  -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
  1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
  1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
];

var boxIndices =
[
  // Top
  0, 1, 2,
  0, 2, 3,

  // Left
  5, 4, 6,
  6, 4, 7,

  // Right
  8, 9, 10,
  8, 10, 11,

  // Front
  13, 12, 14,
  15, 14, 12,

  // Back
  16, 17, 18,
  16, 18, 19,

  // Bottom
  21, 20, 22,
  22, 20, 23
];

function get_gl() {
  var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
    return null
	}

  gl.clearColor(0.75, 0.85, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

  return [gl,canvas]
}
function createProgram(gl, vertexShaderText, fragmentShaderText) {
  //
  // Create shaders
  //
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  {
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
      return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
      return;
    }
  }

  var program = gl.createProgram();
  {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('ERROR linking program!', gl.getProgramInfoLog(program));
      return null;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('ERROR validating program!', gl.getProgramInfoLog(program));
      return null;
    }
  }
  return program
}
function createArray(gl, program, verticies, indicies) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies), gl.STATIC_DRAW);

  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
  var BPE_32 = Float32Array.BYTES_PER_ELEMENT
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    6 * BPE_32, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    6 * BPE_32, // Size of an individual vertex
    3 * BPE_32 // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
}

var sphere_points = []
var sphere_lines = []
var sphere_triangles = []

var n_points = 180
{
  var zero = vec3.create
  var unit = (v3,s) => vec3.scale(v3, v3, s / vec3.len(v3))
  var rand_scal = () => 2 * Math.random() - 1
  var f_vec3 = f => [f(), f(), f()]

  for (var i = 0; i < n_points; ++i) {
    var c = unit(f_vec3(rand_scal),1)
    var v = unit(f_vec3(rand_scal),1)//vec3.clone(c)
    sphere_points.push([v,c,[],[]])
  }
  for (var i = 0; i < n_points-1; ++i) {
    for (var j = i+1; j < n_points; ++j) {
      var a = sphere_points[i]
      var b = sphere_points[j]
      var l = [i,j,vec3.dist(a[0],b[0]),true]
      sphere_lines.push(l)
      b[2][i] = l
    }
  }
  sphere_lines.sort((a,b)=>a[2]-b[2])

  var prev = -1
  for (var i = 0; i < sphere_lines.length; ++i) {
    var a = sphere_lines[i]
    var a1 = sphere_points[a[0]][0]
    var a2 = sphere_points[a[1]][0]
    // a[3] = Math.random() < 0.1

    var pctg = Math.floor(i / sphere_lines.length * 100)
    pctg != prev && log(prev = pctg)

    for (var j = i+1; a[3] && j < sphere_lines.length; ++j) {
      var b = sphere_lines[j]
      var b1p = sphere_points[b[0]]
      var b1 = b1p[0]

      var b2 = sphere_points[b[1]][0]

      if (!b[3] ||
        a[0] == b[0] || a[1] == b[1] ||
        a[0] == b[1] || a[1] == b[0]
      ) continue

      var m = b1p[3][i]
      if (!m) {
        var m = [
          vec3.sub(zero(), a1, b1),
          vec3.sub(zero(), a2, b1),
          vec3.sub(zero(), zero(), b1)
        ]
        var m = mat3.clone([
          m[0][0], m[0][1], m[0][2],
          m[1][0], m[1][1], m[1][2],
          m[2][0], m[2][1], m[2][2]])
        m = b1p[3][i] = mat3.invert(mat3.create(), m)

      }

      var z = zero()
      var t = vec3.transformMat3(z, vec3.sub(z,b2,b1), m)
      if (t[0] + t[1] + t[2] > 1 && t[0] > 0 && t[1] > 0 && t[2] > 0) {
        b[3] = false
      }
    }
  }
  for (var i = 0; i < n_points; ++i) {
    for (var j = i+1; j < n_points; ++j) {
      for (var k = j+1; k < n_points; ++k) {
        var a = sphere_points[i]
        var b = sphere_points[j]
        var c = sphere_points[k]

        if (b[2][i][3] && c[2][i][3] && c[2][j][3]) {
          var b_a = vec3.sub(zero(),b[0],a[0])
          var c_a = vec3.sub(zero(),c[0],a[0])
          var c = vec3.cross(zero(), b_a, c_a)
          if (vec3.dot(c,a[0]) > 0)
            sphere_triangles.push([i,j,k])
          else sphere_triangles.push([j,i,k])
        }
      }
    }
  }
}

function get_verticies() {
  var verticies = []
  for (var i = 0; i < n_points; ++i) {
    for (var j = 0; j < 3; ++j)
      verticies.push(sphere_points[i][0][j])
    for (var j = 0; j < 3; ++j)
      verticies.push(sphere_points[i][1][j])
  }
  return verticies
}
function get_indicies() {
  var indicies = []
  for (var i = 0; i < sphere_triangles.length; ++i) {
    for (var j = 0; j < 3; ++j)
      indicies.push(sphere_triangles[i][j])
  }
  return indicies
}

function do_program() {
  var got_gl = get_gl()
  if (got_gl == null) return
  var gl = got_gl[0]
  var canvas = got_gl[1]

  var program = createProgram(gl, vertexShaderText,fragmentShaderText)
  if (program == null) return

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  var vecXColorUniformLocation = gl.getUniformLocation(program, 'xColor');
  var vecYColorUniformLocation = gl.getUniformLocation(program, 'yColor');
  var vecZColorUniformLocation = gl.getUniformLocation(program, 'zColor');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);

	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -3], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

  var xColor = [1,0,0]
  var yColor = [0,1,0]
  var zColor = [0,0,1]

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

  var indicies = get_indicies()
  createArray(gl, program, get_verticies(), indicies)

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle / 10, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 10, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    {
      var a = angle / 10
      var cos = Math.cos(a)
      var sin = Math.sin(a)

      gl.uniform3fv(vecXColorUniformLocation, [cos,sin,0])
      gl.uniform3fv(vecYColorUniformLocation, [0,cos,sin])
      gl.uniform3fv(vecZColorUniformLocation, [sin,0,cos])

      // gl.uniform3fv(vecXColorUniformLocation, [1,0,0])
      // gl.uniform3fv(vecYColorUniformLocation, [0,1,0])
      // gl.uniform3fv(vecZColorUniformLocation, [0,0,1])
    }

		gl.clearColor(0,0,0,1)//0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}

var InitDemo = do_program
