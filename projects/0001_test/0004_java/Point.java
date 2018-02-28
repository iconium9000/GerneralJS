import java.awt.Color;
import java.awt.Graphics;
public class Point {
  protected static int maxX = 400, maxY = 400, minX = 0, minY = 0; //default values
  protected double x,y; // location of the Point
  public Color color; // the color used to draw the Point
  public Point() {
    this(
      Math.random() * (maxX - minX) + minY,
      Math.random() * (maxY - minY) + minY);
  }
  public Point(double x, double y) {
    setX(x);
    setY(y);
  }
  public double getX() {
    return x;
  }
  public double getY() {
    return y;
  }
  public void setX(double x) {
    return x > maxX ? maxX : x < minX ? minX : x;
  }
  public void setY(double y) {
    return y > maxY ? maxY : y < minY ? minY : y;
  }
  static public void setMaxX(int maxX) { Point.maxX = maxX; }
  static public void setMaxY(int maxY) { Point.maxY = maxY; }
  static public void setMinX(int minX) { Point.minX = minX; }
  static public void setMinY(int minY) { Point.minY = minY; }

  public static int getMaxX() { return maxX; }
  public static int getMaxY() { return maxY; }
  public static int getMinX() { return minX; }
  public static int getMinY() { return minY; }
  public int roundX() {return Util.round(x);}
  public int roundY() {return Util.round(y);}
  public String toString() {
    return "(" + x + "," + y+ ")";
  }
  public void draw(Graphics g) {
    g.fillOval(Util.round(x-1.5),Util.round(y-1.5),3,3);
  }
  public void move(Vect a) {
    x += a.vx;
    y += a.vy;
  }
  public boolean equals(Object o) {
    try {
      Point p = (Point)o;
      return p.x == x && p.y == y;
    }
    catch (Exception e) {
      return false;
    }
  }
  public double getDistance(Point p) {
    double dx = x - p.x;
    double dy = y - p.y;
		return Math.sqrt(dx*dx + dy*dy);
  }
}
