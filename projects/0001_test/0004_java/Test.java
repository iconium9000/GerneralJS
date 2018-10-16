

class Test {

  static int bla = 0;
  static int move(int i) {
    try {
      // Integer.parseInt("4.5");
      int y = 1/i;
    }
    finally {
      System.out.println("finally");
    }
    return 0;
  }

  public static void main(String[] a) {

    Object o = null;
    String s= (String)o;

    try {}
    System.out.println((String)o);


    // try {
      // System.out.println(move(0));
    // }
    // catch (java.lang.ArithmeticException e) {
    //   System.out.println("ArithmeticException: " + e);
    // }
    // catch (RuntimeException e) {
    //   System.out.println("RuntimeException: " + e);
    // }


    // System.out.println(move(4));
    // System.out.println(move(9));
    // System.out.println(move(-3));
  }

}
