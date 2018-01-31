log = console.log

var vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;

  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  uniform vec3 xColor;
  uniform vec3 yColor;
  uniform vec3 zColor;

  void main() {
    // fragColor = vec4(
    //   dot(xColor,vertColor),
    //   dot(yColor,vertColor),
    //   dot(zColor,vertColor));
    fragColor = vertColor;

    // gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    gl_Position = mProj * mView * vec4(vertPosition, 1.0);
  }
`

var fragmentShaderText = `
  precision mediump float;

  varying vec3 fragColor;
  void main()
  {
    gl_FragColor = vec4(fragColor, 1.0);
  }
`

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
function createArray(gl, program, verticies_indicies) {
  var verticies = verticies_indicies[0]
  var indicies = verticies_indicies[1]

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

var zero = vec3.create
var unit = (v3,s) => vec3.scale(zero(), v3, s / vec3.len(v3))
var rand_scal = () => 2 * Math.random() - 1
var f_vec3 = f => [f(), f(), f()]

function get_sphere(n_points, cntr_pt, scal, mass, velcty) {
  var sphere_points = []
  var sphere_lines = []
  var sphere_triangles = []

  var dif = 0.5

  for (var i = 0; i < n_points; ++i) {
    var c = [
      dif + Math.random() * (1 - dif),
      dif + Math.random() * (1 - dif),
      0]
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

    // var pctg = Math.floor(i / sphere_lines.length * 100)
    // pctg != prev && log(prev = pctg)

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
  return [cntr_pt, scal, sphere_points, sphere_triangles, mass, velcty]
}

var bg_C = 0.2
var reps = 300

var Z = 5e2
var Z_s = 1e-1
var G = 1e-4
var M1 = 1e5
var M2 = 1e3
var M3 = 1e-14

var d1 = 0.1
var d2 = 0.01
var d3 = 0.005

var r2 = Z * 0.25
var r3 = Z * 0.6
var r4 = r3 + 0.3 * r3 / (Math.sqrt(M1 / M2) - 1)
var r5 = r2 + 0.3 * r2 / (Math.sqrt(M1 / M2) - 1)

var v2 = Math.sqrt(G * M1 / r2)
var v3 = Math.sqrt(G * M1 / r3)
var v4 = v3 + Math.sqrt(G * M2 / (r4 - r3))
var v5 = v2 + Math.sqrt(G * M2 / (r5 - r2))
var v1 = - (v2 * M2 + v3 * M2 + v4 * M3) / M1


{
  log(v1, v2, v3, v4)
}


// log(M1 / M2, (r4 * r4) / (r4 - r3) / (r4 - r3))

/*
  G * M1 * M3 / (r3 + r4) / (r3 + r4) = G * M2 * M3 / (r4 r4)
  M1 / (r3 + r4) / (r3 + r4) = M2 / (r4 r4)
  p = ±1
  p sqrt(M1) / (r3 + r4) = sqrt(M2) / r4
  p sqrt(M1) r4 = sqrt(M2) (r3 + r4)
  MT = p sqrt(M1/M2)
 MT r4 = r3 + r4
  (MT - 1) r4 = r3
  r4 = r3 / (MT - 1)
*/



var cntr_point_triangle_ary = [
  get_sphere(100,[0,0,0], Z * d1, M1, [0,v1,0])
]

// 0 cntr_pt
// 1 scal
// 2 sphere_points
// 3 sphere_triangles
// 4 m
// 5 v
// 6 f

function get_verticies_indicies(dt) {
  var verticies = []
  var indicies = []


  for (var rep = 0; rep < reps; ++rep) {
    for (var i = 0; i < cntr_point_triangle_ary.length; ++i) {
      cntr_point_triangle_ary[i][6] = zero()
    }

    for (var i = 0; i < cntr_point_triangle_ary.length; ++i) {
      var a = cntr_point_triangle_ary[i]
      var a_p = a[0]
      var a_m = a[4]
      var a_a = a[6]
      for (var j = i+1; j < cntr_point_triangle_ary.length; ++j) {
        var b = cntr_point_triangle_ary[j]
        var b_p = b[0]
        var b_m = b[4]
        var b_a = b[6]

        var force = vec3.sub(zero(), b_p, a_p)
        var len = vec3.len(force)
        vec3.scale(force, force, G * a_m * b_m / len / len / len)
        vec3.add(a_a, a_a, force)
        vec3.sub(b_a, b_a, force)
      }
    }

    for (var cptal = 0; cptal < cntr_point_triangle_ary.length; ++cptal) {
      var cntr_point_triangle = cntr_point_triangle_ary[cptal]
      var cntr_pt = cntr_point_triangle[0]
      var m = cntr_point_triangle[4]
      var v = cntr_point_triangle[5]
      var a = cntr_point_triangle[6]

      var temp = vec3.scale(zero(), a, dt / m)
      var v = vec3.add(v, v, temp)
      // log(vec3.len(v))
      var temp = vec3.scale(temp, v, dt)

      vec3.add(cntr_pt, cntr_pt, temp)
    }
  }

  var light = cntr_point_triangle_ary[0][0]
  var light_color_v = [0.8, 0.8, 0]

  for (var cptal = 0; cptal < cntr_point_triangle_ary.length; ++cptal) {
    var cntr_point_triangle = cntr_point_triangle_ary[cptal]

    var scal = cntr_point_triangle[1]
    var points = cntr_point_triangle[2]
    var triangles = cntr_point_triangle[3]
    var offset = verticies.length / 6

    var cntr_pt = cntr_point_triangle[0]

    var color_dot = cptal && unit(vec3.sub(zero(), light, cntr_pt), 1)

    for (var i = 0; i < points.length; ++i) {
      var point = points[i][0]
      var color = points[i][1]
      verticies.push(parseFloat(cntr_pt[0] + scal * point[0]))
      verticies.push(parseFloat(cntr_pt[1] + scal * point[1]))
      verticies.push(parseFloat(cntr_pt[2] + scal * point[2]))
      if (cptal) {
        var dot = vec3.dot(point, color_dot)
        verticies.push(0)
        verticies.push(0)
        verticies.push(dot)
      } else {
        verticies.push(color[0])//light_color_v[0])
        verticies.push(color[1])//light_color_v[1])
        verticies.push(color[2])//light_color_v[2])
      }

    }

    for (var i = 0; i < triangles.length; ++i) {
      var triangle = triangles[i]
      indicies.push(offset + triangle[0])
      indicies.push(offset + triangle[1])
      indicies.push(offset + triangle[2])
    }
  }

  return [verticies, indicies]
}

function InitDemo() {
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
	mat4.perspective(projMatrix, glMatrix.toRadian(45),
    canvas.width / canvas.height, 0.1, 1000.0);

  var xColor = [1,0,0]
  var yColor = [0,1,0]
  var zColor = [0,0,1]

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	// gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;

  var p_now = () => performance.now() / 1000

  var prevTime = p_now() - 0.01
	var loop = function () {
    now = p_now()
    var dt = now - prevTime
    prevTime = now
    // log(dt)

    var verticies_indicies = get_verticies_indicies(dt)
    var indicies = verticies_indicies[1]
    createArray(gl, program, verticies_indicies)

		angle = p_now() * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle / 1000, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 1000, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    {
      var a = angle / 20
      var cos = Math.cos(a)
      var sin = Math.sin(a)

      // var p = cntr_point_triangle_ary[3][0]
      // var up = vec3.scale(zero(), p, -4)

      mat4.lookAt(viewMatrix, [0, 0, -2 * Z], [0, 0, 0], [1, 0, 0]);
      // mat4.lookAt(viewMatrix, [0, 0, -2 * Z * Z_s], p, up);
      gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

      gl.uniform3fv(vecXColorUniformLocation, [cos,sin,0])
      gl.uniform3fv(vecYColorUniformLocation, [0,cos,sin])
      gl.uniform3fv(vecZColorUniformLocation, [sin,0,cos])

      // gl.uniform3fv(vecXColorUniformLocation, [0,0,-1])
      // gl.uniform3fv(vecYColorUniformLocation, [0,0,-1])
      // gl.uniform3fv(vecZColorUniformLocation, [0,0,-1])
    }

		gl.clearColor(bg_C,bg_C,bg_C,1)//0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}
