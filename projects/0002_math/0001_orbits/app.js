log = console.log

pi = Math.PI
sin = Math.sin
cos = Math.cos
rand = Math.random
sqrt = Math.sqrt
floor = Math.floor

E = 0.59

A = E*E/2 + 1
B = E*E / 4
C = -2*E
Ap = A * pi

f = x => A*x + B*sin(2*x) + C*sin(x)
d = x => (1 - E*cos(x))*(1 - E*cos(x))

k = 4.38
r1 = Ap * floor(k / Ap)
r2 = r1 + Ap

k1 = k-r1

log(k1)
